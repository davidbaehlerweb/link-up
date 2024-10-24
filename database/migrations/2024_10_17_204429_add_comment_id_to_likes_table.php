<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCommentIdToLikesTable extends Migration
{
    public function up()
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->foreignId('comment_id')->nullable()->constrained()->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropForeign(['comment_id']);
            $table->dropColumn('comment_id');
        });
    }
}

