import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useUserData from '../hooks/useUserData'

const Profile = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { userData, loading } = useUserData(id)
  const navigate = useNavigate()

  const isOwnProfile = currentUser?.uid === id
  const goToEdit = () => navigate('/edit-profile')
  const goToChat = () => navigate('/chat')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #1f1f1f', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!userData) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '80px', color: '#52525b' }}>
        User not found.
      </div>
    )
  }

  const githubUrl = userData.github
  const linkedinUrl = userData.linkedin
  const photoURL = userData.photoURL
  const userName = userData.name
  const userBio = userData.bio ? userData.bio : 'No bio yet.'
  const userAvatar = userName ? userName[0].toUpperCase() : '?'
  const userSkills = userData.skills ? userData.skills : []

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>

      <div style={{
        backgroundColor: '#111111', border: '1px solid #1f1f1f',
        borderRadius: '20px', overflow: 'hidden',
      }}>

        {/* Cover */}
        <div style={{
          height: '120px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, #6366f140, transparent)',
          }} />
        </div>

        <div style={{ padding: '0 28px 28px' }}>

          {/* Avatar + Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: '4px solid #111111',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              {photoURL ? (
                <img src={photoURL} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: '28px', fontWeight: '800' }}>{userAvatar}</span>
              )}
            </div>

            {isOwnProfile ? (
              <button
                onClick={goToEdit}
                style={{
                  padding: '8px 20px', borderRadius: '10px', border: '1px solid #2a2a2a',
                  backgroundColor: '#1a1a1a', color: '#fafafa', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={goToChat}
                style={{
                  padding: '8px 20px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 0 16px rgba(99,102,241,0.3)',
                }}
              >
                Message
              </button>
            )}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#fafafa', letterSpacing: '-0.5px' }}>
            {userName}
          </h1>

          {/* Bio */}
          <p style={{ fontSize: '14px', color: '#71717a', marginTop: '6px', lineHeight: '1.6' }}>
            {userBio}
          </p>

          {/* Links */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noreferrer" style={{
                fontSize: '13px', fontWeight: '600', color: '#818cf8',
                textDecoration: 'none', padding: '4px 12px', borderRadius: '20px',
                backgroundColor: '#6366f115', border: '1px solid #6366f130',
              }}>
                GitHub ↗
              </a>
            ) : null}
            {linkedinUrl ? (
              <a href={linkedinUrl} target="_blank" rel="noreferrer" style={{
                fontSize: '13px', fontWeight: '600', color: '#818cf8',
                textDecoration: 'none', padding: '4px 12px', borderRadius: '20px',
                backgroundColor: '#6366f115', border: '1px solid #6366f130',
              }}>
                LinkedIn ↗
              </a>
            ) : null}
          </div>

          {/* Skills */}
          {userSkills.length > 0 ? (
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Skills
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {userSkills.map(skill => (
                  <span key={skill} style={{
                    fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px',
                    backgroundColor: '#6366f115', color: '#818cf8', border: '1px solid #6366f130',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <Link to="/" style={{ fontSize: '13px', color: '#52525b', textDecoration: 'none' }}>
          ← Back to Feed
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Profile