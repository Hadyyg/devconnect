import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

// 1. Create the context
const AuthContext = createContext()

// 2. Custom hook to use the context easily
export const useAuth = () => useContext(AuthContext)

// 3. Provider component that wraps the whole app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Firebase listener — fires every time auth state changes
    // (login, logout, page refresh)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    // Cleanup listener when component unmounts
    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render anything until Firebase tells us the auth state */}
      {!loading && children}
    </AuthContext.Provider>
  )
}