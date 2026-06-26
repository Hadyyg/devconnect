import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useUserData from '../hooks/useUserData'

const Profile = () => {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { userData, loading } = useUserData(id)
  const navigate = useNavigate()

  const isOwnProfile = currentUser?.uid === id

  const goToEdit = () => navigate('/edit-profile')
  const goToChat = () => navigate('/chat')

  if (loading) {
    return (
     <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center pt-20 text-gray-500">
        User not found.
      </div>
    )
  }

  const githubUrl = userData.github
  const linkedinUrl = userData.linkedin
  const photoURL = userData.photoURL
  const userName = userData.name
  const userBio = userData.bio ? userData.bio : 'No bio yet.'
  const userAvatar = userName ? userName[0].toUpperCase() : '?'
  const userSkills = userData.skills ? userData.skills : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Cover */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />

        <div className="px-6 pb-6">

          {/* Avatar + Button row */}
          <div className="flex items-end justify-between -mt-10 mb-4">

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center overflow-hidden shadow">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-indigo-600">
                  {userAvatar}
                </span>
              )}
            </div>

            {/* Button */}
            {isOwnProfile ? (
              <button
                onClick={goToEdit}
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={goToChat}
                className="border border-indigo-600 text-indigo-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Message
              </button>
            )}

          </div>

          {/* Name */}
          <h1 className="text-xl font-bold text-gray-900">{userName}</h1>

          {/* Bio */}
          <p className="text-gray-500 text-sm mt-1">{userBio}</p>

          {/* Links */}
          <div className="flex gap-4 mt-3">
  {githubUrl ? (
    <a href={githubUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
      GitHub
    </a>
  ) : null}
  {linkedinUrl ? (
    <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
      LinkedIn
    </a>
  ) : null}
</div>

          {/* Skills */}
          {userSkills.length > 0 ? (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      </div>

      {/* Back link */}
      <div className="mt-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
          Back to Feed
        </Link>
      </div>

    </div>
  )
}

export default Profile