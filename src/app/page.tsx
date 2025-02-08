import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">ToolBox</h1>
        <p className="text-gray-600 dark:text-gray-400">A collection of useful tools and utilities</p>
      </header>

      <main className="max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dice Game Card */}
          <Link href="/diceGame" className="group">
            <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Image
                    src="/file.svg"
                    alt="Dice Game icon"
                    width={24}
                    height={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <h2 className="text-xl font-semibold">Dice Game</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Two-player dice rolling game with customizable player names.</p>
            </div>
          </Link>

          {/* Grid Box Card */}
          <Link href="/gridBox" className="group">
            <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Image
                    src="/file.svg"
                    alt="Grid Box icon"
                    width={24}
                    height={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <h2 className="text-xl font-semibold">Grid Box</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Create and customize grid layouts with dynamic styling options.</p>
            </div>
          </Link>

          {/* JSON Visualizer Card */}
          <Link href="/jsonVisualizer" className="group">
            <div className="border rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Image
                    src="/file.svg"
                    alt="JSON Visualizer icon"
                    width={24}
                    height={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <h2 className="text-xl font-semibold">JSON Visualizer</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Interactive JSON viewer and editor with tree visualization.</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-600 dark:text-gray-400">
        Built with Next.js and Tailwind CSS
      </footer>
    </div>
  );
}
