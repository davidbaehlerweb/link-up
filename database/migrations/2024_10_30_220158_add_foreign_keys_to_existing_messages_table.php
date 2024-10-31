<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddForeignKeysToExistingMessagesTable extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Vérifiez si les colonnes existent avant de les ajouter
            if (!Schema::hasColumn('messages', 'sender_id')) {
                $table->unsignedBigInteger('sender_id')->after('id');
            }
            
            if (!Schema::hasColumn('messages', 'receiver_id')) {
                $table->unsignedBigInteger('receiver_id')->after('sender_id');
            }

            // Ajoutez les clés étrangères uniquement si elles n'existent pas
            $foreignKeys = DB::select("SELECT CONSTRAINT_NAME 
                                        FROM information_schema.KEY_COLUMN_USAGE 
                                        WHERE TABLE_NAME = 'messages' AND TABLE_SCHEMA = DATABASE()");

            $existingForeignKeys = collect($foreignKeys)->pluck('CONSTRAINT_NAME');

            if (!$existingForeignKeys->contains('messages_sender_id_foreign')) {
                $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (!$existingForeignKeys->contains('messages_receiver_id_foreign')) {
                $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Supprimez les clés étrangères si elles existent
            $foreignKeys = DB::select("SELECT CONSTRAINT_NAME 
                                        FROM information_schema.KEY_COLUMN_USAGE 
                                        WHERE TABLE_NAME = 'messages' AND TABLE_SCHEMA = DATABASE()");

            $existingForeignKeys = collect($foreignKeys)->pluck('CONSTRAINT_NAME');

            if ($existingForeignKeys->contains('messages_sender_id_foreign')) {
                $table->dropForeign(['sender_id']);
            }
            if ($existingForeignKeys->contains('messages_receiver_id_foreign')) {
                $table->dropForeign(['receiver_id']);
            }

            // Supprimez les colonnes si elles avaient été ajoutées
            if (Schema::hasColumn('messages', 'sender_id')) {
                $table->dropColumn('sender_id');
            }

            if (Schema::hasColumn('messages', 'receiver_id')) {
                $table->dropColumn('receiver_id');
            }
        });
    }
}
