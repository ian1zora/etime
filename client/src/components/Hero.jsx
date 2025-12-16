export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h2>E-TIME</h2>
        <p>Realizá tus pedidos de comidas y bebidas de forma simple, aprovechá promociones exclusivas y disfrutá.</p>
        <div className="hero-actions">
          <a href="#catalog" className="btn-green">Ver catálogo</a>
        </div>
      </div>
      <div className="hero-image">
        <img src="/assets/img/landing-hero.png" alt="Hero" />
      </div>
    </section>
  )
}
