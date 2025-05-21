import { useState, useEffect } from 'react';
import './Stylef.css';

function Filtro({ onTipoChange }) {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const obtenerTipos = async () => {
      try {
        let todosLosTipos = [];
        const totalPaginas = 30;

        for (let pagina = 0; pagina < totalPaginas; pagina++) {
          const res = await fetch(`https://digi-api.com/api/v1/type?page=${pagina}`);
          const json = await res.json();
          if (json.content && Array.isArray(json.content.fields)) {
            todosLosTipos = todosLosTipos.concat(json.content.fields);
          }
        }

        setTipos(todosLosTipos);
      } catch (error) {
        console.error("Error obteniendo los tipos:", error);
      }
    };

    obtenerTipos();
  }, []);

  return (
    <div id="filtro-componente">
      <button className="filtro-componente-btn" onClick={() => onTipoChange("All")}>
        All
      </button>
      {tipos.map((tipo) => (
        <button
          className="filtro-componente-btn"
          key={tipo.id}
          onClick={() => onTipoChange(tipo.name)}
        >
          {tipo.name}
        </button>
      ))}
    </div>
  );
}

export default Filtro;
