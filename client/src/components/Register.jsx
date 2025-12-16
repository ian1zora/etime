import { useState } from 'react'

export default function Register({ onRegister, onSwitchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario: nombre, email, contrasena: password })
      })
      const data = await res.json()
      console.log('Respuesta registro:', data)
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onRegister(data.user)
      } else {
        setError(data.message || 'Error al registrarse')
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
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit">Registrarse</button>
        </form>
        <button className="auth-switch" onClick={onSwitchToLogin}>¿Ya tienes cuenta? Inicia sesión</button>
      </div>
    </div>
  )
}
