import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import useUserData from '../hooks/UseUserData'

const Profile = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { userData, loading } = useUserData(id)
  const navigate = useNavigate()
  const isOwnProfile = currentUser?.uid === id

  const [currentUserData, setCurrentUserData] = useState(null)
  const [followLoading, setFollowLoading] = useState(false)

  // Listen to current user's doc to get live followers/following
  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setCurrentUserData(snap.data())
    })
    return unsub
  }, [currentUser])

  const isFollowing = currentUserData?.following?.includes(id) || false
  const followersCount = userData?.followers?.length || 0
  const followingCount = userData?.following?.length || 0

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile) return
    setFollowLoading(true)
    try {
      const myRef = doc(db, 'users', currentUser.uid)
      const theirRef = doc(db, 'users', id)
      if (isFollowing) {
        await updateDoc(myRef, { following: arrayRemove(id) })
        await updateDoc(theirRef, { followers: arrayRemove(currentUser.uid) })
      } else {
        await updateDoc(myRef, { following: arrayUnion(id) })
        await updateDoc(theirRef, { followers: arrayUnion(currentUser.uid) })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
    </div>
  )

  if (!userData) return (
    <div style={{ textAlign: 'center', paddingTop: '80px', color: '#444' }}>User not found.</div>
  )

  const { photoURL, name, bio, github, linkedin, skills = [] } = userData
  const avatar = name?.[0]?.toUpperCase() || '?'

  return (
    <div className="wide-container" style={{ maxWidth: '900px' }}>

      {/* Cover */}
      <div style={{
        height: '180px', borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(135deg, #3730a3 0%, #5b5fc7 40%, #7c3aed 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #0f0f0f, transparent)' }} />
      </div>

      {/* Card */}
      <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: '0 32px 36px' }}>

        {/* Avatar + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-52px', marginBottom: '28px' }}>
          <div className="avatar" style={{
            width: '104px', height: '104px', fontSize: '36px', fontWeight: '800',
            border: '4px solid #0f0f0f', color: 'white',
            boxShadow: '0 0 0 1px #1a1a1a, 0 0 40px rgba(91,95,199,0.3)',
          }}>
            {photoURL
              ? <img src={photoURL} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : avatar
            }
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingBottom: '6px' }}>
            {isOwnProfile ? (
              <button className="ghost-btn" onClick={() => navigate('/edit-profile')}>Edit Profile</button>
            ) : (
              <>
                <button
                  className={isFollowing ? 'ghost-btn' : 'accent-btn'}
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={{ opacity: followLoading ? 0.6 : 1 }}
                >
                  {followLoading ? '…' : isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button className="ghost-btn" onClick={() => navigate('/chat')}>Message</button>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#e0e0e0' }}>{followersCount}</p>
            <p style={{ fontSize: '12px', color: '#444' }}>Followers</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#e0e0e0' }}>{followingCount}</p>
            <p style={{ fontSize: '12px', color: '#444' }}>Following</p>
          </div>
        </div>

        {/* Two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div className="fade-up stagger-1">
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f0f0f0', letterSpacing: '-0.5px', marginBottom: '8px' }}>{name}</h1>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.75', marginBottom: '20px' }}>{bio || 'No bio yet.'}</p>
            {(github || linkedin) && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {github && <a href={github} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: '600', color: '#818cf8', textDecoration: 'none', padding: '5px 14px', borderRadius: '20px', background: 'rgba(91,95,199,0.08)', border: '1px solid rgba(91,95,199,0.2)' }}>GitHub ↗</a>}
                {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '12px', fontWeight: '600', color: '#818cf8', textDecoration: 'none', padding: '5px 14px', borderRadius: '20px', background: 'rgba(91,95,199,0.08)', border: '1px solid rgba(91,95,199,0.2)' }}>LinkedIn ↗</a>}
              </div>
            )}
          </div>

          <div className="fade-up stagger-2">
            {skills.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map(skill => (
                    <span key={skill} style={{ fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', background: 'rgba(91,95,199,0.08)', color: '#818cf8', border: '1px solid rgba(91,95,199,0.18)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}
        >← Back to Feed</Link>
      </div>
    </div>
  )
}

export default Profile