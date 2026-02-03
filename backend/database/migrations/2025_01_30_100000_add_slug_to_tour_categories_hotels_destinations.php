<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_categories', function (Blueprint $table) {
            $table->string('slug', 200)->nullable()->after('title');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->string('slug', 200)->nullable()->after('name');
        });

        Schema::table('destinations', function (Blueprint $table) {
            $table->string('slug', 200)->nullable()->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('tour_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
