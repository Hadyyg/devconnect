import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
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
    const unsubscribe = onSnapshot(q, s => setUnreadCount(s.docs.length))
    return unsubscribe
  }, [currentUser])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: `1px solid ${scrolled ? '#161616' : 'transparent'}`,
      backgroundColor: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #5b5fc7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', fontWeight: '800', color: 'white',
              boxShadow: '0 0 24px rgba(91,95,199,0.35)',
            }}>D</div>
            <span style={{ fontSize: '17px', fontWeight: '700', color: '#f0f0f0', letterSpacing: '-0.5px' }}>DevConnect</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {currentUser ? (
            <>
              {[{ path: '/', label: 'Feed' }, { path: '/search', label: 'Developers' }, { path: '/chat', label: 'Chat' }].map(({ path, label }) => (
                <Link key={path} to={path} className={`nav-link${isActive(path) ? ' active' : ''}`}>
                  {label}
                </Link>
              ))}

              <Link to="/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
                <div className={`nav-link${isActive('/notifications') ? ' active' : ''}`} style={{ display: 'inline-block' }}>
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '2px', right: '4px',
                      background: '#5b5fc7', color: 'white', fontSize: '9px', fontWeight: '700',
                      width: '15px', height: '15px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount}</span>
                  )}
                </div>
              </Link>

              <Link to={`/profile/${currentUser.uid}`} style={{ textDecoration: 'none', marginLeft: '8px' }}>
                <div className="avatar" style={{
                  width: '36px', height: '36px',
                  boxShadow: '0 0 0 2px #080808, 0 0 0 3.5px #5b5fc7',
                  cursor: 'pointer', transition: 'box-shadow 0.2s ease',
                }}>
                  {currentUser.photoURL
                    ? <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>{currentUser.displayName?.[0]?.toUpperCase() || '?'}</span>
                  }
                </div>
              </Link>

              <button onClick={handleLogout} style={{
                marginLeft: '4px', padding: '6px 14px', borderRadius: '8px', border: 'none',
                fontSize: '14px', fontWeight: '500', color: '#555', background: 'transparent', cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" style={{ textDecoration: 'none', marginLeft: '4px' }}>
                <div className="accent-btn" style={{ padding: '7px 18px', fontSize: '13px', borderRadius: '8px', display: 'inline-block' }}>
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