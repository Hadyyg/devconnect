import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', currentUser.uid),
      where('read', '==', false)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length)
    })

    return unsubscribe
  }, [currentUser])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        <Link to="/" className="text-xl font-bold text-indigo-600">
          DevConnect 👨‍💻
        </Link>

        <div className="flex items-center gap-6">

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="text-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {currentUser ? (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Feed
              </Link>
              <Link
                to="/search"
                className={`text-sm font-medium transition-colors ${
                  isActive('/search') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Developers
              </Link>
              <Link
                to="/chat"
                className={`text-sm font-medium transition-colors ${
                  isActive('/chat') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Chat
              </Link>
              <Link
                to="/notifications"
                className="relative text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                🔔
                {unreadCount > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
              <Link to={`/profile/${currentUser.uid}`}>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden text-indigo-600 font-bold text-sm border border-gray-200">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span>
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar