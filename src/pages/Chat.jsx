import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import sendNotification from '../utils/sendNotification'

const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_')

const Chat = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid)
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [currentUser])

  useEffect(() => {
    if (!selectedUser) return
    const chatId = getChatId(currentUser.uid, selectedUser.uid)
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return unsubscribe
  }, [selectedUser, currentUser])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return
    const messageText = newMessage.trim()
    setNewMessage('')
    const chatId = getChatId(currentUser.uid, selectedUser.uid)
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: messageText,
      senderUid: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    })
    await sendNotification({
      toUid: selectedUser.uid,
      fromName: currentUser.displayName,
      fromPhoto: currentUser.photoURL || '',
      type: 'message',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{
        backgroundColor: '#111111', border: '1px solid #1f1f1f',
        borderRadius: '20px', overflow: 'hidden',
        display: 'flex', height: '75vh',
      }}>

        {/* Sidebar */}
        <div style={{ width: '260px', borderRight: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1f1f1f' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#fafafa' }}>Messages</h2>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #1f1f1f', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : users.map(user => {
              const isSelected = selectedUser && selectedUser.uid === user.uid
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: isSelected ? '#6366f115' : 'transparent',
                    borderRight: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                        {user.name ? user.name[0].toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#fafafa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: '#52525b' }}>Developer</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                      {selectedUser.name ? selectedUser.name[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div>
                  <Link to={`/profile/${selectedUser.uid}`} style={{ textDecoration: 'none' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#fafafa' }}>{selectedUser.name}</p>
                  </Link>
                  <p style={{ fontSize: '12px', color: '#52525b' }}>Developer</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.length > 0 ? messages.map(msg => {
                  const isMe = msg.senderUid === currentUser.uid
                  return (
                    <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      }}>
                        {msg.senderPhoto ? (
                          <img src={msg.senderPhoto} alt={msg.senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>
                            {msg.senderName ? msg.senderName[0].toUpperCase() : '?'}
                          </span>
                        )}
                      </div>
                      <div style={{
                        maxWidth: '65%', padding: '10px 14px', borderRadius: '16px', fontSize: '14px', lineHeight: '1.5',
                        background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1a1a1a',
                        color: isMe ? 'white' : '#d4d4d8',
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: isMe ? '16px' : '4px',
                        boxShadow: isMe ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  )
                }) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: '14px' }}>
                    No messages yet. Say hello! 👋
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #1f1f1f' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    style={{
                      flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '12px', padding: '10px 16px', fontSize: '14px',
                      color: '#fafafa', outline: 'none', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{
                      padding: '10px 20px', borderRadius: '12px', border: 'none',
                      background: newMessage.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1f1f1f',
                      color: newMessage.trim() ? 'white' : '#52525b',
                      fontSize: '14px', fontWeight: '600', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: newMessage.trim() ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>💬</p>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#3f3f46' }}>Select a developer to start chatting</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Chat