import React from 'react';
import { Link } from 'react-router-dom';

function Menu({ cambiarTema }) {
  return (
    <nav>
      <div className="menu">
        {/* Enlaces del menú */}
        <ul className="menu-list">
          <li>
            <Link to="/Listar">Lista</Link>
          </li>
          <li>
            <Link to="/aleatorios">Aleatorio</Link>
          </li>
          <li>
            <Link to="/favoritos">Favoritos</Link>
          </li>
          <li>
            <Link to="/Original">Original</Link>
          </li>
          <li>
            <Link to="/Usuario">Usuario</Link>
          </li>
        </ul>
        {/* Selector de Tema */}
        <div className="theme-selector">
          <label htmlFor="theme">Seleccionar Tema:</label>
          <select
            id="theme"
            onChange={(e) => cambiarTema(e.target.value)}
            defaultValue="light"
          >
            <option value="light">Tema Claro</option>
            <option value="dark">Tema Oscuro</option>
            <option value="vintage">Tema Vintage</option>
          </select>
        </div>
      </div>
    </nav>
  );
}

export default Menu;
