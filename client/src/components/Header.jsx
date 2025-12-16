export default function Header({ cartCount, onCartClick, user, onLogout, onLogin, onRegister }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <img src="/assets/img/logo.png" alt="E-TIME logo" id="logo" />
        <div className="brand">
          <h1>E-TIME</h1>
          <small>el momento perfecto para disfrutar</small>
        </div>
      </div>
      <div className="header-right">
        <nav className="main-nav">
          <a href="#catalog">Catálogo</a>
          {user ? (
            <>
              <span style={{color: '#fff', opacity: 0.9}}>Hola, {user.nombre}</span>
              <button onClick={onLogout} className="btn-logout">Cerrar Sesión</button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="btn-auth">Iniciar Sesión</button>
              <button onClick={onRegister} className="btn-auth">Registrarse</button>
            </>
          )}
        </nav>
        <div className="cart">
          <button onClick={onCartClick} aria-label="Carrito">🛒</button>
          <span className="cart-count">{cartCount}</span>
        </div>
      </div>
    </header>
  )
}
