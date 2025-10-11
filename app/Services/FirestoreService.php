<?php
namespace App\Services;

use Google\Cloud\Firestore\FirestoreClient;
use Illuminate\Support\Facades\Log;

/**
 * Servicio para gestionar la lectura y escritura de Artefactos de Memoria a Largo Plazo
 * en Firestore.
 * * Los artefactos se guardan de forma privada para cada usuario en:
 * /artifacts/{appId}/users/{userId}/artifacts/{artifactKey}
 * * NOTA: El cliente de Firestore ahora debe inyectarse (pasarse) desde el controlador 
 * para garantizar que la configuración 'transport' => 'rest' se aplique sin fallos de caché.
 */
class FirestoreService
{
    protected $firestore;
    protected $appId;

   public function __construct(FirestoreClient $client) // Ahora es obligatorio inyectar el cliente
    {
        $this->firestore = $client;
        
        // Obtener el ID de la aplicación del entorno
        $this->appId = env('APP_ID', 'default-app-id');
    }

    /**
     * Obtiene todos los artefactos de memoria a largo plazo para un usuario.
     * @param string $userId El ID del usuario actual.
     * @return array
     */
    public function getArtifacts(string $userId): array
    {
        try {
            // Ruta de colección privada para artefactos: /artifacts/{appId}/users/{userId}/artifacts
            $collectionPath = "artifacts/{$this->appId}/users/{$userId}/artifacts";
            $collectionRef = $this->firestore->collection($collectionPath);

            $artifacts = [];
            $documents = $collectionRef->documents();

            foreach ($documents as $document) {
                if ($document->exists()) {
                    // Los artefactos solo tienen dos campos: 'key' (ID del documento) y 'value'.
                    $artifacts[] = [
                        'key' => $document->id(), 
                        'value' => $document->get('value')
                    ];
                }
            }

            return $artifacts;

        } catch (\Exception $e) {
            // Registra el error pero devuelve un array vacío para no romper la conversación.
            Log::warning("No se pudieron cargar los artefactos para el usuario {$userId}. Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Guarda un artefacto de memoria a largo plazo para un usuario.
     * @param string $userId El ID del usuario actual.
     * @param string $key La clave del artefacto (ej: colorFavorito).
     * @param string $value El valor del artefacto (ej: azul).
     */
    public function saveArtifact(string $userId, string $key, string $value): void
    {
        try {
            // Usamos la clave como ID del documento para sobrescribir si ya existe (Ej: si cambia el color favorito)
            $docId = $key;
            $docPath = "artifacts/{$this->appId}/users/{$userId}/artifacts/{$docId}";
            $docRef = $this->firestore->document($docPath);

            $docRef->set([
                'value' => $value,
                'updatedAt' => new \DateTimeImmutable(),
            ], ['merge' => true]); // Usamos merge para no borrar otros campos si existen.

        } catch (\Exception $e) {
            Log::error("Error al guardar artefacto en Firestore para {$userId}. Key: {$key}. Error: " . $e->getMessage());
            // No hacemos throw ya que es una operación de fondo.
        }
    }
}
