import React from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function Ejercicios() {
  const navigate = useNavigate();

  const categorias = [
    { 
      icono: "🧩", 
      titulo: "Memoria", 
      desc: "Recuerda y repite secuencias numéricas aleatorias para entrenar tu memoria.", 
      ruta: "/Memoria" 
    },
    { 
      icono: "🤸‍♂️",
      titulo: "Ejercicios físicos",
      desc: "Movilidad, flexibilidad y relajación con rutinas sencillas.",
      ruta: "/categorias" 
    },
    { 
      icono: "🧠", 
      titulo: "Lógica", 
      desc: "Juego de lógica y razonamiento con evaluación automática de respuestas usando IA",
      ruta: "/logica" 
    },
    { 
      icono: "🔤", 
      titulo: "Vocabulario", 
      desc: "Forma cadenas de palabras conectadas por letras para desafiar tu vocabulario.", 
      ruta: "/Palabras" 
    },
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
            <button onClick={() => navigate(cat.ruta)}>Iniciar →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
