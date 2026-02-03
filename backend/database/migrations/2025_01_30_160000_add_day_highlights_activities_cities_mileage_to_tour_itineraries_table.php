<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->text('day_highlights')->nullable()->after('content');
            $table->text('day_activities')->nullable()->after('day_highlights');
            $table->string('from_city_id', 50)->nullable()->after('day_activities');
            $table->string('to_city_id', 50)->nullable()->after('from_city_id');
            $table->decimal('travel_mileage_km', 10, 2)->nullable()->after('to_city_id');
        });
    }

    public function down(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->dropColumn([
                'day_highlights',
                'day_activities',
                'from_city_id',
                'to_city_id',
                'travel_mileage_km',
            ]);
        });
    }
};
