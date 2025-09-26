import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function Accesibilidad() {
  const navigate = useNavigate();

  // Tamaño de letra inicial (desde localStorage o por defecto)
  const [fs, setFs] = useState(() => {
    return parseInt(localStorage.getItem("fontSize")) || 18;
  });

  // Estado de contraste inicial
  const [contraste, setContraste] = useState(() => {
    return localStorage.getItem("contraste") === "true" || false;
  });

  // Guardar tamaño de fuente en localStorage
  useEffect(() => {
    localStorage.setItem("fontSize", fs);
  }, [fs]);

  // Guardar contraste en localStorage
  useEffect(() => {
    localStorage.setItem("contraste", contraste);
  }, [contraste]);

  // Aplicar tamaño de fuente global
  useEffect(() => {
    document.documentElement.style.fontSize = `${fs}px`;
  }, [fs]);

  // Aplicar clase de alto contraste al body
  useEffect(() => {
    if (contraste) {
      document.body.classList.add("alto-contraste");
    } else {
      document.body.classList.remove("alto-contraste");
    }
  }, [contraste]);

  return (
    <div className="acces-container">
      <h2 className="acces-titulo">Opciones de accesibilidad</h2>

      <div className="acces-actions">
        <button onClick={() => setFs(fs + 2)}>Aumentar letra</button>
        <button onClick={() => setFs(fs > 10 ? fs - 2 : 10)}>
          Disminuir letra
        </button>
        <button onClick={() => setFs(18)}>Restablecer</button>
      </div>

      <div className="acces-actions">
        <button onClick={() => setContraste(!contraste)}>
          {contraste ? "Desactivar contraste alto" : "Activar contraste alto"}
        </button>
      </div>

      <div className="acces-card">
        <strong>Vista previa:</strong>
        <p style={{ fontSize: `${fs}px` }}>
          Este es un texto de ejemplo con el tamaño de letra actual.
        </p>
      </div>
    </div>
  );
}
