interface PlayerScoreProps {
    playerName: string;
    score: number;
    isCurrentTurn: boolean;
}

export default function PlayerScore({ playerName, score, isCurrentTurn }: PlayerScoreProps) {
    return (
        <div className={`p-4 rounded-lg ${isCurrentTurn ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <h2 className="text-xl font-bold mb-2">{playerName}</h2>
            <p className="text-3xl font-bold">{score}</p>
            {isCurrentTurn && <p className="text-sm mt-2">Your turn!</p>}
        </div>
    );
}
