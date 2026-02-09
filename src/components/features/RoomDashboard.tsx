import { useState, useEffect } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { MovieSearch } from './MovieSearch';
import { MovieVoting } from './MovieVoting';
import { MovieList } from './MovieList';
import { Loader2, Plus, Film, CheckCircle2, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecideModal } from './DecideModal';

export default function RoomDashboard({ code }: { code: string }) {
    const { room, currentUser, loading, addMovie, submitVote, markAsSeen } = useRoom(code);
    const [activeTab, setActiveTab] = useState<'voting' | 'matches' | 'lists' | 'history'>('voting');
    const [showSearch, setShowSearch] = useState(false);
    const [showDecide, setShowDecide] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!room) return <div className="text-white">Room not found</div>;

    const pendingMovies = room.movies.filter(m => m.status === 'pending');

    // Logic to filter movies user hasn't voted on (for voting tab)
    const myMoviesToVote = pendingMovies.filter(m => {
        const myVote = room.votes.find(v => v.room_movie_id === m.id && v.user_id === currentUser?.id);
        return !myVote; // Show if I haven't voted
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="fixed top-0 z-10 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-lg font-bold">Room {code}</h1>
                    <p className="text-xs text-slate-400">{room.users.length} member{room.users.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowSearch(true)}
                    className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full text-white shadow-lg shadow-purple-900/50"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </header>

            {/* Main Content */}
            <main className="pt-20 px-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'voting' && (
                        <motion.div
                            key="voting"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">Discover</h2>
                            {myMoviesToVote.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                    <Film className="h-16 w-16 mb-4" />
                                    <p>No movies to vote on.</p>
                                    <p className="text-sm">Add some or wait for your partner!</p>
                                </div>
                            ) : (
                                <MovieVoting
                                    movies={myMoviesToVote}
                                    onVote={submitVote}
                                />
                            )}
                        </motion.div>
                    )}


                    {activeTab === 'matches' && (
                        <motion.div
                            key="matches"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Matches</h2>
                                <button
                                    onClick={() => setShowDecide(true)}
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                                >
                                    <Sparkles className="h-4 w-4" /> Pick for Us
                                </button>
                            </div>

                            <MovieList
                                movies={room.movies}
                                votes={room.votes}
                                users={room.users}
                                currentUserId={currentUser?.id}
                                type="matches"
                                onMarkSeen={markAsSeen}
                            />
                        </motion.div>
                    )}

                    {/* ... Lists ... */}
                    {activeTab === 'lists' && (
                        <motion.div
                            key="lists"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {room.users.map(user => (
                                <div key={user.id}>
                                    <h3 className="text-xl font-bold mb-3 text-purple-300">{user.name}'s Picks</h3>
                                    <MovieList
                                        movies={room.movies}
                                        votes={room.votes}
                                        users={room.users}
                                        currentUserId={user.id} // Pass this user as target
                                        type="user_list"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h2 className="text-2xl font-bold mb-4">History</h2>
                            <MovieList
                                movies={room.movies}
                                votes={room.votes}
                                users={room.users}
                                currentUserId={currentUser?.id}
                                type="history"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-white/10 flex justify-around p-3 pb-6">
                <button
                    onClick={() => setActiveTab('voting')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'voting' ? 'text-purple-400' : 'text-slate-500'}`}
                >
                    <Film className="h-6 w-6" />
                    <span className="text-xs">Vote</span>
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'matches' ? 'text-pink-400' : 'text-slate-500'}`}
                >
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-xs">Matches</span>
                </button>
                <button
                    onClick={() => setActiveTab('lists')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'lists' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                    <Users className="h-6 w-6" />
                    <span className="text-xs">Lists</span>
                </button>
                {/* Add more tabs if needed like 'Rejected' or 'History' */}
            </nav>

            <AnimatePresence>
                {showSearch && (
                    <MovieSearch
                        onClose={() => setShowSearch(false)}
                        onAdd={(m) => {
                            addMovie(m);
                            setShowSearch(false);
                        }}
                    />
                )}
                {showDecide && room && (
                    <DecideModal
                        matches={room.movies.filter(m => {
                            // Filter logic matching "matches" logic in MovieList...
                            // To keep it simple, we trust the logic there, but here we duplicate it briefly or assume room.movies has filtered list?
                            // No room.movies is all.
                            // We need the same logic.
                            // Reusing logic:
                            const userIds = room.users.map(u => u.id);
                            const movieVotes = room.votes.filter(v => v.room_movie_id === m.id);
                            const likes = movieVotes.filter(v => v.vote === 'like').map(v => v.user_id);
                            if (m.status !== 'pending') return false;
                            if (room.users.length > 1) {
                                return userIds.every(uid => likes.includes(uid));
                            } else {
                                return likes.includes(currentUser?.id || '');
                            }
                        })}
                        onClose={() => setShowDecide(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
