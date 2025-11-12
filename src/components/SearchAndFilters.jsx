import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
import './SearchAndFilters.css';

const SearchAndFilters = () => {
    const { 
        filtro, 
        setFiltro, 
        categoriaFiltro, 
        setCategoriaFiltro, 
        categorias 
    } = useContext(ProductContext);

    return (
        <div className="search-filters-container">
            <div className="search-box">
                <i className="fa-solid fa-search search-icon"></i>
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="search-input"
                />
                {filtro && (
                    <button 
                        onClick={() => setFiltro('')}
                        className="clear-search-btn"
                        title="Limpiar búsqueda"
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                )}
            </div>

            <div className="filters-container">
                <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="category-filter"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                            {categoria}
                        </option>
                    ))}
                </select>

                {(filtro || categoriaFiltro) && (
                    <button 
                        onClick={() => {
                            setFiltro('');
                            setCategoriaFiltro('');
                        }}
                        className="clear-filters-btn"
                    >
                        <i className="fa-solid fa-filter-circle-xmark"></i>
                        Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchAndFilters; 