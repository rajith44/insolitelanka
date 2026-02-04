<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_phenomenal_deals', function (Blueprint $table) {
            $table->id();
            $table->string('section_badge')->nullable();
            $table->string('section_heading')->nullable();

            foreach (['card1', 'card2', 'card3', 'card4'] as $card) {
                $table->unsignedBigInteger("{$card}_media_id")->nullable();
                $table->string("{$card}_label")->nullable();
                $table->string("{$card}_title")->nullable();
                $table->string("{$card}_subtitle")->nullable();
                $table->string("{$card}_link_url")->nullable();
                $table->string("{$card}_link_text")->nullable();
                $table->string("{$card}_offer_badge")->nullable();
            }

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_phenomenal_deals');
    }
};
