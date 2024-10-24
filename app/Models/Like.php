<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'user_id', 'comment_id'];

    public static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (!$model->post_id && !$model->comment_id) {
                throw new \Exception('A like must be associated with either a post or a comment.');
            }
        });
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'comment_id');
    }
}



