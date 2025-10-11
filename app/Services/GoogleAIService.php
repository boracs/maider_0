<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException; // Para atrapar errores 4xx
use GuzzleHttp\Exception\ServerException; // Para atrapar errores 5xx

/**
 * Servicio para interactuar con la API de Google Gemini.
 */
class GoogleAIService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    protected $model = 'gemini-2.5-flash-preview-05-20';
    protected $structuredModel = 'gemini-2.5-flash-preview-05-20'; // Usamos el mismo modelo para structured output

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');

        // 🚨 CRÍTICO: Comprobación de la clave de API. Si falla aquí, causará un 500.
        if (empty($this->apiKey)) {
            throw new \Exception("La clave de API de Gemini (GEMINI_API_KEY) no está configurada en el entorno.");
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 30.0,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Genera contenido basado en el historial de chat y la instrucción del sistema.
     * @param array $history Historial de mensajes (role, text).
     * @param string $systemInstruction Instrucción de comportamiento para el LLM.
     * @return string
     */
    public function generateContent(array $history, string $systemInstruction): string
    {
        $contents = array_map(function ($message) {
            return [
                'role' => $message['role'] === 'model' ? 'model' : 'user', // Asegurar roles correctos
                'parts' => [['text' => $message['text']]],
            ];
        }, $history);

        $payload = [
            'contents' => $contents,
            'systemInstruction' => ['parts' => [['text' => $systemInstruction]]],
            // Usamos Google Search para grounding (opcional, pero mejora la precisión)
            'tools' => [['google_search' => new \stdClass()]],
        ];

        try {
            $response = $this->client->post("{$this->model}:generateContent?key={$this->apiKey}", [
                'json' => $payload,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            // Extraer el texto de la respuesta
            return $result['candidates'][0]['content']['parts'][0]['text'] ?? 'Maider no pudo generar una respuesta.';

        } catch (ClientException $e) {
            // Captura errores 4xx (p. ej., 403 Forbidden por API Key inválida)
            $errorMessage = "Error de Cliente (4xx) al llamar a Gemini: " . $e->getResponse()->getBody()->getContents();
            Log::error($errorMessage);
            throw new \Exception("Fallo en la conexión a Gemini. Revisa tu clave API o permisos. Detalle: " . $errorMessage);
        } catch (ServerException $e) {
            // Captura errores 5xx (p. ej., error interno del servidor de Gemini)
            $errorMessage = "Error de Servidor (5xx) al llamar a Gemini: " . $e->getResponse()->getBody()->getContents();
            Log::error($errorMessage);
            throw new \Exception("Fallo interno en el servidor de Gemini. Detalle: " . $errorMessage);
        } catch (\Exception $e) {
            Log::error("Error en la llamada a la API de Gemini (generateContent): " . $e->getMessage());
            // Lanza la excepción para que el ChatbotController la atrape y devuelva el error 500
            throw new \Exception("Fallo inesperado al conectar con Gemini: " . $e->getMessage()); 
        }
    }

    /**
     * Genera contenido estructurado (JSON) basado en un prompt y un esquema JSON.
     * @param string $prompt La pregunta o tarea.
     * @param array $schema El JSON Schema esperado para la respuesta.
     * @return string El JSON de respuesta como string.
     */
    public function generateStructuredContent(string $prompt, array $schema): string
    {
        $payload = [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'responseMimeType' => "application/json",
                'responseSchema' => $schema
            ],
        ];

        try {
            $response = $this->client->post("{$this->structuredModel}:generateContent?key={$this->apiKey}", [
                'json' => $payload,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            // La respuesta estructurada viene como texto JSON
            return $result['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

        } catch (\Exception $e) {
            Log::error("Error en la llamada a la API de Gemini (generateStructuredContent): " . $e->getMessage());
            // En operaciones de fondo, devolvemos un JSON vacío para no romper.
            return '[]'; 
        }
    }
}
