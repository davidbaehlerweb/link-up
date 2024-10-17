<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;



Route::post('register', [AuthController::class, 'register']);
Route::post('check-email', [AuthController::class, 'checkEmail']);
Route::post('login', [AuthController::class, 'login'])->name('api.login');
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'getUser']);

