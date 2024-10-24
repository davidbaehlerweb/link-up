<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFriendRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['sender_id', 'receiver_id']); // Empêche les demandes de doublons
        });
    }

    public function down()
    {
        Schema::dropIfExists('friend_requests');
    }
}

