import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RoomData, RoomMovie, User, Vote, Movie } from '@/types';
import { useRouter } from 'next/navigation';

export function useRoom(roomCode: string) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [room, setRoom] = useState<RoomData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize and Fetch
    useEffect(() => {
        const init = async () => {
            try {
                const userId = localStorage.getItem('movie_matcher_user_id');
                if (!userId) {
                    router.push('/');
                    return;
                }

                // Fetch Room
                const { data: roomData, error: roomError } = await supabase
                    .from('rooms')
                    .select('id, code')
                    .eq('code', roomCode)
                    .single();

                if (roomError || !roomData) throw new Error("Room not found");

                // Fetch User to verify validity
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .eq('room_id', roomData.id)
                    .single();

                if (userError || !userData) {
                    // User might be from another room or invalid
                    localStorage.removeItem('movie_matcher_user_id');
                    router.push('/');
                    return;
                }

                setCurrentUser(userData);

                // Fetch Full State
                await fetchRoomState(roomData.id);

                // Subscribe to Realtime
                const channel = supabase.channel(`room:${roomData.id}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: `room_id=eq.${roomData.id}` }, () => fetchRoomState(roomData.id))
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_movies', filter: `room_id=eq.${roomData.id}` }, () => fetchRoomState(roomData.id))
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchRoomState(roomData.id))
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [roomCode, router]);

    const fetchRoomState = async (roomId: string) => {
        const { data: users } = await supabase.from('users').select('*').eq('room_id', roomId);

        // Fetch room_movies with joined movies data
        const { data: moviesData } = await supabase
            .from('room_movies')
            .select('*, movie_data:movies(*)') // Join with movies table
            .eq('room_id', roomId);

        // We need to fetch votes for these movies
        let votes: Vote[] = [];
        if (moviesData && moviesData.length > 0) {
            const movieIds = moviesData.map(m => m.id);
            const { data: votesData } = await supabase.from('votes').select('*').in('room_movie_id', movieIds);
            if (votesData) votes = votesData as unknown as Vote[];
        }

        const formattedMovies = (moviesData || []).map((m: any) => {
            // Robustly extract movie data
            // Supabase returns joined data in the property name we asked for ('movie_data')
            // It might be an array or an object depending on relationship (here it's 1:1 via tmdb_id, returns object)
            const movieDetails = m.movie_data || {};

            // If movieDetails has a 'data' property (because our movies table has a jsonb column named 'data'), use that.
            // Otherwise, check if the fields are top-level on movieDetails.
            const realDetails = movieDetails.data || movieDetails;

            return {
                ...m,
                snapshot: realDetails,
                tmdb_id: m.tmdb_id,
                id: m.id
            };
        });

        // Debug logging to help identify why lists might be empty
        // console.log("Fetched Room State:", { users, movies: formattedMovies, votes });

        setRoom({
            id: roomId,
            code: roomCode,
            users: users || [],
            movies: formattedMovies as RoomMovie[],
            votes: votes || []
        });
    };

    const addMovie = async (movie: Movie) => {
        if (!room || !currentUser) return;

        // Check if already exists
        if (room.movies.some(m => m.tmdb_id === movie.tmdb_id)) return;

        // 1. Ensure movie in 'movies' cache table
        await supabase.from('movies').upsert({
            tmdb_id: movie.tmdb_id,
            data: movie,
            updated_at: new Date().toISOString()
        });

        // 2. Add to room (Trigger will be absent, so we do it manually)
        const { data: roomMovie, error } = await supabase.from('room_movies').insert({
            room_id: room.id,
            tmdb_id: movie.tmdb_id,
            added_by: currentUser.id,
            status: 'pending'
        }).select().single();

        if (error) {
            console.error("Error adding movie", error);
            return;
        }

        // 3. Auto-vote LIKE for creator
        await supabase.from('votes').insert({
            room_movie_id: roomMovie.id,
            user_id: currentUser.id,
            vote: 'like'
        });
    };

    const submitVote = async (roomMovieId: string, voteType: 'like' | 'dislike' | 'maybe') => {
        if (!currentUser) return;

        // Upsert vote
        const { error } = await supabase.from('votes').upsert({
            room_movie_id: roomMovieId,
            user_id: currentUser.id,
            vote: voteType
        }, { onConflict: 'room_movie_id,user_id' });

        if (error) console.error("Error voting", error);
    };

    const markAsSeen = async (roomMovieId: string, rating: number) => {
        // First update status
        await supabase.from('room_movies').update({ status: 'seen' }).eq('id', roomMovieId);

        // Then add rating
        if (!currentUser) return;
        await supabase.from('ratings').insert({
            room_movie_id: roomMovieId,
            user_id: currentUser.id,
            score: rating
        });
    };

    return {
        room,
        currentUser,
        loading,
        error,
        addMovie,
        submitVote,
        markAsSeen
    };
}
