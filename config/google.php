<?php

return [
    // Esto fuerza a que el SDK de Google Cloud use la comunicación por 'mensajes de texto' (REST)
    // en lugar de la comunicación por 'teléfono' (gRPC) que causa el error.
    'default_transport' => 'rest', 
    
    // Configuraciones específicas para Firestore (para asegurar)
    'firestore' => [
        'transport' => 'rest',
    ],
];