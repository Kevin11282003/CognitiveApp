import { useState, useEffect } from 'react';
import Filtro from '../Filtros/Index';
import { useNavigate } from 'react-router-dom';
import './Style.css';

function Listar() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        if (tipoSeleccionado === 'All') {
          const res = await fetch("https://digi-api.com/api/v1/digimon?limit=1460");
          const json = await res.json();
          setData(json.content);
        } else {
          const res = await fetch(`https://digi-api.com/api/v1/type/${tipoSeleccionado}`);
          const json = await res.json();
          const listaFiltrada = json.digimon.map(d => d.digimon); // Depende de cómo venga este endpoint
          setData(listaFiltrada);
        }
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    obtenerDatos();
  }, [tipoSeleccionado]);

  const handleTipoChange = (tipo) => {
    setTipoSeleccionado(tipo);
  };

  // 🔍 Filtros
  let resultados = data;

  if (busqueda.length >= 3 && isNaN(busqueda)) {
    resultados = data.filter(digimon =>
      digimon.name.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  if (!isNaN(busqueda)) {
    resultados = data.filter(digimon =>
      digimon.id.toString().includes(busqueda)
    );
  }

  return (
    <>
      <input
        type="text"
        placeholder="Buscar Digimon"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      <Filtro onTipoChange={handleTipoChange} />

      <section className='c-lista'>
        {resultados.map((digimon, index) => (
          <div
            className='c-lista-digimon'
            onClick={() => navigate(`/detalle/${digimon.id}`)}
            key={index}
          >
            <p>ID: {digimon.id}</p>
            <img
              src={digimon.image || 'https://via.placeholder.com/60?text=No+Img'}
              alt={`Digimon ${digimon.name}`}
              width='auto'
              height='60'
              loading='lazy'
            />
            <p>{digimon.name}</p>
          </div>
        ))}
      </section>
    </>
  );
}

export default Listar;
