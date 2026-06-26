import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const TAGS = ['Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']
const TAG_COLORS = {
  Question: '#3b82f6', Project: '#10b981', Job: '#f59e0b',
  Tutorial: '#8b5cf6', Discussion: '#5b5fc7', Hiring: '#ef4444',
}

const CreatePost = () => {
  const { currentUser } = useAuth()
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid, name: currentUser.displayName,
        photoURL: currentUser.photoURL || '', content: content.trim(),
        tag, likes: [], comments: [], createdAt: serverTimestamp(),
      })
      setContent('')
      setTag('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#0f0f0f',
      border: `1px solid ${focused ? '#5b5fc7' : '#1a1a1a'}`,
      borderRadius: '16px', padding: '18px', marginBottom: '20px',
      boxShadow: focused ? '0 0 0 3px rgba(91,95,199,0.1)' : 'none',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="avatar" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
          {currentUser.photoURL
            ? <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{currentUser.displayName?.[0]?.toUpperCase() || '?'}</span>
          }
        </div>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Share something with the community..."
            rows={3}
            style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '15px', color: '#e0e0e0', resize: 'none', outline: 'none', lineHeight: '1.65', fontFamily: 'Inter, sans-serif' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {TAGS.map(t => {
                const color = TAG_COLORS[t]
                const isSelected = tag === t
                return (
                  <button key={t} type="button" onClick={() => setTag(tag === t ? '' : t)} className="tag-pill" style={{
                    background: isSelected ? color + '18' : 'transparent',
                    color: isSelected ? color : '#333',
                    borderColor: isSelected ? color + '50' : '#1a1a1a',
                    cursor: 'pointer',
                  }}>
                    {t}
                  </button>
                )
              })}
            </div>
            <button type="submit" disabled={loading || !content.trim()} className="accent-btn" style={{
              padding: '7px 20px', fontSize: '13px',
              opacity: content.trim() ? 1 : 0.35,
            }}>
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost