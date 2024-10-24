<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;



Route::post('register', [AuthController::class, 'register']);
Route::post('check-email', [AuthController::class, 'checkEmail']);
Route::post('login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'getUser']);


    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    // Ajoutez d'autres routes protégées ici



Route::post('/comments', [CommentController::class, 'store']);
Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);

Route::post('/posts/{id}/like', [PostController::class, 'likePost']);


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


