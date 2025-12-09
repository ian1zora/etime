import { useState, useEffect } from 'react'

export default function PromoSlider() {
  const [current, setCurrent] = useState(0)

  const slides = [
    {
      title: '🎉 ¡10% de Descuento!',
      text: 'Usa el código PROMO10 en tu compra',
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: '🔥 ¡20% OFF!',
      text: 'Código DESCUENTO20 disponible ahora',
      bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: '⭐ Productos Destacados',
      text: 'Descubre nuestras especialidades del día',
      bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="promo-slider">
      <div className="promo-slide" style={{ background: slides[current].bg }}>
        <h3>{slides[current].title}</h3>
        <p>{slides[current].text}</p>
      </div>
      <div className="promo-dots">
        {slides.map((_, i) => (
          <button 
            key={i} 
            className={i === current ? 'active' : ''} 
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  )
}
