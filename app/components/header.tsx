import Link from "next/link"


export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Smart Study Scheduler</h1>

        <nav className="flex space-x-6 items-center">
          <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          >
            Dashboard
          </Link>
          <Link href="/study" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
            Study
          </Link>
          
        </nav>
      </div>
    </header>
  )
}
