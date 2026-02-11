<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->string('walking_time', 100)->nullable()->after('travel_mileage_km');
            $table->json('meals_included')->nullable()->after('walking_time');
            $table->string('elevation_gain', 100)->nullable()->after('meals_included');
            $table->string('elevation_loss', 100)->nullable()->after('elevation_gain');
            $table->string('distance_covered', 100)->nullable()->after('elevation_loss');
            $table->string('transfer', 255)->nullable()->after('distance_covered');
            $table->json('activity')->nullable()->after('transfer');
        });
    }

    public function down(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->dropColumn([
                'walking_time',
                'meals_included',
                'elevation_gain',
                'elevation_loss',
                'distance_covered',
                'transfer',
                'activity',
            ]);
        });
    }
};
