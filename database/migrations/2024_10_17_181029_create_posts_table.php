<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePostsTable extends Migration
{
    public function up()
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id(); // ID auto-incrémenté
            $table->string('title'); // Titre du post
            $table->string('media_path')->nullable(); // Chemin de l'image ou de la vidéo
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // ID de l'utilisateur avec contrainte de clé étrangère
            $table->timestamps(); // Créé_at et mis à jour_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('posts');
    }
}

