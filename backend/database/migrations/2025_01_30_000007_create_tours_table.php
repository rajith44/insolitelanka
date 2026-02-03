<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->json('category_ids')->nullable();
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('short_title')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('main_media_id')->nullable();
            $table->decimal('price_per_person', 12, 2)->default(0);
            $table->string('duration', 100)->nullable();
            $table->unsignedInteger('max_people')->default(0);
            $table->string('country_id', 10)->nullable();
            $table->text('included')->nullable();
            $table->text('excluded')->nullable();
            $table->text('highlights')->nullable();
            $table->text('map_embed')->nullable();
            $table->string('video_url')->nullable();
            $table->json('itinerary')->nullable();
            $table->json('faq')->nullable();
            $table->json('extra_services')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
