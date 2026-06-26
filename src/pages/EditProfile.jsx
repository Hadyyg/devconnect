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

  const [formData, setFormData] = useState({ name: '', bio: '', github: '', linkedin: '', skills: [] })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const initialized = useRef(false)

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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
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

  const inputStyle = {
    width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '12px 16px', fontSize: '14px',
    color: '#fafafa', outline: 'none', fontFamily: 'Inter, sans-serif',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: '500', color: '#a1a1aa', display: 'block', marginBottom: '6px',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #1f1f1f', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fafafa', letterSpacing: '-1px', marginBottom: '32px' }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: '#111111', border: '1px solid #1f1f1f',
          borderRadius: '20px', padding: '28px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>
                  {formData.name ? formData.name[0].toUpperCase() : '?'}
                </span>
              )}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#818cf8', cursor: 'pointer' }}>
                Change photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>JPG, PNG up to 2MB</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell other developers about yourself..."
              style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
            />
          </div>

          {/* GitHub */}
          <div>
            <label style={labelStyle}>GitHub URL</label>
            <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" style={inputStyle} />
          </div>

          {/* LinkedIn */}
          <div>
            <label style={labelStyle}>LinkedIn URL</label>
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" style={inputStyle} />
          </div>

          {/* Skills */}
          <div>
            <label style={labelStyle}>Skills</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SKILLS_OPTIONS.map(skill => {
                const isSelected = formData.skills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      fontSize: '12px', fontWeight: '600', padding: '5px 14px', borderRadius: '20px',
                      border: `1px solid ${isSelected ? '#6366f1' : '#2a2a2a'}`,
                      backgroundColor: isSelected ? '#6366f120' : 'transparent',
                      color: isSelected ? '#818cf8' : '#52525b',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', fontSize: '14px', fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${currentUser.uid}`)}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                border: '1px solid #2a2a2a', backgroundColor: 'transparent',
                color: '#71717a', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default EditProfile