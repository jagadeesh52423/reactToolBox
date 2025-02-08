'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BoxConfig from './components/BoxConfig';
import GridDisplay from './components/GridDisplay';

interface BoxData {
    backgroundColor: string;
    textSize: number;
    text: string;
    textColor: string;
}

export default function GridBox() {
    const [numberOfBoxes, setNumberOfBoxes] = useState<string>('');
    const [boxConfigs, setBoxConfigs] = useState<BoxData[]>([]);
    const [showResult, setShowResult] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(numberOfBoxes);
        if (num > 0) {
            const newConfigs = Array(num).fill(null).map((_, index) => ({
                backgroundColor: 'var(--background)',
                textSize: 24,
                text: `Box ${index + 1}`,
                textColor: 'var(--foreground)'
            }));
            setBoxConfigs(newConfigs);
            setShowResult(false);
        }
    };

    const updateBoxConfig = (index: number, data: BoxData) => {
        const newConfigs = [...boxConfigs];
        newConfigs[index] = data;
        setBoxConfigs(newConfigs);
    };

    return (
        <div className="min-h-screen p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Grid Box Generator</h1>
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

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-4 items-center">
                    <input
                        type="number"
                        min="1"
                        value={numberOfBoxes}
                        onChange={(e) => setNumberOfBoxes(e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Enter number of boxes"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Generate Boxes
                    </button>
                </div>
            </form>

            {boxConfigs.length > 0 && (
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {boxConfigs.map((config, index) => (
                            <BoxConfig
                                key={index}
                                index={index}
                                config={config}
                                onChange={(data) => updateBoxConfig(index, data)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => setShowResult(true)}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Process Grid
                    </button>
                </div>
            )}

            {showResult && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Result:</h2>
                    <GridDisplay boxes={boxConfigs} />
                </div>
            )}
        </div>
    );
}
