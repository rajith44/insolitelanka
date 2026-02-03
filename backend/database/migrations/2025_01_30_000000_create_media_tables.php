<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('media')) {
            Schema::create('media', function (Blueprint $table) {
                $table->id();
                $table->string('media_ref')->nullable();
                $table->unsignedBigInteger('restaurant_id')->nullable();
                $table->string('file_name');
                $table->string('real_name')->nullable();
                $table->string('extension', 20)->nullable();
                $table->string('type', 100)->nullable();
                $table->string('path')->nullable();
                $table->string('url')->nullable();
                $table->unsignedBigInteger('size')->default(0);
                $table->boolean('is_active')->default(1);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('media_thumbnails')) {
            Schema::create('media_thumbnails', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('media_id');
                $table->unsignedInteger('size');
                $table->string('thumb_url')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('media_thumbnails');
        Schema::dropIfExists('media');
    }
};
