<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->string('from_city', 255)->nullable()->after('day_activities');
            $table->string('to_city', 255)->nullable()->after('from_city');
        });
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->dropColumn(['from_city_id', 'to_city_id']);
        });
    }

    public function down(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->string('from_city_id', 50)->nullable()->after('day_activities');
            $table->string('to_city_id', 50)->nullable()->after('from_city_id');
        });
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->dropColumn(['from_city', 'to_city']);
        });
    }
};
