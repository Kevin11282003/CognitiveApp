import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Accesibilidad.css";

export default function Accesibilidad() {
  const navigate = useNavigate();
  const [fs, setFs] = useState(18);
  const [contraste, setContraste] = useState(false);

  return (
    <div
      className={`acces-container ${contraste ? "alto-contraste" : ""}`}
      style={{ fontSize: fs }}
    >
      <div className="acces-actions">
        <button onClick={() => navigate(-1)}>← Volver</button>
      </div>

      <h2 className="acces-titulo">Accesibilidad y apariencia</h2>

      <div className="acces-grid">
        <div className="acces-card">
          <strong>Tamaño de letra</strong>
          <p>Cambia el tamaño base de la tipografía para mejorar la lectura.</p>
          <div className="controls">
            <button onClick={() => setFs(16)}>A 16</button>
            <button onClick={() => setFs(18)}>A 18</button>
            <button onClick={() => setFs(20)}>A 20</button>
          </div>
        </div>

        <div className="acces-card">
          <strong>Contraste</strong>
          <p>Activa el modo de alto contraste para mejorar la visibilidad.</p>
          <button onClick={() => setContraste(!contraste)}>
            Alternar contraste
          </button>
        </div>

        <div className="acces-card">
          <strong>Preferencias</strong>
          <p>Guardamos tus preferencias de accesibilidad en este navegador.</p>
          <button onClick={() => { setFs(18); setContraste(false); }}>
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}
