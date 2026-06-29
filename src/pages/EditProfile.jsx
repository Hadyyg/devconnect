import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { db, storage, auth } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import useUserData from '../hooks/UseUserData'

const SKILLS_OPTIONS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
  'CSS', 'HTML', 'SQL', 'Firebase', 'Git', 'Vue', 'Next.js',
]

const EditProfile = () => {
  const { currentUser } = useAuth()
  const { userData, loading } = useUserData(currentUser?.uid)
  const navigate = useNavigate()
  const initialized = useRef(false)

  const [formData, setFormData] = useState({ name: '', bio: '', github: '', linkedin: '', skills: [] })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (userData && !initialized.current) {
      initialized.current = true
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        github: userData.github || '',
        linkedin: userData.linkedin || '',
        skills: userData.skills || [],
      })
      setPreview(userData.photoURL || null)
    }
  }, [userData])

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleSkill = (skill) => setFormData(prev => ({
    ...prev,
    skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
  }))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!userData) return
    setSaving(true)
    try {
      let photoURL = userData.photoURL || ''
      if (photo) {
        const photoRef = ref(storage, `avatars/${currentUser.uid}`)
        await uploadBytes(photoRef, photo)
        photoURL = await getDownloadURL(photoRef)
      }
      await updateDoc(doc(db, 'users', currentUser.uid), { ...formData, photoURL })
      await updateProfile(auth.currentUser, { displayName: formData.name, photoURL })
      navigate(`/profile/${currentUser.uid}`)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
    </div>
  )

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#f0f0f0', letterSpacing: '-1px', marginBottom: '32px' }}>Edit Profile</h1>

      <form onSubmit={handleSave}>
        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <div className="avatar" style={{
                width: '72px', height: '72px', fontSize: '24px', fontWeight: '800', color: 'white',
                boxShadow: '0 0 24px rgba(91,95,199,0.3)', transition: 'opacity 0.2s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {preview
                  ? <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{formData.name?.[0]?.toUpperCase() || '?'}</span>
                }
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0)', transition: 'background 0.2s ease',
                  fontSize: '18px',
                }}>📷</div>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#818cf8' }}>Click to change photo</p>
              <p style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>JPG, PNG up to 2MB</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' }}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" />
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' }}>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell other developers about yourself..." className="input-field" style={{ resize: 'none', lineHeight: '1.6' }} />
          </div>

          {/* GitHub */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' }}>GitHub URL</label>
            <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" className="input-field" />
          </div>

          {/* LinkedIn */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '6px' }}>LinkedIn URL</label>
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="input-field" />
          </div>

          {/* Skills */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '10px' }}>Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SKILLS_OPTIONS.map(skill => {
                const isSelected = formData.skills.includes(skill)
                return (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)} style={{
                    fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px',
                    border: `1px solid ${isSelected ? '#5b5fc7' : '#1e1e1e'}`,
                    background: isSelected ? 'rgba(91,95,199,0.12)' : 'transparent',
                    color: isSelected ? '#818cf8' : '#444',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                  }}>
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="submit" disabled={saving} className="accent-btn" style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={() => navigate(`/profile/${currentUser.uid}`)} className="ghost-btn">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditProfile