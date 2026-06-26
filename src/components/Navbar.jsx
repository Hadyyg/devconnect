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
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: scrolled ? '1px solid #1f1f1f' : '1px solid transparent',
      backgroundColor: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)'
            }}>D</div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#fafafa', letterSpacing: '-0.5px' }}>
              DevConnect
            </span>
          </div>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {currentUser ? (
            <>
              {[
                { path: '/', label: 'Feed' },
                { path: '/search', label: 'Developers' },
                { path: '/chat', label: 'Chat' },
              ].map(({ path, label }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isActive(path) ? '#fafafa' : '#71717a',
                    backgroundColor: isActive(path) ? '#1f1f1f' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    {label}
                  </div>
                </Link>
              ))}

              {/* Notifications */}
              <Link to="/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive('/notifications') ? '#fafafa' : '#71717a',
                  backgroundColor: isActive('/notifications') ? '#1f1f1f' : 'transparent',
                  cursor: 'pointer',
                }}>
                  🔔
                  {unreadCount > 0 ? (
                    <span style={{
                      position: 'absolute', top: '2px', right: '6px',
                      background: '#6366f1', color: 'white',
                      fontSize: '10px', fontWeight: '700',
                      width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
              </Link>

              {/* Avatar */}
              <Link to={`/profile/${currentUser.uid}`} style={{ textDecoration: 'none', marginLeft: '8px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 0 0 2px #1f1f1f, 0 0 0 4px #6366f1',
                }}>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none',
                  fontSize: '14px', fontWeight: '500', color: '#71717a',
                  backgroundColor: 'transparent', cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '6px 14px', fontSize: '14px', fontWeight: '500', color: '#71717a', cursor: 'pointer' }}>
                  Login
                </div>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                }}>
                  Sign Up
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar