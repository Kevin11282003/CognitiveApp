import { useState, useEffect } from "react";
import "../../App.css"; // Usa tu mismo archivo de estilos

function EjercicioSecuencias() {
  const [secuencia, setSecuencia] = useState([]);
  const [respuesta, setRespuesta] = useState("");
  const [nivel, setNivel] = useState(3); // empieza con secuencia de 3
  const [mensaje, setMensaje] = useState(null);
  const [mostrarSecuencia, setMostrarSecuencia] = useState(true);

  // Generar nueva secuencia al cargar o cuando el nivel cambie
  useEffect(() => {
    generarSecuencia();
  }, [nivel]);

  const generarSecuencia = () => {
    const nuevaSecuencia = Array.from({ length: nivel }, () =>
      Math.floor(Math.random() * 9) + 1 // números del 1 al 9
    );
    setSecuencia(nuevaSecuencia);
    setMostrarSecuencia(true);

    // Ocultar después de unos segundos (ej. 3s + 0.5s por nivel)
    setTimeout(() => setMostrarSecuencia(false), 3000 + nivel * 500);
  };

  const handleVerificar = () => {
    if (respuesta.trim() === secuencia.join(" ")) {
      setMensaje("✅ ¡Correcto! Avanzas al siguiente nivel.");
      setNivel(nivel + 1); // aumentar dificultad
    } else {
      setMensaje("❌ Incorrecto. Intenta nuevamente.");
    }
    setRespuesta("");
    setTimeout(() => setMensaje(null), 2000);
  };

  return (
    <div className="ejercicio-container">
      <h2>🧠 Ejercicio de Secuencias</h2>
      <p>Repite en orden la secuencia de números mostrada.</p>

      {/* Mostrar secuencia */}
      {mostrarSecuencia ? (
        <div className="secuencia">
          <h3>{secuencia.join(" ")}</h3>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribe la secuencia aquí (ej. 1 2 3)"
          />
          <button onClick={handleVerificar}>Verificar</button>
        </div>
      )}

      {/* Mostrar mensaje */}
      {mensaje && (
        <div
          style={{
            background: mensaje.includes("Correcto") ? "#4caf50" : "#f44336",
            color: "white",
            padding: "10px",
            marginTop: "15px",
          }}
        >
          {mensaje}
        </div>
      )}

      <p>
        <strong>Nivel actual:</strong> {nivel}
      </p>
    </div>
  );
}

export default EjercicioSecuencias;
