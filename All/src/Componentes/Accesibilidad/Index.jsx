import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function Accesibilidad() {
  const navigate = useNavigate();

  // Cargar valores iniciales desde localStorage o valores por defecto
  const [fs, setFs] = useState(() => {
    return parseInt(localStorage.getItem("fontSize")) || 18;
  });

  const [contraste, setContraste] = useState(() => {
    return localStorage.getItem("contraste") === "true" || false;
  });

  // Guardar en localStorage cada vez que cambie el tamaño de letra
  useEffect(() => {
    localStorage.setItem("fontSize", fs);
  }, [fs]);

  // Guardar en localStorage cada vez que cambie el contraste
  useEffect(() => {
    localStorage.setItem("contraste", contraste);
  }, [contraste]);

  // Aplicar estilos globales al body y otros contenedores
  useEffect(() => {
    document.body.style.fontSize = `${fs}px`;

    if (contraste) {
      document.body.classList.add("alto-contraste");
    } else {
      document.body.classList.remove("alto-contraste");
    }
  }, [fs, contraste]);

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
          <button
            onClick={() => {
              setFs(18);
              setContraste(false);
              localStorage.removeItem("fontSize");
              localStorage.removeItem("contraste");
            }}
          >
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}
