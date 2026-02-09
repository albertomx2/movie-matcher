import { useState } from 'react';
import { RoomMovie, User, Vote } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/tmdb';
import { X, Check, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MovieVotingProps {
    movies: RoomMovie[];
    onVote: (roomMovieId: string, vote: 'like' | 'dislike' | 'maybe') => void;
}

export function MovieVoting({ movies, onVote }: MovieVotingProps) {
    // We only show one movie at a time for focus
    const [index, setIndex] = useState(0);

    const currentMovie = movies[index];

    const handleVote = (vote: 'like' | 'dislike' | 'maybe') => {
        if (!currentMovie) return;
        onVote(currentMovie.id, vote);
        setIndex(prev => prev + 1);
    };

    if (!currentMovie) {
        return (
            <div className="text-center py-20">
                <h3 className="text-xl font-semibold mb-2">You're all caught up!</h3>
                <p className="text-slate-400">Wait for your partner to add more movies.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[70vh] w-full max-w-md mx-auto relative cursor-grab active:cursor-grabbing">
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={currentMovie.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0, x: -100 }} // Simple exit
                    className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                >
                    <img
                        src={getImageUrl(currentMovie.snapshot.poster_path, 'original') || ''}
                        alt={currentMovie.snapshot.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <div className="absolute bottom-0 w-full p-6 pb-8">
                        <h2 className="text-3xl font-bold mb-2 leading-tight">{currentMovie.snapshot.title}</h2>
                        <p className="text-sm text-slate-300 line-clamp-3 mb-4">{currentMovie.snapshot.overview}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{currentMovie.snapshot.release_date?.split('-')[0]}</span>
                            <span>•</span>
                            <span className="text-yellow-500">★ {currentMovie.snapshot.vote_average?.toFixed(1)}</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="absolute -bottom-6 left-0 w-full flex justify-center items-center gap-6 z-10">
                <Button
                    size="icon"
                    variant="outline"
                    className="h-16 w-16 rounded-full border-2 border-red-500 bg-slate-950 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    onClick={() => handleVote('dislike')}
                >
                    <X className="h-8 w-8" />
                </Button>

                <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-full border-2 border-blue-400 bg-slate-950 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                    onClick={() => handleVote('maybe')}
                >
                    <Ghost className="h-6 w-6" />
                </Button>

                <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 border-0"
                    onClick={() => handleVote('like')}
                >
                    <Check className="h-8 w-8" />
                </Button>
            </div>
        </div>
    );
}
