import { useState } from 'react'

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena: password })
      })
      const data = await res.json()
      console.log('Respuesta login:', data)
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        setError(data.message || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al conectar con el servidor')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src="/assets/img/logo.png" alt="Logo" className="auth-logo" />
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit">Entrar</button>
        </form>
        <button className="auth-switch" onClick={onSwitchToRegister}>¿No tienes cuenta? Regístrate</button>
      </div>
    </div>
  )
}
