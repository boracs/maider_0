<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\GoogleAIService; 
use App\Services\FirestoreService; // Importar el servicio de Firestore

class ChatbotController extends Controller
{
    // Inyectamos ambos servicios al controlador
    public function __construct(
        protected GoogleAIService $aiService,
        protected FirestoreService $firestoreService
    ) {}

    /**
     * Maneja el mensaje entrante y llama al LLM (con memoria a largo plazo).
     */
    public function handleMessage(Request $request)
    {
        // 1. Validación Estricta
        try {
            $validated = $request->validate([
                'userId' => 'required|string',
                'history' => 'required|array',
                'history.*.role' => 'required|string|in:user,model',
                'history.*.text' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error("Error de validación en /api/chatbot/message", ['errors' => $e->errors(), 'request' => $request->all()]);
            return response()->json(['message' => 'Fallo en la validación de la solicitud.'], 400);
        }

        $userId = $validated['userId'];
        $history = $validated['history'];

        // 🚨 2. CONTROL DE SEGURIDAD (ANTI-SPOOFING)
        // Si el usuario está autenticado en Laravel, el userId enviado DEBE coincidir con su ID.
        if (auth()->check()) {
            $expectedUserId = (string)auth()->id(); // Usar el ID de Laravel, asumiendo que coincide con Firebase UID

            if ($userId != $expectedUserId) {
                Log::warning("Intento de spoofing de userId detectado.", [
                    'sent_id' => $userId, 
                    'expected_id' => $expectedUserId, 
                    'ip' => $request->ip()
                ]);
                return response()->json(['message' => 'Acción no autorizada.'], 403);
            }
        } 
        // Nota: Para usuarios anónimos ('anon-'), el rate limiting ya es la principal protección.
        
        // 3. Bloque Try/Catch para toda la lógica de servicios
        try {
            // 3.1. Lógica de Memoria a Largo Plazo - LECTURA (Firestore)
            // Se asume que el FirestoreService ya está usando el transporte REST.
            $artifacts = $this->firestoreService->getArtifacts($userId);
            
            // Convertir artefactos a JSON para la instrucción del sistema
            $longTermMemory = json_encode($artifacts); 

            // 3.2. Construir la Instrucción del Sistema con Memoria
            $systemInstruction = "Eres Maider, un chatbot amigable y servicial diseñado para ayudar a los usuarios. Responde de forma concisa y utiliza un tono profesional pero cercano. 
            ---
            RECUERDA ESTOS DATOS DEL USUARIO:
            {$longTermMemory}
            ---
            Tu objetivo principal es asistir al usuario y usar la información de la sección 'RECUERDA ESTOS DATOS DEL USUARIO' para personalizar tus respuestas. Si no hay datos, actúa con normalidad.";

            // 3.3. Llamar al servicio de IA con el historial y la memoria.
            $botMessage = $this->aiService->generateContent($history, $systemInstruction);

            // 3.4. Devolver la respuesta
            return response()->json(['message' => $botMessage]);

        } catch (\Exception $e) {
            Log::error("Error Fatal en el ChatbotController (handleMessage): " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Error interno del servidor.', 
                'debug' => 'Fallo al inicializar o conectar con servicios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recibe el mensaje del usuario, extrae artefactos con el LLM (Asíncrono).
     */
    public function extractAndSaveArtifact(Request $request)
    {
        // 1. Validación de la solicitud asíncrona
        $validated = $request->validate([
            'userId' => 'required|string',
            'latestUserMessage' => 'required|string|max:2000',
        ]);

        $userId = $validated['userId'];
        $latestUserMessage = $validated['latestUserMessage'];
        
        // 🚨 2. CONTROL DE SEGURIDAD (El mismo check que handleMessage)
        if (auth()->check()) {
            $expectedUserId = (string)auth()->id();
            if ($userId != $expectedUserId) {
                Log::warning("Intento de spoofing de userId en artefactos.", ['sent_id' => $userId]);
                return response()->json(['message' => 'Acción no autorizada.'], 403);
            }
        } 

        // 3. Definir el JSON Schema para la extracción (ya lo tenías)
        $artifactSchema = [
            'type' => 'ARRAY',
            'items' => [
                'type' => 'OBJECT',
                'properties' => [
                    'key' => ['type' => 'STRING', 'description' => 'La clave del artefacto (ej: colorFavorito, nombre, ciudad).'],
                    'value' => ['type' => 'STRING', 'description' => 'El valor asociado a la clave (ej: azul, Juan, Barcelona).']
                ]
            ]
        ];

        // 4. Pedir al LLM que analice y extraiga (Structured Output)
        $prompt = "Analiza el siguiente mensaje. Si contiene información personal o preferencias que el usuario querría que recordaras (como su nombre, color favorito, ciudad, etc.), extrae solo las claves y los valores como un array JSON. Si no hay información relevante, devuelve un array JSON vacío: []. MENSAJE: \"{$latestUserMessage}\"";
        
        try {
            // Se llama al servicio de IA para obtener una respuesta JSON estructurada.
            $jsonString = $this->aiService->generateStructuredContent($prompt, $artifactSchema);
            $extractedArtifacts = json_decode($jsonString, true);

            if (is_array($extractedArtifacts) && !empty($extractedArtifacts)) {
                // 5. Guardar en Firestore (Activado)
                foreach ($extractedArtifacts as $artifact) {
                    if (isset($artifact['key']) && isset($artifact['value'])) {
                        // Usamos el servicio de Firestore para guardar
                        $this->firestoreService->saveArtifact($userId, $artifact['key'], $artifact['value']);
                    }
                }
                Log::info("Artefactos guardados exitosamente para el usuario {$userId}.", ['artifacts' => $extractedArtifacts]);
            }

            // Devolver 200 ya que la operación fue exitosa, incluso si no había artefactos.
            return response()->json(['message' => 'Artifact extraction and saving successful.']);
        } catch (\Exception $e) {
            Log::error("Error en extractAndSaveArtifact: " . $e->getMessage());
            // Se devuelve 202 (Accepted) o 200 (OK) ya que es una operación en segundo plano 
            // y no queremos que un error de memoria rompa la experiencia del usuario.
            return response()->json(['message' => 'Artifact extraction failed but operation finished.'], 202); 
        }
    }
}