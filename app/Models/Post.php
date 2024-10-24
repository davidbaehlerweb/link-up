<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'media_path', 'user_id'];

    // Relation avec le modèle User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
{
    return $this->hasMany(Comment::class);
}
public function likes()
    {
        return $this->hasMany(Like::class);
    }
}

