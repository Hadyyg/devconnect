import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const TAGS = ['Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']

const CreatePost = () => {
  const { currentUser } = useAuth()
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false)

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
        tag: tag,
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
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 mb-6">

      <form onSubmit={handleSubmit}>

        {/* Text area */}
     <textarea
  value={content}
  onChange={e => setContent(e.target.value)}
  placeholder="Share something with the community..."
  rows={3}
  className="w-full text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-900 placeholder-gray-400 resize-none focus:outline-none"
/>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {TAGS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(tag === t ? '' : t)}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                  tag === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'text-gray-500 border-gray-200 hover:border-indigo-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>

        </div>
      </form>
    </div>
  )
}

export default CreatePost