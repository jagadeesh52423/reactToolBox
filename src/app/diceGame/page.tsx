'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DiceRoller from './components/DiceRoller';
import PlayerScore from './components/PlayerScore';
import GameResult from './components/GameResult';

interface PlayerState {
    name: string;
    score: number;
    isCurrentTurn: boolean;
}

export default function DiceGame() {
    const [gameStarted, setGameStarted] = useState(false);
    const [player1, setPlayer1] = useState<PlayerState>({ 
        name: '',
        score: 0, 
        isCurrentTurn: true 
    });
    const [player2, setPlayer2] = useState<PlayerState>({ 
        name: '',
        score: 0, 
        isCurrentTurn: false 
    });
    const [gameOver, setGameOver] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);
    const [isFinalRoll, setIsFinalRoll] = useState(false);

    const handleRoll = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setLastRoll(roll);

        if (player1.isCurrentTurn) {
            const newScore = player1.score + roll;
            setPlayer1({ score: newScore, isCurrentTurn: false, name: player1.name });
            setPlayer2({ ...player2, isCurrentTurn: true });
            
            if (newScore >= 15) {
                setIsFinalRoll(true);
            }
        } else {
            const newScore = player2.score + roll;
            setPlayer2({ score: newScore, isCurrentTurn: false, name: player2.name });
            setPlayer1({ ...player1, isCurrentTurn: true });
            
            if (isFinalRoll || newScore >= 15) {
                setGameOver(true);
            }
        }
    };

    const handleStartGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (player1.name && player2.name) {
            setGameStarted(true);
        }
    };

    const resetGame = () => {
        setPlayer1(prev => ({ 
            ...prev, 
            score: 0, 
            isCurrentTurn: true 
        }));
        setPlayer2(prev => ({ 
            ...prev, 
            score: 0, 
            isCurrentTurn: false 
        }));
        setGameOver(false);
        setLastRoll(null);
        setIsFinalRoll(false);
    };

    const determineWinner = () => {
        if (player1.score > player2.score) return 1;
        if (player2.score > player1.score) return 2;
        return 0; // Tie
    };

    return (
        <div className="min-h-screen p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Dice Game</h1>
                <Link 
                    href="/" 
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                    <Image
                        className="dark:invert"
                        src="/vercel.svg"
                        alt="Vercel logomark"
                        width={20}
                        height={20}
                    />
                    Home
                </Link>
            </div>

            <div className="max-w-2xl mx-auto mt-8">
                {!gameStarted ? (
                    <form onSubmit={handleStartGame} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Player 1 Name:</label>
                            <input
                                type="text"
                                value={player1.name}
                                onChange={(e) => setPlayer1(prev => ({ ...prev, name: e.target.value }))}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Player 2 Name:</label>
                            <input
                                type="text"
                                value={player2.name}
                                onChange={(e) => setPlayer2(prev => ({ ...prev, name: e.target.value }))}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Start Game
                        </button>
                    </form>
                ) : (
                    <>
                        <div className="flex justify-between mb-8">
                            <PlayerScore 
                                playerName={player1.name}
                                score={player1.score} 
                                isCurrentTurn={player1.isCurrentTurn}
                            />
                            <PlayerScore 
                                playerName={player2.name}
                                score={player2.score} 
                                isCurrentTurn={player2.isCurrentTurn}
                            />
                        </div>

                        {!gameOver ? (
                            <>
                                <DiceRoller 
                                    onRoll={handleRoll} 
                                    lastRoll={lastRoll}
                                    currentPlayer={player1.isCurrentTurn ? 1 : 2}
                                />
                                {isFinalRoll && (
                                    <div className="text-center mt-4 text-amber-600 font-bold">
                                        Final roll for Player 2!
                                    </div>
                                )}
                            </>
                        ) : (
                            <GameResult 
                                winner={determineWinner()}
                                onRestart={resetGame}
                                player1Name={player1.name}
                                player2Name={player2.name}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
