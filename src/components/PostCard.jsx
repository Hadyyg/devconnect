import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import sendNotification from '../utils/sendNotification'

const TAG_COLORS = {
  Question: '#3b82f6', Project: '#10b981', Job: '#f59e0b',
  Tutorial: '#8b5cf6', Discussion: '#5b5fc7', Hiring: '#ef4444',
}

const PostCard = ({ post }) => {
  const { currentUser } = useAuth()
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isLiked = currentUser ? post.likes?.includes(currentUser.uid) : false
  const likesCount = post.likes?.length || 0
  const commentsCount = post.comments?.length || 0
  const isOwner = currentUser?.uid === post.uid

  const handleLike = async () => {
    if (!currentUser) return
    const postRef = doc(db, 'posts', post.id)
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) })
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) })
      if (post.uid !== currentUser.uid)
        await sendNotification({ toUid: post.uid, fromName: currentUser.displayName, fromPhoto: currentUser.photoURL || '', type: 'like', postId: post.id })
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser) return
    const postRef = doc(db, 'posts', post.id)
    await updateDoc(postRef, {
      comments: arrayUnion({ uid: currentUser.uid, name: currentUser.displayName, photoURL: currentUser.photoURL || '', text: comment.trim(), createdAt: new Date().toISOString() })
    })
    if (post.uid !== currentUser.uid)
      await sendNotification({ toUid: post.uid, fromName: currentUser.displayName, fromPhoto: currentUser.photoURL || '', type: 'comment', postId: post.id })
    setComment('')
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'posts', post.id))
    } catch (err) {
      console.error(err)
      setDeleting(false)
    }
  }

  const tagColor = post.tag ? TAG_COLORS[post.tag] : null

  return (
    <div className="luxury-card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <Link to={`/profile/${post.uid}`} style={{ textDecoration: 'none' }}>
          <div className="avatar" style={{ width: '40px', height: '40px', cursor: 'pointer' }}>
            {post.photoURL
              ? <img src={post.photoURL} alt={post.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{post.name?.[0]?.toUpperCase() || '?'}</span>
            }
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <Link to={`/profile/${post.uid}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#e0e0e0' }}>{post.name}</p>
          </Link>
          <p style={{ fontSize: '12px', color: '#333' }}>
            {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </p>
        </div>
        {tagColor && (
          <span className="tag-pill" style={{ background: tagColor + '18', color: tagColor, borderColor: tagColor + '40' }}>{post.tag}</span>
        )}
        {/* Delete button — only for post owner */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '4px 10px', borderRadius: '8px', border: `1px solid ${confirmDelete ? '#ef444440' : '#1a1a1a'}`,
              background: confirmDelete ? '#ef444412' : 'transparent',
              color: confirmDelete ? '#ef4444' : '#333',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s ease', flexShrink: 0,
            }}
            onMouseLeave={() => setConfirmDelete(false)}
          >
            {deleting ? '…' : confirmDelete ? 'Confirm?' : '🗑'}
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: '15px', color: '#888', lineHeight: '1.7', marginBottom: post.imageURL ? '14px' : '16px' }}>
        {post.content}
      </p>

      {/* Image (if uploaded) */}
      {post.imageURL && (
        <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1a1a1a' }}>
          <img
            src={post.imageURL}
            alt="post"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', paddingTop: '14px', borderTop: '1px solid #141414' }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: isLiked ? '#f43f5e18' : 'transparent', border: 'none',
          cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          color: isLiked ? '#f43f5e' : '#444', padding: '5px 10px', borderRadius: '8px',
          transition: 'all 0.2s ease',
        }}>
          <span>{isLiked ? '❤️' : '🤍'}</span> {likesCount}
        </button>
        <button onClick={() => setShowComments(p => !p)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: showComments ? '#5b5fc718' : 'transparent', border: 'none',
          cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          color: showComments ? '#818cf8' : '#444', padding: '5px 10px', borderRadius: '8px',
          transition: 'all 0.2s ease',
        }}>
          <span>💬</span> {commentsCount}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="fade-in" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {post.comments?.length > 0
            ? post.comments.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <div className="avatar" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                  {c.photoURL ? <img src={c.photoURL} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>{c.name?.[0]?.toUpperCase() || '?'}</span>}
                </div>
                <div style={{ background: '#111', borderRadius: '12px', padding: '8px 12px', flex: 1, border: '1px solid #1a1a1a' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '3px' }}>{c.name}</p>
                  <p style={{ fontSize: '13px', color: '#777' }}>{c.text}</p>
                </div>
              </div>
            ))
            : <p style={{ fontSize: '13px', color: '#333' }}>No comments yet.</p>
          }
          {currentUser && (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." className="input-field" style={{ padding: '8px 12px', fontSize: '13px' }} />
              <button type="submit" className="accent-btn" style={{ padding: '8px 16px', fontSize: '13px', flexShrink: 0 }}>Post</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default PostCard