"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clapperboard, Users, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"initial" | "create" | "join">("initial");

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    const handleCreateRoom = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const code = generateRoomCode();

            // 1. Create Room
            const { data: room, error: roomError } = await supabase
                .from("rooms")
                .insert({ code })
                .select()
                .single();

            if (roomError) throw roomError;

            // 2. Create User
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({ room_id: room.id, name: name.trim() })
                .select()
                .single();

            if (userError) throw userError;

            // 3. Save session
            localStorage.setItem("movie_matcher_user_id", user.id);
            localStorage.setItem("movie_matcher_room_code", code);

            router.push(`/room/${code}`);
        } catch (error: any) {
            console.error("Error creating room:", error);
            alert(`Error creating room: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!name.trim() || !roomCode.trim()) return;
        setLoading(true);
        try {
            // 1. Find Room
            const { data: room, error: roomError } = await supabase
                .from("rooms")
                .select("id")
                .eq("code", roomCode.toUpperCase())
                .single();

            if (roomError || !room) {
                alert(`Room not found! ${roomError?.message || ''}`);
                setLoading(false);
                return;
            }

            // 2. Create User
            const { data: user, error: userError } = await supabase
                .from("users")
                .insert({ room_id: room.id, name: name.trim() })
                .select()
                .single();

            if (userError) throw userError;

            // 3. Save session
            localStorage.setItem("movie_matcher_user_id", user.id);
            localStorage.setItem("movie_matcher_room_code", roomCode.toUpperCase());

            router.push(`/room/${roomCode.toUpperCase()}`);
        } catch (error: any) {
            console.error("Error joining room:", error);
            alert(`Error joining room: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 text-center"
            >
                <div className="flex justify-center">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                        <Clapperboard className="h-12 w-12 text-purple-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Movie Matcher
                </h1>
                <p className="text-lg text-slate-300">
                    Find the perfect movie to watch together. No more endless scrolling.
                </p>

                <div className="mt-8 space-y-4 rounded-3xl bg-white/5 p-6 backdrop-blur-lg border border-white/10">
                    {mode === "initial" && (
                        <div className="space-y-3">
                            <Input
                                placeholder="What's your name?"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg h-14"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    onClick={() => setMode("create")}
                                    disabled={!name}
                                    className="h-14 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 border-0"
                                >
                                    Create Room
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setMode("join")}
                                    disabled={!name}
                                    className="h-14 text-base border-white/20 hover:bg-white/10 text-white hover:text-white bg-transparent"
                                >
                                    Join Room
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === "create" && (
                        <div className="space-y-4">
                            <div className="text-left">
                                <button onClick={() => setMode("initial")} className="text-sm text-white/50 hover:text-white mb-2">← Back</button>
                                <h3 className="text-xl font-semibold">Start a new session</h3>
                            </div>
                            <p className="text-sm text-slate-400">
                                We'll give you a code to share with your partner.
                            </p>
                            <Button
                                onClick={handleCreateRoom}
                                disabled={loading}
                                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Start Matching"}
                            </Button>
                        </div>
                    )}

                    {mode === "join" && (
                        <div className="space-y-4">
                            <div className="text-left">
                                <button onClick={() => setMode("initial")} className="text-sm text-white/50 hover:text-white mb-2">← Back</button>
                                <h3 className="text-xl font-semibold">Join existing room</h3>
                            </div>
                            <Input
                                placeholder="Enter Room Code (e.g. A2B4)"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-xl tracking-widest uppercase h-14"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                maxLength={4}
                            />
                            <Button
                                onClick={handleJoinRoom}
                                disabled={loading || roomCode.length < 4}
                                className="w-full h-14 text-lg bg-white text-purple-900 hover:bg-slate-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Join Session"}
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </main>
    );
}
