import { useState, useEffect } from 'react';
import Filtro from '../Filtros/Index';
import { useNavigate } from 'react-router-dom';
import './Style.css';

function Listar() {
  const [data, setData] = useState([]);  // Holds Digimons for current page
  const [todos, setTodos] = useState([]);  // Holds all Digimons for filtering
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('All');
  const [paginaActual, setPaginaActual] = useState(0);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Load Digimons by page, based on the selected type
  useEffect(() => {
    const obtenerDigimonPorPagina = async () => {
      setCargando(true);
      try {
        let allDigimon = [];
        const totalPages = 10;
        const startPage = paginaActual * 10;
        const endPage = startPage + 9;

        for (let page = startPage; page <= endPage && page < totalPages; page++) {
          const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
          const json = await res.json();
          allDigimon = allDigimon.concat(json.content);
        }

        // Apply filtering by selected type
        if (tipoSeleccionado !== 'All') {
          allDigimon = allDigimon.filter(digimon =>
            digimon.types?.some(t => t.type === tipoSeleccionado)
          );
        }

        setData(allDigimon);
      } catch (error) {
        console.error("Error obteniendo los Digimon:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDigimonPorPagina();
  }, [paginaActual, tipoSeleccionado]);  // Re-run when page or type is changed

  // Preload all Digimons to get the unique types
  useEffect(() => {
    if (todos.length === 0 && !cargando) {
      const cargarTodos = async () => {
        try {
          let allDigimon = [];
          for (let page = 0; page < 292; page++) {
            const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
            const json = await res.json();
            allDigimon = allDigimon.concat(json.content);
          }
          setTodos(allDigimon);
        } catch (e) {
          console.log("Error precargando Digimon:", e);
        }
      };

      setTimeout(() => {
        cargarTodos();
      }, 2000);
    }
  }, [todos.length, cargando]);

  // Extract unique types from all Digimons
  const tiposUnicos = [...new Set(todos.flatMap(d => d.types?.map(t => t.type)).filter(Boolean))];

  // Update the selected type for filtering
  const handleTipoChange = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  // Handle search input
  let resultados = busqueda.length >= 3 || !isNaN(busqueda) ? todos : data;

  if (busqueda.length >= 3 && isNaN(busqueda)) {
    resultados = todos.filter(d =>
      d.name.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (!isNaN(busqueda)) {
    resultados = todos.filter(d =>
      d.id.toString().includes(busqueda)
    );
  }

  const handleNextPage = () => {
    if (paginaActual < Math.floor(292 / 10)) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const handlePreviousPage = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Buscar Digimon"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <Filtro tipos={tiposUnicos} onTipoChange={handleTipoChange} />

      <section className="c-lista">
        {resultados.map((digimon, index) => (
          <div
            className="c-lista-digimon"
            onClick={() => navigate(`/detalle/${digimon.id}`)}
            key={index}
          >
            <p>ID: {digimon.id}</p>
            <img
              src={digimon.image || 'https://via.placeholder.com/60?text=No+Img'}
              alt={`Digimon ${digimon.name}`}
              width="auto"
              height="60"
              loading="lazy"
            />
            <p>{digimon.name}</p>
          </div>
        ))}
      </section>

      <div className="c-paginacion">
        <button onClick={handlePreviousPage}>Anterior</button>
        <button onClick={handleNextPage}>Siguiente</button>
      </div>

      {cargando && <p>Cargando...</p>}
    </>
  );
}

export default Listar;
