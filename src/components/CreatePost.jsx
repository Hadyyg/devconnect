import { useState, useRef } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
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
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const fileRef = useRef()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || !currentUser) return
    setLoading(true)
    try {
      let imageURL = null
      if (image) {
        const imgRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}_${image.name}`)
        await uploadBytes(imgRef, image)
        imageURL = await getDownloadURL(imgRef)
      }
      await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid, name: currentUser.displayName,
        photoURL: currentUser.photoURL || '', content: content.trim(),
        tag, imageURL, likes: [], comments: [], createdAt: serverTimestamp(),
      })
      setContent('')
      setTag('')
      setImage(null)
      setImagePreview(null)
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

          {/* Image preview */}
          {imagePreview && (
            <div style={{ position: 'relative', marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1a1a1a' }}>
              <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }} />
              <button
                type="button" onClick={removeImage}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                style={{
                  padding: '3px 10px', borderRadius: '20px', border: '1px solid #1a1a1a',
                  background: 'transparent', color: '#444', fontSize: '11px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#888' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#444' }}
              >
                📷 Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

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