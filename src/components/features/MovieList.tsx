import { RoomMovie, Vote, User } from '@/types';
import { getImageUrl } from '@/lib/tmdb';
import { ThumbsUp, CheckCheck, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MovieListProps {
    movies: RoomMovie[];
    votes: Vote[];
    users: User[];
    currentUserId?: string;
    type: 'matches' | 'history' | 'user_list';
    onMarkSeen?: (id: string, rating: number) => void;
}

export function MovieList({ movies, votes, users, currentUserId, type, onMarkSeen }: MovieListProps) {

    // Calculate matches:
    // For 'matches', we need movies where EVERY user in the room has 'like'.
    // We can simplify for 2 users: if there are 2 likes (or added_by + 1 like).

    // Actually, we should filter based on the 'type'

    const filteredMovies = movies.filter(m => {
        if (type === 'history') return m.status === 'seen';

        // For matches and lists, status must be pending
        if (m.status !== 'pending') return false;

        // Logic for 'Match'
        const movieVotes = votes.filter(v => v.room_movie_id === m.id);

        // Check if 'Match' (Likes from both or all)
        // Since this is designed for 2 people primarily, let's say:
        // If there are multiple users, we need likes from both.
        // If currentUser is alone, show likes.

        // Robust Logic:
        const userIds = users.map(u => u.id);
        const likes = movieVotes.filter(v => v.vote === 'like').map(v => v.user_id);
        const dislikes = movieVotes.filter(v => v.vote === 'dislike').map(v => v.user_id);

        if (type === 'matches') {
            // It's a match if every user in the room has liked it.
            if (users.length > 1) {
                return userIds.every(uid => likes.includes(uid));
            } else {
                return likes.includes(currentUserId || '');
            }
        }

        if (type === 'user_list' && currentUserId) {
            // List for specific user (currentUserId passed as prop is the target user here)
            // Show movies liked by target user
            // BUT NOT matched (so exclude if everyone liked)
            const likedByTarget = likes.includes(currentUserId);
            const matched = userIds.every(uid => likes.includes(uid));

            return likedByTarget && !dislikes.includes(currentUserId);
        }

        return false;
    });

    return (
        <div className="space-y-4 pb-20">
            {filteredMovies.map(movie => (
                <div key={movie.id} className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden flex gap-3 p-3">
                    <img
                        src={getImageUrl(movie.snapshot.poster_path) || ''}
                        alt={movie.snapshot.title}
                        className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg">{movie.snapshot.title}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2">{movie.snapshot.overview}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex -space-x-2">
                                {/* Avatars of likers */}
                                {votes.filter(v => v.room_movie_id === movie.id && v.vote === 'like').map(v => {
                                    const u = users.find(user => user.id === v.user_id);
                                    return (
                                        <div key={v.id} className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] ring-2 ring-slate-900" title={u?.name}>
                                            {u?.name?.[0]}
                                        </div>
                                    )
                                })}
                            </div>

                            {type === 'matches' && onMarkSeen && (
                                <Button
                                    size="sm"
                                    onClick={() => onMarkSeen(movie.id, 10)} // Default 10 for now, implement modal later
                                    className="h-8 bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0"
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" /> Mark Seen
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {filteredMovies.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    {type === 'matches' ? "No matches yet. Keep voting!" : "No history yet."}
                </div>
            )}
        </div>
    );
}
