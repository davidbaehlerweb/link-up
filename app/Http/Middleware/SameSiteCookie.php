<?php

namespace App\Http\Middleware;

use Closure;

class SameSiteCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Change le paramètre SameSite pour les cookies
        config(['session.same_site' => 'none']); // ou 'lax' selon tes besoins

        return $next($request);
    }
}
