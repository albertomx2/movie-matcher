export interface User {
    id: string;
    name: string;
}

export interface Movie {
    tmdb_id: number;
    title: string;
    poster_path: string;
    overview: string;
    release_date: string;
    vote_average: number;
}

export interface RoomMovie {
    id: string; // internal uuid
    tmdb_id: number;
    added_by: string;
    room_id: string;
    status: 'pending' | 'seen' | 'archived';
    created_at: string;
    snapshot: Movie; // We'll store the basic movie data here
}

export interface Vote {
    id: string;
    room_movie_id: string;
    user_id: string;
    vote: 'like' | 'dislike' | 'maybe';
}

export interface RoomData {
    id: string;
    code: string;
    users: User[];
    movies: RoomMovie[];
    votes: Vote[];
}
