import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import sendNotification from '../utils/sendNotification'

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

    // Only notify if liking someone else's post
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

  // Only notify if commenting on someone else's post
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
  const toggleComments = () => setShowComments(prev => !prev)

  return (
   <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">

      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.uid}`}>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
            {post.photoURL ? (
              <img src={post.photoURL} alt={post.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-indigo-600">
                {post.name ? post.name[0].toUpperCase() : '?'}
              </span>
            )}
          </div>
        </Link>
        <div>
          <Link to={`/profile/${post.uid}`} className="text-sm font-semibold text-gray-900 hover:underline">
            {post.name}
          </Link>
          <p className="text-xs text-gray-400">
            {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 text-sm leading-relaxed mb-4">{post.content}</p>

      {/* Tag */}
      {post.tag ? (
        <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
          {post.tag}
        </span>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">

        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>

        {/* Comment toggle */}
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-indigo-500 transition-colors"
        >
          <span>💬</span>
          <span>{commentsCount}</span>
        </button>

      </div>

      {/* Comments section */}
      {showComments ? (
        <div className="mt-4 space-y-3">

          {/* Existing comments */}
        {post.comments && post.comments.length > 0 ? (
  post.comments.map((c, index) => (
    <div key={index} className="flex gap-2">
      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {c.photoURL ? (
          <img src={c.photoURL} alt={c.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-indigo-600">
            {c.name ? c.name[0].toUpperCase() : '?'}
          </span>
        )}
      </div>
      <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
        <p className="text-xs font-semibold text-gray-700">{c.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
      </div>
    </div>
  ))
) : (
  <p className="text-xs text-gray-400">No comments yet.</p>
)}
          

          {/* Add comment */}
          {currentUser ? (
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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