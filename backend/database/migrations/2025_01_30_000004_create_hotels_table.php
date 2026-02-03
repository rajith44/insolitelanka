<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('highlights')->nullable();
            $table->decimal('price_range_min', 10, 2)->default(0);
            $table->decimal('price_range_max', 10, 2)->default(0);
            $table->unsignedTinyInteger('star')->default(3);
            $table->unsignedBigInteger('main_media_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
