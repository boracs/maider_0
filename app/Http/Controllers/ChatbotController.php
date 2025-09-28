<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

class ChatbotController extends Controller
{
    /**
     * Maneja el mensaje del usuario y devuelve una respuesta generada por Gemini.
     * La lógica incluye memoria conversacional y la herramienta de búsqueda de Google (Grounding).
     */
    public function handleMessage(Request $request)
    {
        // 1. Validación: Aceptamos el formato simple del frontend (rol y texto).
        $validated = $request->validate([
            'history' => 'required|array',
            'history.*.role' => 'required|in:user,model', // Rol del mensaje
            'history.*.text' => 'required|string',        // Contenido del mensaje
        ]);

        // 2. Acceso a la clave API de forma segura.
        $apiKey = Config::get('services.gemini.key');
        
        if (empty($apiKey)) {
            return response()->json(['message' => 'Error: La clave GEMINI_API_KEY no está configurada.'], 500);
        }

        // 3. Normalización de los mensajes para el formato estricto de Gemini.
        // El frontend envía {role, text}, pero Gemini espera {role, parts: [{text}]}
        $geminiContents = array_map(function ($message) {
            return [
                'role' => $message['role'],
                'parts' => [
                    ['text' => $message['text']]
                ]
            ];
        }, $validated['history']);

        // 4. Preparación del System Instruction y URL
        $systemPrompt = "Actúa como un asistente amable y experto llamado Maider, enfocado en dar respuestas concisas y útiles. Mantén la personalidad de Maider.";
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

        // 5. Construcción del Payload con Grounding Corregido
        $payload = [
            'contents' => $geminiContents, 
            
            // System Instruction (Instrucciones para definir la personalidad del bot)
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ],
            
            // Grounding Tool: Habilita la búsqueda en Google para información en tiempo real.
            // ESTA ES LA ESTRUCTURA CORREGIDA QUE RESUELVE EL ERROR 500.
            'tools' => [
                ['google_search' => new \stdClass()] 
            ],

            // Configuración de generación
            'generationConfig' => [
                'maxOutputTokens' => 1024,
                'topP' => 0.8,
                'topK' => 40,
                'candidateCount' => 1
            ]
        ];

        // 6. Llamada a la API de Gemini
        try {
            $response = Http::post($apiUrl, $payload);
            $responseData = $response->json();

            // Manejo de errores de la API
            if ($response->failed() || !isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                $errorMessage = "Error de la API de Gemini: " . ($responseData['error']['message'] ?? 'Respuesta no válida.');
                // Loguea la respuesta completa para debugging
                \Log::error('Gemini API Error Response:', $responseData); 
                return response()->json(['message' => $errorMessage], $response->status());
            }

            // Extracción de la respuesta
            $geminiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'];

            // 7. Devolver la respuesta al frontend
            return response()->json([
                'message' => $geminiResponse,
            ]);

        } catch (\Exception $e) {
            // Manejo de errores de red o excepciones generales de PHP
            \Log::error('Chatbot Controller Exception:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error interno del servidor al comunicarse con la IA.'], 500);
        }
    }
}
