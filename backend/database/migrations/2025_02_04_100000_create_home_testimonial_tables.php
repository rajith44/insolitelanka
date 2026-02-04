<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_testimonial_section', function (Blueprint $table) {
            $table->id();
            $table->string('section_badge')->nullable();
            $table->string('section_heading')->nullable();
            $table->timestamps();
        });

        Schema::create('home_testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('person_name')->nullable();
            $table->string('country')->nullable();
            $table->string('date')->nullable();
            $table->text('person_comment')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_testimonials');
        Schema::dropIfExists('home_testimonial_section');
    }
};
