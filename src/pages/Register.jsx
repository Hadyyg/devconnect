import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase/config'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const createUserDoc = async (user, name) => {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email: user.email,
      photoURL: user.photoURL || '',
      bio: '',
      skills: [],
      github: '',
      linkedin: '',
      followers: [],
      following: [],
      createdAt: serverTimestamp(),
    }, { merge: true })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(user, { displayName: formData.name })
      await createUserDoc(user, formData.name)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      await createUserDoc(user, user.displayName)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      background: 'radial-gradient(ellipse at top, #6366f115 0%, transparent 60%)',
    }}>
      <div style={{
        backgroundColor: '#111111', border: '1px solid #1f1f1f',
        borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 0 60px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800', color: 'white',
            margin: '0 auto 16px', boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>D</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fafafa', letterSpacing: '-0.5px' }}>
            Create account
          </h1>
          <p style={{ fontSize: '14px', color: '#71717a', marginTop: '6px' }}>
            Join the developer community
          </p>
        </div>

        {/* Error */}
        {error ? (
          <div style={{
            backgroundColor: '#ef444415', border: '1px solid #ef444430',
            borderRadius: '10px', padding: '12px 16px',
            fontSize: '13px', color: '#f87171', marginBottom: '20px',
          }}>
            {error}
          </div>
        ) : null}

        {/* Google first */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px',
            border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a',
            color: '#fafafa', fontSize: '14px', fontWeight: '500',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', fontFamily: 'Inter, sans-serif',
            marginBottom: '24px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f' }} />
          <span style={{ fontSize: '12px', color: '#52525b' }}>or with email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f' }} />
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Hadi Yaghi"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hadi@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: '14px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register