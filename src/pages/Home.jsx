import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'

const FILTERS = ['All', 'Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']
const TAG_COLORS = {
  Question: '#3b82f6', Project: '#10b981', Job: '#f59e0b',
  Tutorial: '#8b5cf6', Discussion: '#5b5fc7', Hiring: '#ef4444',
}

const Home = () => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.tag === filter)

  return (
    <div className="page-container">
      {!currentUser && (
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '56px', padding: '72px 24px 64px', borderRadius: '24px', background: 'radial-gradient(ellipse at 50% 0%, rgba(91,95,199,0.1) 0%, transparent 70%)', border: '1px solid #141414' }}>
          <div className="fade-up stagger-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', color: '#5b5fc7', textTransform: 'uppercase', marginBottom: '20px', padding: '5px 14px', borderRadius: '20px', border: '1px solid rgba(91,95,199,0.25)', background: 'rgba(91,95,199,0.08)' }}>
            Developer Community
          </div>
          <h1 className="fade-up stagger-2" style={{ fontSize: '52px', fontWeight: '800', color: '#f0f0f0', letterSpacing: '-2.5px', lineHeight: '1.08', marginBottom: '18px' }}>
            Where developers<br />
            <span style={{ background: 'linear-gradient(135deg, #5b5fc7, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              connect & grow
            </span>
          </h1>
          <p className="fade-up stagger-3" style={{ fontSize: '16px', color: '#555', marginBottom: '36px', lineHeight: '1.6' }}>
            Share ideas, find jobs, and connect with developers worldwide.
          </p>
          <div className="fade-up stagger-4" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="accent-btn">Get started free</button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="ghost-btn">Sign in</button>
            </Link>
          </div>
        </div>
      )}

      {currentUser && <CreatePost />}

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {FILTERS.map(f => {
          const color = TAG_COLORS[f] || '#5b5fc7'
          const isActive = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)} className="tag-pill" style={{
              background: isActive ? color + '18' : 'transparent',
              color: isActive ? color : '#444',
              borderColor: isActive ? color + '50' : '#1a1a1a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}>
              {f}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div className="spinner" style={{ width: '28px', height: '28px' }} />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPosts.map((post, i) => (
            <div key={post.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="fade-in" style={{ textAlign: 'center', padding: '80px 0', color: '#333' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
          <p style={{ fontSize: '14px' }}>No posts yet. Be the first!</p>
        </div>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
export default Home