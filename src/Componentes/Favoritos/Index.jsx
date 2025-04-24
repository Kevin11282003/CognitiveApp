import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Style.css';

function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const idsFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        // Obtener todos los Digimons favoritos
        const peticiones = idsFavoritos.map(id =>
          fetch(`https://digi-api.com/api/v1/digimon/${id}`)
            .then(res => res.json())
            .catch(() => null)
        );
        const resultados = await Promise.all(peticiones);
        const datosCompletos = resultados.filter(d => d !== null && d.name);
        setFavoritos(datosCompletos);
      } catch (e) {
        console.error("Error cargando favoritos:", e);
      }
    };
    cargarFavoritos();
  }, []);

  return (
    <div className="favoritos">
      <h2>Mis Digimons Favoritos</h2>
      {favoritos.length === 0 ? (
        <p>No tienes Digimons favoritos aún.</p>
      ) : (
        <section className="c-lista">
          {favoritos.map((digimon, index) => (
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
      )}
    </div>
  );
}

export default Favoritos;
