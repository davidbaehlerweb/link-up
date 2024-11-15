<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;



Route::post('register', [AuthController::class, 'register']);
Route::post('check-email', [AuthController::class, 'checkEmail']);
Route::post('login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::delete('/user/delete', [AuthController::class, 'deleteAccount'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->put('/user/update-name', [AuthController::class, 'updateUserName']);
Route::middleware('auth:sanctum')->put('/user/update-email', [AuthController::class, 'updateUserEmail']);
Route::middleware('auth:sanctum')->put('/user/update-password', [AuthController::class, 'updateUserPassword']);
Route::middleware('auth:sanctum')->put('/user/update', [AuthController::class, 'updateUser']);


Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'getUser']);


Route::get('/posts', [PostController::class, 'index'])->middleware('auth:sanctum');

Route::post('/posts', [PostController::class, 'store']);
    



Route::post('/comments', [CommentController::class, 'store']);
Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);

Route::post('/posts/{id}/like', [PostController::class, 'likePost']);
Route::delete('/posts/{id}/delete-image', [PostController::class, 'deleteImage']);
Route::delete('/posts/{id}', [PostController::class, 'destroy'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->post('/posts/{id}/update', [PostController::class, 'update']);



Route::middleware('auth:sanctum')->post('/comments/{commentId}/like', [CommentController::class, 'likeComment']);

Route::middleware('auth:sanctum')->get('/user/posts', [PostController::class, 'getUserPosts']);

Route::middleware('auth:sanctum')->post('/user/profile-image', [AuthController::class, 'updateProfileImage']);

Route::middleware('auth:sanctum')->post('/user/background-image', [AuthController::class, 'updateBackgroundImage']);

Route::get('/users', [AuthController::class, 'getAllUsers'])->middleware('auth:sanctum');

// Route pour récupérer un utilisateur par ID
Route::middleware('auth:sanctum')->get('/users/{id}', [AuthController::class, 'getUserById']);

Route::middleware('auth:sanctum')->get('/users/{id}/posts', [PostController::class, 'getPostsByUserId']);

Route::middleware('auth:sanctum')->post('/friend-requests', [AuthController::class, 'sendFriendRequest']);


Route::middleware('auth:sanctum')->post('/friend-requests/{id}/accept', [AuthController::class, 'acceptFriendRequest']);

Route::middleware('auth:sanctum')->get('/friend-requests/retrieve', [AuthController::class, 'getFriendRequests']);

Route::middleware('auth:sanctum')->post('/friend-requests/{id}/reject', [AuthController::class, 'rejectFriendRequest']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/friends', [AuthController::class, 'addFriend']); // Pour ajouter un ami
    Route::get('/friends', [AuthController::class, 'getFriends']); // Pour obtenir la liste des amis
});




Route::middleware('auth:sanctum')->group(function () {
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{userId}', [MessageController::class, 'getMessages']);
});
Route::middleware('auth:sanctum')->get('/messages/unread-count', [MessageController::class, 'getUnreadMessagesCount']);
Route::middleware('auth:sanctum')->post('/messages/{userId}/mark-as-read', [MessageController::class, 'markMessagesAsRead']);



Route::get('auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::post('auth/google', [AuthController::class, 'handleGoogleCallback']);
