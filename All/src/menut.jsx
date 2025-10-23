import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function Menu() {
  const navigate = useNavigate();

  return (
    <>
      {/* 🔹 Menú inferior */}
      <nav className="bottom-nav">
        <ul className="menu-list">
          <li>
            <Link to="/Inicio">
              <span className="icon">🏠</span>
              <span className="text">Inicio</span>
            </Link>
          </li>
          <li>
            <Link to="/Ejercicios">
              <span className="icon">💪</span>
              <span className="text">Ejercicios</span>
            </Link>
          </li>
          <li>
            <Link to="/Progreso">
              <span className="icon">📊</span>
              <span className="text">Progreso</span>
            </Link>
          </li>
          <li>
            <Link to="/Usuario">
              <span className="icon">👤</span>
              <span className="text">Usuario</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* 🏠 Botón flotante de inicio */}
      <button className="btn-flotante" onClick={() => navigate("/Inicio")}>
        🏠
      </button>
    </>
  );
}

export default Menu;
