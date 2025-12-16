export default function Controls({ categories, currentCategory, onCategoryChange, searchQuery, onSearchChange, currentSort, onSortChange }) {
  return (
    <section className="controls">
      <div className="categories">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={cat === currentCategory ? 'active' : ''} 
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="search-sort">
        <input 
          placeholder="Buscar..." 
          value={searchQuery} 
          onChange={(e) => onSearchChange(e.target.value)} 
        />
        <select value={currentSort} onChange={(e) => onSortChange(e.target.value)}>
          <option value="default">Ordenar</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>
    </section>
  )
}
