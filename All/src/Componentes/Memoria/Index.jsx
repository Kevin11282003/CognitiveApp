import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function EjercicioSecuencias() {
  const [secuencia, setSecuencia] = useState([]);
  const [respuesta, setRespuesta] = useState([]);
  const [nivel, setNivel] = useState(3);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarSecuencia, setMostrarSecuencia] = useState(true);
  const [aciertosSeguidos, setAciertosSeguidos] = useState(0);

  const [error, setError] = useState(false);
  const [mostrarPuntaje, setMostrarPuntaje] = useState(false);

  const [rondasCorrectas, setRondasCorrectas] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [irMenu, setIrMenu] = useState(false);

  const [showScoreMessage, setShowScoreMessage] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const audioExito = new Audio("/sounds/exito.mp3");
  const audioError = new Audio("/sounds/error.mp3");

  // Generar nueva secuencia
  useEffect(() => {
    generarSecuencia();
  }, [nivel]);

  const generarSecuencia = () => {
    const nuevaSecuencia = Array.from({ length: nivel }, () =>
      Math.floor(Math.random() * 9) + 1
    );
    setSecuencia(nuevaSecuencia);
    setRespuesta(Array(nivel).fill(""));
    setMostrarSecuencia(true);
    setError(false);

    setTimeout(() => {
      setMostrarSecuencia(false);
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
      setTiempoInicio(Date.now()); // iniciar conteo de tiempo
    }, 3000 + nivel * 500);
  };

  const handleChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const nuevaRespuesta = [...respuesta];
      nuevaRespuesta[index] = value;
      setRespuesta(nuevaRespuesta);

      // avanzar al siguiente input si escribe un número
      if (value !== "" && index < nivel - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  // 👈 Nuevo: moverse hacia atrás con Backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && respuesta[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerificar = () => {
    const tiempoRonda = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;

    if (respuesta.join("") === secuencia.join("")) {
      audioExito.play();
      setRondasCorrectas(rondasCorrectas + 1);
      setTiempoTotal(tiempoTotal + tiempoRonda);

      // calcular puntos: base 100 + bonus por rapidez
      const bonus = Math.max(0, 50 - Math.floor(tiempoRonda));
      const puntosRonda = 100 + bonus;
      setPuntaje(puntaje + puntosRonda);

      // mostrar popup animado
      setLastScore(puntosRonda);
      setShowScoreMessage(true);
      setTimeout(() => setShowScoreMessage(false), 1500);

      const nuevosAciertos = aciertosSeguidos + 1;
      setAciertosSeguidos(nuevosAciertos);

      if (nuevosAciertos >= 3) {
        setNivel(nivel + 1);
        setAciertosSeguidos(0);
        setMensaje(null); // quitamos texto largo
      } else {
        setMensaje(null); // solo usamos popup de puntaje
        generarSecuencia();
      }
    } else {
      audioError.play();
      setMensaje("❌ Incorrecto. Fin de la partida.");
      setAciertosSeguidos(0);
      setError(true);
      setMostrarPuntaje(true);

      guardarEnRanking(); // 👈 guardar en localStorage cuando termina
    }
  };

  const guardarEnRanking = () => {
    const partida = {
      puntaje,
      rondas: rondasCorrectas,
      tiempo: tiempoTotal.toFixed(1),
      fecha: new Date().toLocaleString(),
    };

    const ranking = JSON.parse(localStorage.getItem("rankingSecuencias")) || [];
    ranking.push(partida);

    // ordenar de mayor a menor puntaje
    ranking.sort((a, b) => b.puntaje - a.puntaje);

    localStorage.setItem("rankingSecuencias", JSON.stringify(ranking));
  };

  const reiniciarJuego = () => {
    setNivel(3);
    setAciertosSeguidos(0);
    setRondasCorrectas(0);
    setTiempoTotal(0);
    setPuntaje(0);
    setMensaje(null);
    setMostrarPuntaje(false);
    generarSecuencia();
  };

  const continuar = () => {
    if (irMenu) {
      navigate("/Ejercicios");
    } else {
      reiniciarJuego();
    }
  };

  // Manda al menú con puntaje
  const handleMenu = () => {
    navigate("/Ejercicios");
  };

  return (
    <div className="ejercicio-container">
      <h2>🧠 Ejercicio de Secuencias</h2>

      {/* Pantalla de puntaje */}
      {mostrarPuntaje ? (
        <div className="resultado-card">
          <h3>📊 Resultados</h3>
          <p>✅ Rondas correctas: <strong>{rondasCorrectas}</strong></p>
          <p>⏱️ Tiempo total: <strong>{tiempoTotal.toFixed(1)}s</strong></p>
          <p>⭐ Puntaje total: <strong>{puntaje}</strong></p>
          <div className="resultado-actions">
            <button onClick={continuar}>🔄 Reintentar</button>
            <button onClick={handleMenu}>🏠 Volver al Menú</button>
          </div>
        </div>
      ) : (
        <>
          <p>Memoriza la secuencia y repítela en orden.</p>

          {/* Mostrar secuencia */}
          {mostrarSecuencia ? (
            <div className="secuencia">
              <h3>{secuencia.join(" ")}</h3>
            </div>
          ) : (
            <div className="inputs-secuencia">
              {respuesta.map((num, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={num}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
              <button onClick={handleVerificar}>Verificar</button>
            </div>
          )}

          {/* Mensajes de error */}
          {mensaje && (
            <div
              style={{
                background: mensaje.includes("✅") ? "#4caf50" : "#f44336",
                color: "white",
                padding: "10px",
                marginTop: "15px",
                borderRadius: "8px",
              }}
            >
              {mensaje}
              {error && (
                <div className="resultado-actions">
                  <button
                    onClick={() => {
                      setIrMenu(false);
                      setMostrarPuntaje(true);
                    }}
                  >
                    🔄 Reintentar
                  </button>
                  <button
                    onClick={() => {
                      setIrMenu(true);
                      setMostrarPuntaje(true);
                    }}
                  >
                    🏠 Menú
                  </button>
                </div>
              )}
            </div>
          )}

          <p><strong>Nivel actual:</strong> {nivel}</p>
          <p><strong>Progreso:</strong> {aciertosSeguidos}/3 aciertos para subir de nivel</p>
          <p>⭐ <strong>Puntaje:</strong> {puntaje}</p>
        </>
      )}

      {/* Popup de puntaje ganado */}
      {showScoreMessage && (
        <div className="puntaje-popup">+{lastScore} ✅</div>
      )}
    </div>
  );
}

export default EjercicioSecuencias;
