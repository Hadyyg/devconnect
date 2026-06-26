import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const TAGS = ['Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']

const TAG_COLORS = {
  Question: '#3b82f6',
  Project: '#10b981',
  Job: '#f59e0b',
  Tutorial: '#8b5cf6',
  Discussion: '#6366f1',
  Hiring: '#ef4444',
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
        uid: currentUser.uid,
        name: currentUser.displayName,
        photoURL: currentUser.photoURL || '',
        content: content.trim(),
        tag,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
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
      backgroundColor: '#111111',
      border: `1px solid ${focused ? '#6366f1' : '#1f1f1f'}`,
      borderRadius: '16px', padding: '20px', marginBottom: '24px',
      boxShadow: focused ? '0 0 0 1px #6366f130' : 'none',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

        {/* Avatar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {currentUser.photoURL ? (
            <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : '?'}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Share something with the community..."
            rows={3}
            style={{
              width: '100%', backgroundColor: 'transparent', border: 'none',
              fontSize: '15px', color: '#fafafa', resize: 'none', outline: 'none',
              lineHeight: '1.6', fontFamily: 'Inter, sans-serif',
            }}
          />

          {/* Tags + Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TAGS.map(t => {
                const color = TAG_COLORS[t]
                const isSelected = tag === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(tag === t ? '' : t)}
                    style={{
                      fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                      border: `1px solid ${isSelected ? color : '#2a2a2a'}`,
                      backgroundColor: isSelected ? color + '20' : 'transparent',
                      color: isSelected ? color : '#52525b',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: content.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1f1f1f',
                color: content.trim() ? 'white' : '#52525b',
                fontSize: '13px', fontWeight: '600', cursor: content.trim() ? 'pointer' : 'not-allowed',
                boxShadow: content.trim() ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost