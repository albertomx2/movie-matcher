const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
const BASE_URL = 'https://api.themoviedb.org/3';

export const getMovieDetails = async (movieId: number) => {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=videos,credits`);
    if (!res.ok) throw new Error('Failed to fetch movie details');
    return res.json();
};

export const searchMovies = async (query: string) => {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&include_adult=false`);
    if (!res.ok) throw new Error('Failed to search movies');
    const data = await res.json();
    return data.results;
};

export const getTrendingMovies = async () => {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=es-ES`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    const data = await res.json();
    return data.results;
}

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
};
