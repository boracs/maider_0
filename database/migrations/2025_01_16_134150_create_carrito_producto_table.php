<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


class CreateCarritoProductoTable extends Migration
{
    public function up()
    {
        Schema::create('carrito_producto', function (Blueprint $table) {
            $table->id(); // Opcional, si quieres una columna `id` autoincremental
            $table->foreignId('carrito_id')->constrained('carritos')->onDelete('cascade');
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->integer('cantidad')->default(1); // La cantidad del producto en el carrito
            $table->unique(['carrito_id', 'producto_id']); // cone sto digo que carrito_id y producto_id deberan ser unicos 
            $table->timestamps();
        });
    }
    public function down()
    {
        Schema::dropIfExists('carrito_producto');
    }
}
