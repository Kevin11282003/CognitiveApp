import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';


function Menu() {
  return (
    <nav>
      <div className="menu">
        {/* Enlaces del menú */}
        <ul className="menu-list">
          <li>
            <Link to="/Inicio">Inicio</Link>
          </li>
          <li>
            <Link to="/Ejercicios">Ejercicios</Link>
          </li>
          <li>
            <Link to="/Progreso">Progreso</Link>
          </li>
          <li>
            <Link to="/Accesibilidad">Accesibilidad</Link>
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