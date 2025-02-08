interface GameResultProps {
    winner: number;
    onRestart: () => void;
    player1Name: string;
    player2Name: string;
}

export default function GameResult({ winner, onRestart, player1Name, player2Name }: GameResultProps) {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
                {winner === 0 ? (
                    "It's a Tie! 🎲"
                ) : (
                    `${winner === 1 ? player1Name : player2Name} Wins! 🎉`
                )}
            </h2>
            <button
                onClick={onRestart}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
                Play Again
            </button>
        </div>
    );
}
