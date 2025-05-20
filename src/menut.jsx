import React from 'react';
import { Link } from 'react-router-dom';

function Menu() {
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
      </div>
    </nav>
  );
}

export default Menu;