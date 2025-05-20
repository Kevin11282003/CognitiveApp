import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Style.css'; // Puedes crear estilos personalizados aquí

function Detalle() {
  const { id } = useParams(); // Usamos useParams para obtener el ID desde la URL
  const navigate = useNavigate();
  const [digimon, setDigimon] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // Efecto para obtener la información del Digimon por su ID
  useEffect(() => {
    const fetchDigimon = async () => {
      try {
        const res = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
        const json = await res.json();
        setDigimon(json);
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        setIsFavorite(favoritos.includes(id));
      } catch (error) {
        console.error("Error cargando el Digimon:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDigimon();
  }, [id]);

  if (cargando) return <p>Cargando detalles...</p>;
  if (!digimon) return <p>No se encontró el Digimon.</p>;

  const handleAgregarFavorito = () => {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if (!favoritos.includes(id)) {
      favoritos.push(id);
      localStorage.setItem('favoritos', JSON.stringify(favoritos));
      setIsFavorite(true);
      setNotificacion('¡Digimon añadido a favoritos!');
        setTimeout(() => setNotificacion(null), 2000);
    }
  };
  const handleEliminarFavorito = () => {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    favoritos = favoritos.filter(favId => favId !== id);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    setIsFavorite(false);
    setNotificacion('¡Digimon eliminado de favoritos!');
    setTimeout(() => setNotificacion(null), 2000);
  };

  return (
    <div className="detalle-container">
      {/* Botón para volver atrás */}
      <button onClick={() => navigate(-1)}>← Volver</button>
                {/* Botón para añadir a favoritos */}
                {!isFavorite && (
            <button onClick={handleAgregarFavorito}>Añadir a favoritos</button>
          )}
          {isFavorite && <p>Este Digimon ya está en tus favoritos.</p>}

          {/* Botón para eliminar de favoritos */}
          {isFavorite && (
            <button onClick={handleEliminarFavorito}>Eliminar de favoritos</button>
          )}

                      {/* Mostrar notificación */}
                      {notificacion && (
        <div style={{ background: '#4caf50', color: 'white', padding: '10px', marginTop: '20px' }}>
          {notificacion}
        </div>
      )}

      <h2>{digimon.name}</h2>

      {/* Imagen del Digimon con fallback si no existe */}
      <img
        src={digimon.images?.[0]?.href || 'https://via.placeholder.com/150?text=No+Image'}
        alt={digimon.name}
        className="detalle-imagen"
      />

      <ul className="detalle-info">
        <li><strong>ID:</strong> {digimon.id}</li>
        <li><strong>Level:</strong> {digimon.levels?.map(l => l.level).join(', ')}</li>
        <li><strong>Type:</strong> {digimon.types?.map(t => t.type).join(', ')}</li>
        <li><strong>Attribute:</strong> {digimon.attributes?.map(a => a.attribute).join(', ')}</li>
        <li><strong>Field:</strong> {digimon.fields?.map(f => f.field).join(', ')}</li>
        <li><strong>X-Antibody:</strong> {digimon.xAntibody ? 'Yes' : 'No'}</li>
        <li><strong>Año de lanzamiento:</strong> {digimon.releaseDate}</li>
        <li>
          <strong>Descripción:</strong> {
            digimon.descriptions?.find(d => d.language === 'en_us')?.description ||
            'Descripción no disponible.'
          }
        </li>
      </ul>

      {digimon.skills?.length > 0 && (
        <div className="detalle-habilidades">
          <h3>Habilidades</h3>
          <ul>
            {digimon.skills.map(skill => (
              <li key={skill.id}>
                <strong>{skill.translation || skill.skill}</strong>: {skill.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {digimon.nextEvolutions?.length > 0 && (
        <div className="detalle-evoluciones">
          <h3>Siguientes Evoluciones</h3>
          <div className="evoluciones-grid">
            {digimon.nextEvolutions.map(evo => (
              <div
                key={evo.id}
                className="evolucion-card"
                onClick={() => navigate(`/detalle/${evo.id}`)} // Aquí corregimos la navegación
              >
                <img
                  src={evo.image || 'https://via.placeholder.com/100?text=No+Image'}
                  alt={evo.digimon}
                  height="80"
                />
                <p>{evo.digimon}</p>
                {evo.condition && <small>Condición: {evo.condition}</small>}
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

export default Detalle;