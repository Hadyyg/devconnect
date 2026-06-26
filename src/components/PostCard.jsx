import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import sendNotification from '../utils/sendNotification'

const TAG_COLORS = {
  Question: '#3b82f6',
  Project: '#10b981',
  Job: '#f59e0b',
  Tutorial: '#8b5cf6',
  Discussion: '#6366f1',
  Hiring: '#ef4444',
}

const PostCard = ({ post }) => {
  const { currentUser } = useAuth()
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false
  const likesCount = post.likes ? post.likes.length : 0
  const commentsCount = post.comments ? post.comments.length : 0

  const handleLike = async () => {
    if (!currentUser) return
    const postRef = doc(db, 'posts', post.id)
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) })
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) })
      if (post.uid !== currentUser.uid) {
        await sendNotification({
          toUid: post.uid,
          fromName: currentUser.displayName,
          fromPhoto: currentUser.photoURL || '',
          type: 'like',
          postId: post.id,
        })
      }
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || !currentUser) return
    const postRef = doc(db, 'posts', post.id)
    await updateDoc(postRef, {
      comments: arrayUnion({
        uid: currentUser.uid,
        name: currentUser.displayName,
        photoURL: currentUser.photoURL || '',
        text: comment.trim(),
        createdAt: new Date().toISOString(),
      })
    })
    if (post.uid !== currentUser.uid) {
      await sendNotification({
        toUid: post.uid,
        fromName: currentUser.displayName,
        fromPhoto: currentUser.photoURL || '',
        type: 'comment',
        postId: post.id,
      })
    }
    setComment('')
  }

  const tagColor = post.tag ? TAG_COLORS[post.tag] || '#6366f1' : null

  return (
    <div style={{
      backgroundColor: '#111111',
      border: '1px solid #1f1f1f',
      borderRadius: '16px',
      padding: '20px',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1f1f1f'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <Link to={`/profile/${post.uid}`} style={{ textDecoration: 'none' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {post.photoURL ? (
              <img src={post.photoURL} alt={post.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                {post.name ? post.name[0].toUpperCase() : '?'}
              </span>
            )}
          </div>
        </Link>
        <div>
          <Link to={`/profile/${post.uid}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa' }}>{post.name}</p>
          </Link>
          <p style={{ fontSize: '12px', color: '#52525b' }}>
            {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </p>
        </div>
        {tagColor ? (
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
              backgroundColor: tagColor + '20', color: tagColor, border: `1px solid ${tagColor}40`,
            }}>
              {post.tag}
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <p style={{ fontSize: '15px', color: '#d4d4d8', lineHeight: '1.6', marginBottom: '16px' }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '14px', borderTop: '1px solid #1f1f1f' }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500',
            color: isLiked ? '#f43f5e' : '#52525b',
            padding: '4px 8px', borderRadius: '6px',
            backgroundColor: isLiked ? '#f43f5e15' : 'transparent',
          }}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(prev => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500', color: '#52525b',
            padding: '4px 8px', borderRadius: '6px',
          }}
        >
          <span>💬</span>
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments ? (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {c.photoURL ? (
                    <img src={c.photoURL} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>
                      {c.name ? c.name[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div style={{ backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '8px 12px', flex: 1, border: '1px solid #2a2a2a' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#a1a1aa', marginBottom: '2px' }}>{c.name}</p>
                  <p style={{ fontSize: '13px', color: '#d4d4d8' }}>{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#52525b' }}>No comments yet.</p>
          )}

          {currentUser ? (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                style={{
                  flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                  borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
                  color: '#fafafa', outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                Post
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default PostCard