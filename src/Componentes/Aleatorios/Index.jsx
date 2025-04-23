import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Aleatorios() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  const obtenerAleatorio = async () => {
    setCargando(true);
    const idAleatorio = Math.floor(Math.random() * 292) + 1; // ID aleatorio entre 1 y 292

    try {
      const res = await fetch(`https://digi-api.com/api/v1/digimon/${idAleatorio}`);
      const json = await res.json();

      if (json.id) {
        navigate(`/detalle/${json.id}`); // Navegamos a la página de detalles del Digimon aleatorio
      } else {
        console.error('No se encontró un Digimon con este ID');
      }
    } catch (error) {
      console.error('Error al cargar el Digimon aleatorio:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h2>Digimon Aleatorio</h2>
      <button onClick={obtenerAleatorio} disabled={cargando}>
        {cargando ? 'Cargando...' : 'Ver Digimon Aleatorio'}
      </button>
    </div>
  );
}

export default Aleatorios;
