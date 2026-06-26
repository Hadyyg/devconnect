import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'

const FILTERS = ['All', 'Question', 'Project', 'Job', 'Tutorial', 'Discussion', 'Hiring']

const Home = () => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    // Real-time listener — posts update instantly for all users
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPosts(data)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const filteredPosts = filter === 'All'
    ? posts
    : posts.filter(post => post.tag === filter)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Create post — only for logged in users */}
      {currentUser ? <CreatePost /> : null}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-gray-500 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No posts yet. Be the first to post!</p>
        </div>
      )}

    </div>
  )
}

export default Home