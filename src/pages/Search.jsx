import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILLS_OPTIONS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'CSS', 'HTML', 'SQL', 'Firebase', 'Git', 'Vue', 'Next.js',
]

const Search = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const filteredUsers = users.filter(user => {
    if (currentUser && user.uid === currentUser.uid) return false
    const matchesSearch = search.trim() === ''
      ? true : user.name.toLowerCase().includes(search.toLowerCase())
    const matchesSkills = selectedSkills.length === 0
      ? true : selectedSkills.every(skill => user.skills && user.skills.includes(skill))
    return matchesSearch && matchesSkills
  })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fafafa', letterSpacing: '-1px', marginBottom: '8px' }}>
          Discover Developers
        </h1>
        <p style={{ fontSize: '15px', color: '#71717a' }}>
          Find and connect with talented developers worldwide
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', fontSize: '16px' }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{
            width: '100%', backgroundColor: '#111111', border: '1px solid #1f1f1f',
            borderRadius: '12px', padding: '12px 16px 12px 44px',
            fontSize: '14px', color: '#fafafa', outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>

      {/* Skills filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
        {SKILLS_OPTIONS.map(skill => {
          const isSelected = selectedSkills.includes(skill)
          return (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              style={{
                fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px',
                border: `1px solid ${isSelected ? '#6366f1' : '#1f1f1f'}`,
                backgroundColor: isSelected ? '#6366f120' : 'transparent',
                color: isSelected ? '#6366f1' : '#52525b',
                cursor: 'pointer',
              }}
            >
              {skill}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid #1f1f1f', borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredUsers.map(user => {
            const userName = user.name
            const userAvatar = userName ? userName[0].toUpperCase() : '?'
            const userSkills = user.skills ? user.skills.slice(0, 3) : []

            return (
              <Link key={user.id} to={`/profile/${user.uid}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: '#111111', border: '1px solid #1f1f1f',
                    borderRadius: '16px', padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1f1f1f'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>{userAvatar}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#fafafa' }}>{userName}</p>
                      <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                        {user.bio ? user.bio.substring(0, 40) + (user.bio.length > 40 ? '...' : '') : 'Developer'}
                      </p>
                    </div>
                  </div>

                  {userSkills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {userSkills.map(skill => (
                        <span key={skill} style={{
                          fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                          backgroundColor: '#6366f115', color: '#818cf8', border: '1px solid #6366f130',
                        }}>
                          {skill}
                        </span>
                      ))}
                      {user.skills && user.skills.length > 3 ? (
                        <span style={{ fontSize: '11px', color: '#52525b', padding: '3px 6px' }}>
                          +{user.skills.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#52525b' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>👥</p>
          <p style={{ fontSize: '14px' }}>No developers found.</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Search