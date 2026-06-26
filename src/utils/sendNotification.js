import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const sendNotification = async ({ toUid, fromName, fromPhoto, type, postId }) => {
  // Don't notify yourself
  if (!toUid) return

  await addDoc(collection(db, 'notifications'), {
    toUid,
    fromName,
    fromPhoto: fromPhoto || '',
    type,        // 'like' | 'comment' | 'message'
    postId: postId || null,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export default sendNotification