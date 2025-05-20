import React from 'react';
import { Link } from 'react-router-dom';

function Menu() {
  return (
    <nav className="c-menu">
          <Link to="/Listar">Listar</Link>
          <Link to="/Aleatorios">Capturados</Link>
          <Link to="/Favoritos">Aleatorio</Link>
          <Link to="/Usuario">Usuarios</Link>
    </nav>
  );
}

export default Menu;