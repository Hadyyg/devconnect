import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'

const FILTERS = ['All', 'Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']

const TAG_COLORS = {
  Question: '#3b82f6',
  Project: '#10b981',
  Job: '#f59e0b',
  Tutorial: '#8b5cf6',
  Discussion: '#6366f1',
  Hiring: '#ef4444',
}

const Home = () => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const filteredPosts = filter === 'All'
    ? posts
    : posts.filter(post => post.tag === filter)

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      {!currentUser ? (
        <div style={{
          textAlign: 'center', marginBottom: '48px', padding: '60px 24px',
          background: 'radial-gradient(ellipse at top, #6366f115 0%, transparent 70%)',
        }}>
          <div style={{
            display: 'inline-block', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px',
            color: '#6366f1', textTransform: 'uppercase', marginBottom: '16px',
            padding: '4px 12px', borderRadius: '20px', border: '1px solid #6366f130',
            backgroundColor: '#6366f110',
          }}>
            Developer Community
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: '800', color: '#fafafa',
            letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '16px',
          }}>
            Where developers
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              connect & grow
            </span>
          </h1>
          <p style={{ fontSize: '16px', color: '#71717a', marginBottom: '32px' }}>
            Share ideas, find jobs, and connect with developers worldwide.
          </p>
        </div>
      ) : null}

      {currentUser ? <CreatePost /> : null}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {FILTERS.map(f => {
          const color = TAG_COLORS[f] || '#6366f1'
          const isActive = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px',
                border: `1px solid ${isActive ? color : '#1f1f1f'}`,
                backgroundColor: isActive ? color + '20' : 'transparent',
                color: isActive ? color : '#52525b',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid #1f1f1f', borderTopColor: '#6366f1',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#52525b' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
          <p style={{ fontSize: '14px' }}>No posts yet. Be the first to post!</p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Home