<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validatedData['receiver_id'],
            'content' => $validatedData['content'],
        ]);

        return response()->json($message, 201);
    }

    public function getMessages($userId)
    {
        $messages = Message::where(function ($query) use ($userId) {
                $query->where('sender_id', Auth::id())
                      ->where('receiver_id', $userId);
            })
            ->orWhere(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', Auth::id());
            })
            ->orderBy('created_at','asc')
            ->get();

        return response()->json($messages);
    }

    public function getUnreadMessagesCount()
{
    $userId = Auth::id();
    $unreadCount = Message::where('receiver_id', $userId)
                          ->where('is_read', false)
                          ->count();

    return response()->json(['unreadCount' => $unreadCount]);
}
public function markMessagesAsRead($userId)
{
    Message::where('sender_id', $userId)
           ->where('receiver_id', Auth::id())
           ->where('is_read', false)
           ->update(['is_read' => true]);

    return response()->json(['message' => 'Messages marked as read']);
}

}
