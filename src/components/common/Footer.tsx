import Link from 'next/link';

const GITHUB_URL = 'https://github.com/jagadeesh52423/reactToolBox';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>&copy; {year} React Toolbox</div>
        <nav className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Source on GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
