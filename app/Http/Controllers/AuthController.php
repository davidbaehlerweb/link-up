<?php

namespace App\Http\Controllers;

use App\Models\User;
use Auth;
use Hash;
use Illuminate\Http\Request;
use Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Compte créé avec succès. Un email de vérification a été envoyé.']);
    }

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'L\'email est requis.',
            'email.email' => 'L\'email doit être un email valide.',
        ]);

        $emailExists = User::where('email', $request->email)->exists();

        return response()->json(['available' => !$emailExists]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('YourAppName')->plainTextToken;
    
            return response()->json(['token' => $token, 'user' => $user], 200);
        }
    
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public function logout(Request $request)
{
    // Récupère l'utilisateur authentifié
    $user = Auth::user();
    
    // Révoque tous les tokens de l'utilisateur
    $user->tokens()->delete();

    // Retourne une réponse de succès
    return response()->json(['message' => 'Déconnexion réussie'], 200);
}

public function getUser(Request $request)
{
    return response()->json([
        'user' => Auth::user(),
    ]);
}
    

}
