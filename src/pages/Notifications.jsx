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

const getNotificationIcon = (type) => {
  if (type === 'like') return '❤️'
  if (type === 'comment') return '💬'
  if (type === 'message') return '✉️'
  return '🔔'
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
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [currentUser])

  const handleClick = async (notification) => {
    await updateDoc(doc(db, 'notifications', notification.id), { read: true })
    if (notification.type === 'message') navigate('/chat')
    else if (notification.postId) navigate('/')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fafafa', letterSpacing: '-1px' }}>
          Notifications
        </h1>
        {unreadCount > 0 ? (
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontSize: '12px', fontWeight: '700',
            padding: '2px 10px', borderRadius: '20px',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}>
            {unreadCount} new
          </span>
        ) : null}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #1f1f1f', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(notification => {
            const isUnread = !notification.read
            const fromName = notification.fromName
            const fromPhoto = notification.fromPhoto
            const fromAvatar = fromName ? fromName[0].toUpperCase() : '?'

            return (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s ease',
                  backgroundColor: isUnread ? '#6366f110' : '#111111',
                  outline: isUnread ? '1px solid #6366f130' : '1px solid #1f1f1f',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = isUnread ? '#6366f110' : '#111111' }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {fromPhoto ? (
                      <img src={fromPhoto} alt={fromName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{fromAvatar}</span>
                    )}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px',
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: '#d4d4d8', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: '600', color: '#fafafa' }}>{fromName}</span>
                    {' '}{getNotificationText(notification.type)}
                  </p>
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
                    {notification.createdAt
                      ? new Date(notification.createdAt.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}
                  </p>
                </div>

                {/* Unread dot */}
                {isUnread ? (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                  }} />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#52525b' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</p>
          <p style={{ fontSize: '15px', fontWeight: '500', color: '#3f3f46' }}>No notifications yet</p>
          <p style={{ fontSize: '13px', color: '#52525b', marginTop: '6px' }}>When someone likes or comments on your posts, you will see it here</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Notifications