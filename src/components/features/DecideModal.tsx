import { useState } from 'react';
import { RoomMovie } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DecideModalProps {
    matches: RoomMovie[];
    onClose: () => void;
}

export function DecideModal({ matches, onClose }: DecideModalProps) {
    const [selected, setSelected] = useState<RoomMovie | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleDecide = () => {
        if (matches.length === 0) return;
        setIsSpinning(true);

        // Simulate spinning
        let duration = 2000;
        let intervals = 100;

        const interval = setInterval(() => {
            const random = matches[Math.floor(Math.random() * matches.length)];
            setSelected(random);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            const final = matches[Math.floor(Math.random() * matches.length)];
            setSelected(final);
            setIsSpinning(false);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, duration);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center relative overflow-hidden"
            >
                <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>

                <div className="mb-6 flex justify-center">
                    <div className="bg-purple-900/50 p-4 rounded-full">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Can't Decide?</h2>
                <p className="text-slate-400 mb-6">Let fate choose for you from your {matches.length} matches.</p>

                {selected ? (
                    <div className="mb-6 space-y-3">
                        <div className="relative aspect-[2/3] w-32 mx-auto rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={getImageUrl(selected.snapshot.poster_path) || ''}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {selected.snapshot.title}
                        </h3>
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center bg-white/5 rounded-xl mb-6">
                        <span className="text-4xl">❓</span>
                    </div>
                )}

                <Button
                    onClick={handleDecide}
                    disabled={isSpinning || matches.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 h-12 text-lg"
                >
                    {isSpinning ? "Spinning..." : "Pick a Movie"}
                </Button>
            </motion.div>
        </div>
    );
}
