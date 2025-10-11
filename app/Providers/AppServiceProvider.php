<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Google\Cloud\Firestore\FirestoreClient; //  NECESARIA estoas dos lineas  lo hice metiend e instalando  composer require google/cloud
use Google\Cloud\Core\ServiceBuilder;      //

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 🚨 CAMBIO: Inicialización directa de FirestoreClient para asegurar el modo REST
        $this->app->singleton(FirestoreClient::class, function ($app) {
            return new FirestoreClient([
                'projectId' => env('FIREBASE_PROJECT_ID'),
                'keyFilePath' => env('FIREBASE_CREDENTIALS'),
                'transport' => 'rest', // ¡FORZANDO REST!
            ]);
        });

        // Binding para tu servicio
        $this->app->bind(\App\Services\FirestoreService::class, function ($app) {
            return new \App\Services\FirestoreService($app->make(FirestoreClient::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Inertia::setRootView('app');
    }
}
