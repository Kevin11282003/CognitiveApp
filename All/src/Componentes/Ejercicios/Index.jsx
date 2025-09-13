import React from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function Ejercicios() {
  const navigate = useNavigate();

  const categorias = [
    { icono: "🧩", titulo: "Memoria", desc: "Secuencias, pares, recuerdo diferido" },
    { icono: "🔎", titulo: "Atención", desc: "Selección, inhibición, tiempo de reacción" },
    { icono: "🧠", titulo: "Lógica", desc: "Patrones, series, resolución simple" },
    { icono: "🔤", titulo: "Vocabulario", desc: "Semejanzas, anagramas, definición" },
  ];

  return (
    <div className="ejercicios-container">
      <div className="ejercicios-actions">
        <button onClick={() => navigate(-1)}>← Volver</button>
      </div>

      <h2 className="ejercicios-titulo">Módulos de ejercicios</h2>
      <p className="ejercicios-subtitulo">
        Selecciona una categoría para comenzar. La dificultad se adapta a tu desempeño.
      </p>

      <div className="ejercicios-grid">
        {categorias.map((cat) => (
          <div className="ejercicios-card" key={cat.titulo}>
            <span className="ico">{cat.icono}</span>
            <h3>{cat.titulo}</h3>
            <p>{cat.desc}</p>
            <button onClick={() => navigate("/Memoria")}>Iniciar →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
