import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

const useUserData = (uid) => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Don't run if no uid provided
    if (!uid) return

    // onSnapshot listens in real time — any change in Firestore
    // instantly updates the UI without refreshing
    const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
      if (doc.exists()) {
        setUserData({ id: doc.id, ...doc.data() })
      }
      setLoading(false)
    })

    // Cleanup listener
    return unsubscribe
  }, [uid])

  return { userData, loading }
}

export default useUserData