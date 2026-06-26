import { useState, useEffect, useRef } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import sendNotification from '../utils/sendNotification'

// Generate a unique chat room ID from two user IDs
// We sort them so the ID is the same regardless of who starts the chat
const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_')
}

const Chat = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Fetch all users except current user
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

  // Listen to messages in real time when a user is selected
  useEffect(() => {
    if (!selectedUser) return

    const chatId = getChatId(currentUser.uid, selectedUser.uid)
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMessages(data)
    })

    return unsubscribe
  }, [selectedUser, currentUser])

  // Auto scroll to bottom when new message arrives
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
    text: newMessage.trim(),
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

  setNewMessage('')
}
   
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex h-[75vh]">
      <div className="bg-white dark:bg-gray-600 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex h-[75vh]">

        {/* Sidebar — user list */}
        <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Messages</h2>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length > 0 ? (
              users.map(user => {
                const userPhoto = user.photoURL
                const userName = user.name
                const userAvatar = userName ? userName[0].toUpperCase() : '?'
                const isSelected = selectedUser && selectedUser.uid === user.uid

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                      isSelected ? 'bg-indigo-50 border-r-2 border-indigo-600' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {userPhoto ? (
                        <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-indigo-600">{userAvatar}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.bio ? user.bio : 'Developer'}</p>
                    </div>
                  </button>
                )
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-10">No users yet.</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">

          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-indigo-600">
                      {selectedUser.name ? selectedUser.name[0].toUpperCase() : '?'}
                    </span>
                  )}
                </div>
                <div>
                  <Link
                    to={`/profile/${selectedUser.uid}`}
                    className="text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {selectedUser.name}
                  </Link>
                  <p className="text-xs text-gray-400">Developer</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length > 0 ? (
                  messages.map(msg => {
                    const isMe = msg.senderUid === currentUser.uid
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {msg.senderPhoto ? (
                            <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-indigo-600">
                              {msg.senderName ? msg.senderName[0].toUpperCase() : '?'}
                            </span>
                          )}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No messages yet. Say hello! 👋
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No user selected */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">Select a developer to start chatting</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Chat