<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Auth;
use DB;
use Hash;
use Illuminate\Http\Request;
use Log;
use Storage;
use Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Validation de l'image
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $path = null;
        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profile_images', 'public'); // Stockage de l'image
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_image' => $path, // Enregistrez le chemin de l'image
        ]);

        return response()->json(['message' => 'Compte créé avec succès. Un email de vérification a été envoyé.']);
    }

    public function getUserById($id)
{
    $user = User::find($id);
    if ($user) {
        return response()->json($user);
    }
    return response()->json(['error' => 'User not found'], 404);
}


    public function updateProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = Auth::user(); // Assurez-vous que l'utilisateur est authentifié
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profile_images', 'public');

            // Supprimer l'ancienne image si elle existe
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            // Mettre à jour l'utilisateur avec le nouveau chemin d'image
            $user->update(['profile_image' => $path]);

            return response()->json(['profile_image' => $path], 200);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }

    public function updateBackgroundImage(Request $request)
    {
        $request->validate([
            'image_fond' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($request->hasFile('image_fond')) {
            $path = $request->file('image_fond')->store('background_images', 'public');

            // Supprimer l'ancienne image de fond si elle existe
            if ($user->image_fond) {
                Storage::disk('public')->delete($user->image_fond);
            }

            // Mettre à jour l'utilisateur avec le nouveau chemin de l'image de fond
            $user->update(['image_fond' => $path]);

            return response()->json(['image_fond' => $path], 200);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
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
        // Validation des données d'entrée
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Authentification de l'utilisateur
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('YourAppName')->plainTextToken;

            // Retournez également l'ID de l'utilisateur
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

    public function getAllUsers(Request $request)
{
    $users = User::select('id', 'email','profile_image')->get(); // Sélectionne uniquement l'id et l'email
    return response()->json($users);
}


    public function getUser(Request $request)
    {
        return response()->json([
            'user' => Auth::user(),
        ]);
    }

    public function getFriendRequests(Request $request)
{
    $user = Auth::user(); // Assurez-vous que l'utilisateur est authentifié

    $friendRequests = DB::table('friend_requests')
        ->where('receiver_id', $user->id)
        ->join('users', 'friend_requests.sender_id', '=', 'users.id')
        ->select('friend_requests.*', 'users.name', 'users.profile_image')
        ->get();

    return response()->json($friendRequests);
}



public function sendFriendRequest(Request $request)
{
    $request->validate([
        'friend_id' => 'required|exists:users,id',
    ]);

    $user = Auth::user();
    $friendId = $request->friend_id;

    // Vérifiez si l'utilisateur essaie de s'ajouter lui-même
    if ($user->id === $friendId) {
        return response()->json(['message' => 'Vous ne pouvez pas vous ajouter vous-même.'], 400);
    }

    // Vérifiez si la demande existe déjà
    $exists = DB::table('friend_requests')->where([
        ['sender_id', $user->id],
        ['receiver_id', $friendId],
    ])->exists();

    if ($exists) {
        return response()->json(['message' => 'Demande déjà envoyée.'], 409);
    }

    DB::table('friend_requests')->insert([
        'sender_id' => $user->id,
        'receiver_id' => $friendId,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return response()->json(['message' => 'Demande d\'amis envoyée.'], 201);
}


public function acceptFriendRequest($id)
{
    // Vérifiez si l'utilisateur est authentifié
    $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Vérifiez si la demande d'amis existe
    $friendRequest = DB::table('friend_requests')->where('id', $id)->where('receiver_id', $user->id)->first();

    if (!$friendRequest) {
        return response()->json(['message' => 'Demande non trouvée ou vous n\'êtes pas le destinataire.'], 404);
    }

    // Ajoutez les utilisateurs comme amis
    $friendId = $friendRequest->sender_id; // L'ID de l'utilisateur qui a envoyé la demande

    // Vérifiez si les utilisateurs sont déjà amis
    $exists = DB::table('friends')->where(function ($query) use ($user, $friendId) {
        $query->where('user_id', $user->id)->where('friend_id', $friendId);
    })->orWhere(function ($query) use ($user, $friendId) {
        $query->where('user_id', $friendId)->where('friend_id', $user->id);
    })->exists();

    if (!$exists) {
        // Ajoutez l'ami pour l'utilisateur qui accepte la demande
        DB::table('friends')->insert([
            'user_id' => $user->id,
            'friend_id' => $friendId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Ajoutez l'ami pour l'utilisateur qui a envoyé la demande
        DB::table('friends')->insert([
            'user_id' => $friendId,
            'friend_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // Supprimez la demande d'amis
    DB::table('friend_requests')->where('id', $id)->delete();

    return response()->json(['message' => 'Demande d\'amis acceptée.'], 200);
}





public function rejectFriendRequest($id)
{
    $user = Auth::user(); // Assurez-vous que l'utilisateur est authentifié

    // Vérifiez si la demande d'amis existe
    $friendRequest = DB::table('friend_requests')->where('id', $id)->where('receiver_id', $user->id)->first();

    if (!$friendRequest) {
        return response()->json(['message' => 'Demande non trouvée ou vous n\'êtes pas le destinataire.'], 404);
    }

    // Supprimez la demande d'amis
    DB::table('friend_requests')->where('id', $id)->delete();

    return response()->json(['message' => 'Demande d\'amis refusée.'], 200);
}

public function index(Request $request)
{
    // Vérifiez si l'utilisateur est authentifié
    $userId = Auth::id();
    if (!$userId) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    Log::info('User ID: ' . $userId);

    // Récupérer les IDs des amis
    $friendIds = DB::table('friends')
        ->where('user_id', $userId)
        ->pluck('friend_id')
        ->toArray();

    // Ajouter l'ID de l'utilisateur lui-même à la liste
    $friendIds[] = $userId;

    // Récupérer les posts de l'utilisateur et de ses amis
    $posts = Post::with(['user', 'likes'])
        ->whereIn('user_id', $friendIds)
        ->orderBy('created_at', 'desc')
        ->get();

    Log::info('Posts retrieved: ' . $posts->count());

    return response()->json($posts);
}


public function getFriends(Request $request)
{
    $user = Auth::user(); // Assurez-vous que l'utilisateur est authentifié

    $friends = DB::table('friends')
        ->join('users', 'friends.friend_id', '=', 'users.id')
        ->select('users.id','users.name', 'users.email', 'users.profile_image')
        ->where('friends.user_id', $user->id)
        ->get();

    return response()->json($friends);
}






}
