<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use Auth;
use Illuminate\Http\Request;
use Log;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'post_id' => 'required|exists:posts,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $comment = Comment::create([
            'content' => $request->input('content'),
            'post_id' => $request->input('post_id'),
            'user_id' => $request->input('user_id'),
        ]);

        return response()->json($comment, 201);
    }

    public function index($postId)
    {
        $comments = Comment::where('post_id', $postId)->with('user')->get();
        return response()->json($comments);
    }

    
    


}
