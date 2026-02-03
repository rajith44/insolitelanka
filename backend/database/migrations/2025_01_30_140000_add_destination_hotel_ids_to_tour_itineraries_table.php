<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->json('destination_ids')->nullable()->after('content');
            $table->json('hotel_ids')->nullable()->after('destination_ids');
        });
    }

    public function down(): void
    {
        Schema::table('tour_itineraries', function (Blueprint $table) {
            $table->dropColumn(['destination_ids', 'hotel_ids']);
        });
    }
};
