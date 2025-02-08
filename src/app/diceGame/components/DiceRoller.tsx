interface DiceRollerProps {
    onRoll: () => void;
    lastRoll: number | null;
    currentPlayer: number;
}

export default function DiceRoller({ onRoll, lastRoll, currentPlayer }: DiceRollerProps) {
    return (
        <div className="text-center">
            <div className="mb-4">
                <button
                    onClick={onRoll}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Roll Dice
                </button>
            </div>
            {lastRoll && (
                <div className="text-xl">
                    Player {currentPlayer === 1 ? 2 : 1} rolled: <span className="font-bold">{lastRoll}</span>
                </div>
            )}
        </div>
    );
}
