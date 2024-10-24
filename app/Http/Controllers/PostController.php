<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Auth;
use DB;
use Illuminate\Http\Request;
use Log;

class PostController extends Controller
{
    //

    public function store(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'media_path' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi,mkv,webp',
        'user_id' => 'required|exists:users,id',
    ]);

    $filePath = null;

    // Enregistrer le fichier seulement si un fichier a été envoyé
    if ($request->hasFile('media_path')) {
        $filePath = $request->file('media_path')->store('media', 'public');
    }

    // Créer le post
    $post = Post::create([
        'title' => $request->input('title'),
        'media_path' => $filePath ? asset('storage/' . $filePath) : null, // Renvoie le chemin accessible ou null
        'user_id' => $request->input('user_id'),
    ]);

    return response()->json($post, 201);
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










public function likePost(Request $request, $id)
{
    try {
        $userId = $request->input('user_id');
        $like = Like::where('post_id', $id)->where('user_id', $userId)->first();
        $post = Post::findOrFail($id);
        
        if ($like) {
            // Supprimer le like
            $like->delete();
        } else {
            // Créer un like
            Like::create(['post_id' => $id, 'user_id' => $userId]);
        }
        
        // Calculer dynamiquement le nombre de likes
        $likeCount = Like::where('post_id', $id)->count();
        
        return response()->json(['liked' => !$like, 'likeCount' => $likeCount]);
    } catch (\Exception $e) {
        Log::error('Erreur lors du like du post: ' . $e->getMessage());
        return response()->json(['error' => 'Une erreur est survenue'], 500);
    }
}


// Ajoutez cette méthode dans PostController
public function getUserPosts(Request $request)
{
    $userId = Auth::id(); // Récupère l'ID de l'utilisateur authentifié
    $posts = Post::where('user_id', $userId)
        ->with('likes')
        ->orderBy('created_at', 'desc') // Tri par date de création décroissante
        ->get();

    return response()->json($posts);
}


public function getPostsByUserId($id)
{
    $user = User::find($id);
    
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Utilisation de la relation posts
    $posts = $user->posts()->with('comments', 'likes')->get();

    return response()->json($posts);
}












}
