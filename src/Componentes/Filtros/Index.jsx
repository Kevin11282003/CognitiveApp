import { useState, useEffect } from 'react';
import './Style.css';

function Filtro({ onTipoChange }) {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const obtenerTipos = async () => {
      try {
        const res = await fetch("https://digi-api.com/api/v1/type?limit=100");
        const json = await res.json();
        const lista = json.content.fields || []; // según el formato del JSON
        setTipos(lista);
      } catch (error) {
        console.error("Error obteniendo tipos:", error);
      }
    };

    obtenerTipos();
  }, []);

  return (
    <div className="c-filtro">
      <button className="c-filtro-btn" onClick={() => onTipoChange("All")}>
        All
      </button>
      {tipos.map((tipo) => (
        <button
          className="c-filtro-btn"
          key={tipo.id}
          onClick={() => onTipoChange(tipo.id)}
        >
          {tipo.name}
        </button>
      ))}
    </div>
  );
}

export default Filtro;
