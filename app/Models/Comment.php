<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['content', 'post_id', 'user_id'];

    // Un commentaire appartient à un post
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // Un commentaire appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
{
    return $this->hasMany(Like::class, 'comment_id');
}
}
