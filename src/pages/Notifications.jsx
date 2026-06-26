import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const getNotificationText = (type) => {
  if (type === 'like') return 'liked your post'
  if (type === 'comment') return 'commented on your post'
  if (type === 'message') return 'sent you a message'
  return 'interacted with you'
}

const Notifications = () => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setNotifications(data)
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  const handleClick = async (notification) => {
    // Mark as read
    await updateDoc(doc(db, 'notifications', notification.id), { read: true })

    // Navigate to the right place
    if (notification.type === 'message') {
      navigate('/chat')
    } else if (notification.postId) {
      navigate('/')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 ? (
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(notification => {
            const fromPhoto = notification.fromPhoto
            const fromName = notification.fromName
            const fromAvatar = fromName ? fromName[0].toUpperCase() : '?'
            const isUnread = !notification.read

            return (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-colors text-left ${
                  isUnread
                    ? 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {fromPhoto ? (
                    <img src={fromPhoto} alt={fromName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-indigo-600">{fromAvatar}</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{fromName}</span>
                    {' '}
                    {getNotificationText(notification.type)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {notification.createdAt
                      ? new Date(notification.createdAt.toDate()).toLocaleDateString()
                      : 'Just now'}
                  </p>
                </div>

                {/* Unread dot */}
                {isUnread ? (
                  <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                ) : null}

              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-sm">No notifications yet.</p>
        </div>
      )}

    </div>
  )
}

export default Notifications