import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
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

  const [historialSecuencias, setHistorialSecuencias] = useState([]); // ← Aquí guardamos todas las secuencias generadas

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

    // Guardamos localmente la secuencia generada
    setHistorialSecuencias(prev => [...prev, nuevaSecuencia]);

    setTimeout(() => {
      setMostrarSecuencia(false);
      if (inputsRef.current[0]) inputsRef.current[0].focus();
      setTiempoInicio(Date.now());
    }, 3000 + nivel * 500);
  };

  const handleChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const nuevaRespuesta = [...respuesta];
      nuevaRespuesta[index] = value;
      setRespuesta(nuevaRespuesta);
      if (value !== "" && index < nivel - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && respuesta[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerificar = async () => {
    const tiempoRonda = tiempoInicio ? (Date.now() - tiempoInicio) / 1000 : 0;

    if (respuesta.join("") === secuencia.join("")) {
      audioExito.play();
      setRondasCorrectas(rondasCorrectas + 1);
      setTiempoTotal(tiempoTotal + tiempoRonda);

      const bonus = Math.max(0, 50 - Math.floor(tiempoRonda));
      const puntosRonda = 100 + bonus;
      setPuntaje(puntaje + puntosRonda);

      setLastScore(puntosRonda);
      setShowScoreMessage(true);
      setTimeout(() => setShowScoreMessage(false), 1500);

      const nuevosAciertos = aciertosSeguidos + 1;
      setAciertosSeguidos(nuevosAciertos);

      if (nuevosAciertos >= 3) {
        setNivel(nivel + 1);
        setAciertosSeguidos(0);
        setMensaje(null);
      } else {
        setMensaje(null);
        generarSecuencia();
      }
    } else {
      audioError.play();
      setMensaje("❌ Incorrecto. Fin de la partida.");
      setError(true);
      setMostrarPuntaje(true);

      // Guardamos en Supabase la última secuencia generada
      await guardarEnRanking();
    }
  };

  const guardarEnRanking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return console.error("No hay usuario autenticado");

    // Tomamos la última secuencia generada como la secuencia fallida
    const secuenciaFallida = historialSecuencias[historialSecuencias.length - 1].join(",");

    const partida = {
      usuarioid: user.id,
      juego: "Secuencias",
      puntaje,
      nivel_fallido: nivel,
      rondas_correctas: rondasCorrectas,
      tiempo_total: tiempoTotal.toFixed(1),
      ejercicio_fallido: secuenciaFallida,
    };

    // Guardar localmente
    const ranking = JSON.parse(localStorage.getItem("rankingSecuencias")) || [];
    ranking.push(partida);
    ranking.sort((a, b) => b.puntaje - a.puntaje);
    localStorage.setItem("rankingSecuencias", JSON.stringify(ranking));

    // Subir a Supabase
    const { error } = await supabase.from("resultados_juegos").insert([partida]);
    if (error) console.error("❌ Error subiendo a Supabase:", error.message);
  };

  const reiniciarJuego = () => {
    setNivel(3);
    setAciertosSeguidos(0);
    setRondasCorrectas(0);
    setTiempoTotal(0);
    setPuntaje(0);
    setMensaje(null);
    setMostrarPuntaje(false);
    setHistorialSecuencias([]);
    generarSecuencia();
  };

  const continuar = () => {
    if (irMenu) navigate("/Ejercicios");
    else reiniciarJuego();
  };

  const handleMenu = () => navigate("/Ejercicios");

  return (
    <div className="ejercicio-container">
      <h2>🧠 Ejercicio de Secuencias</h2>

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

          {mostrarSecuencia ? (
            <div className="secuencia">
              <h3>{secuencia.join(" ")}</h3>
            </div>
          ) : (
            <div className="inputs-secuencia">
              <div className="inputs-container">
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
              </div>
              <div className="verificar-container">
                <button onClick={handleVerificar}>Verificar</button>
              </div>
            </div>
          )}

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
            </div>
          )}

          <p><strong>Nivel actual:</strong> {nivel}</p>
          <p><strong>Progreso:</strong> {aciertosSeguidos}/3 aciertos para subir de nivel</p>
          <p>⭐ <strong>Puntaje:</strong> {puntaje}</p>
        </>
      )}

      {showScoreMessage && (
        <div className="puntaje-popup">+{lastScore} ✅</div>
      )}
    </div>
  );
}

export default EjercicioSecuencias;
