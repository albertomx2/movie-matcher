import { useState, useEffect } from 'react';
import { searchMovies, getImageUrl, getTrendingMovies } from '@/lib/tmdb';
import { Input } from '@/components/ui/input';
import { X, Search, Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/types';
import { Button } from '@/components/ui/button';

interface MovieSearchProps {
    onClose: () => void;
    onAdd: (movie: Movie) => void;
}

export function MovieSearch({ onClose, onAdd }: MovieSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load trending on mount
        getTrendingMovies().then(setResults).catch(console.error);
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length > 2) {
            setLoading(true);
            try {
                const res = await searchMovies(val);
                setResults(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        } else if (val.length === 0) {
            getTrendingMovies().then(setResults);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
        >
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-6 w-6" />
                </Button>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        autoFocus
                        placeholder="Search movies..."
                        className="pl-10 h-11 bg-white/5 border-none text-white focus-visible:ring-1 focus-visible:ring-purple-500"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {results.map((movie) => (
                    <motion.div
                        key={movie.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5"
                    >
                        <img
                            src={getImageUrl(movie.poster_path) || '/placeholder.png'}
                            alt={movie.title}
                            className="w-20 h-28 object-cover rounded-lg bg-slate-800"
                        />
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-semibold text-lg leading-tight">{movie.title}</h3>
                                <p className="text-sm text-slate-400 mt-1">{movie.release_date?.split('-')[0]} • {movie.original_title}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                                    <Star className="h-3 w-3 fill-current" />
                                    {movie.vote_average?.toFixed(1)}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => onAdd({
                                        tmdb_id: movie.id,
                                        title: movie.title,
                                        poster_path: movie.poster_path,
                                        overview: movie.overview,
                                        release_date: movie.release_date,
                                        vote_average: movie.vote_average
                                    })}
                                    className="h-8 bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {results.length === 0 && !loading && (
                    <div className="text-center text-slate-500 mt-10">No results found</div>
                )}
            </div>
        </motion.div>
    );
}
