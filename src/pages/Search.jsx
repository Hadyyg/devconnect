import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SKILLS_OPTIONS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'CSS', 'HTML', 'SQL', 'Firebase', 'Git', 'Vue', 'Next.js',
]

const Search = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const filteredUsers = users.filter(user => {
    // Hide current user from results
    if (currentUser && user.uid === currentUser.uid) return false

    // Search by name
    const matchesSearch = search.trim() === ''
      ? true
      : user.name.toLowerCase().includes(search.toLowerCase())

    // Filter by skills
    const matchesSkills = selectedSkills.length === 0
      ? true
      : selectedSkills.every(skill =>
          user.skills && user.skills.includes(skill)
        )

    return matchesSearch && matchesSkills
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Discover Developers</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Skills filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SKILLS_OPTIONS.map(skill => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selectedSkills.includes(skill)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-gray-500 border-gray-200 hover:border-indigo-400'
            }`}
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">No developers found.</p>
        </div>
      )}

    </div>
  )
}

const UserCard = ({ user }) => {
  const userName = user.name
  const userBio = user.bio ? user.bio : 'No bio yet.'
  const userPhoto = user.photoURL
  const userAvatar = userName ? userName[0].toUpperCase() : '?'
  const userSkills = user.skills ? user.skills.slice(0, 3) : []

  return (
    <Link to={`/profile/${user.uid}`}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all">

        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-indigo-600">{userAvatar}</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{userName}</h3>
            <p className="text-xs text-gray-400 line-clamp-1">{userBio}</p>
          </div>
        </div>

        {/* Skills */}
        {userSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {userSkills.map(skill => (
              <span
                key={skill}
                className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
            {user.skills && user.skills.length > 3 ? (
              <span className="text-xs text-gray-400 px-2 py-0.5">
                +{user.skills.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}

      </div>
    </Link>
  )
}

export default Search