import { useState, useEffect, useMemo } from 'react';
import Filtro from '../Filtros/Index';
import { useNavigate } from 'react-router-dom';
import './Style.css';

function Listar() {
  const [todos, setTodos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('All');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarTodos = async () => {
      setCargando(true);
      try {
        let ids = [];
        // Obtener todos los Digimon solo con ID y nombre
        for (let page = 0; page < 292; page++) {
          const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
          const json = await res.json();
          ids = ids.concat(json.content.map(d => d.id));
        }

        // Cargar detalles completos de cada Digimon por su ID
        const peticiones = ids.map(id =>
          fetch(`https://digi-api.com/api/v1/digimon/${id}`)
            .then(res => res.json())
            .catch(() => null)
        );

        const resultados = await Promise.all(peticiones);
        const datosCompletos = resultados.filter(d => d !== null && d.name);

        setTodos(datosCompletos);
      } catch (e) {
        console.error("Error cargando Digimon:", e);
      } finally {
        setCargando(false);
      }
    };

    cargarTodos();
  }, []);

  // Usamos useMemo para evitar recalcular los filtros y búsquedas en cada render
  const tiposUnicos = useMemo(() => [...new Set(
    todos.flatMap(d => d.types?.map(t => t.type)).filter(Boolean)
  )], [todos]);

  const handleTipoChange = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  // Filtrar y buscar en los Digimons solo cuando sea necesario
  const resultadosFiltrados = useMemo(() => {
    let resultados = todos;

    if (tipoSeleccionado !== 'All') {
      resultados = resultados.filter(d =>
        d.types?.some(t => t.type === tipoSeleccionado)
      );
    }

    if (busqueda.length >= 3 && isNaN(busqueda)) {
      resultados = resultados.filter(d =>
        d.name.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (!isNaN(busqueda)) {
      resultados = resultados.filter(d =>
        d.id.toString().includes(busqueda)
      );
    }

    return resultados;
  }, [todos, tipoSeleccionado, busqueda]);

  return (
    <>
      <input
        type="text"
        placeholder="Buscar Digimon"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <div className="c-filtro">
        <Filtro tipos={tiposUnicos} onTipoChange={handleTipoChange} />
      </div>

      <section className="c-lista">
        {resultadosFiltrados.map((digimon, index) => (
          <div
            className="c-lista-digimon"
            onClick={() => navigate(`/detalle/${digimon.id}`)}
            key={index}
          >
            <p>ID: {digimon.id}</p>
            <img
              src={digimon.images?.[0]?.href || 'https://via.placeholder.com/60?text=No+Img'}
              alt={`Digimon ${digimon.name}`}
              height="60"
              loading="lazy"
            />
            <p>{digimon.name}</p>
            <p>
              Tipo: {
                digimon.types && digimon.types.length > 0
                  ? digimon.types.map(t => t.type).join(', ')
                  : 'Desconocido'
              }
            </p>
          </div>
        ))}
      </section>

      {cargando && <p className="cargando">Cargando Digimon... Puede tardar un poco ⚙️</p>}
    </>
  );
}

export default Listar;
