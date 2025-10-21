import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import "../../App.css";
import InstruccionesModal from "../Descripcion/Index"; // Importa el modal

function EjercicioPalabrasEncadenadas() {
  const [palabras, setPalabras] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [tiempo, setTiempo] = useState (20);
  const [perdio, setPerdio] = useState(false);
  const [puntaje, setPuntaje] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [showScoreMessage, setShowScoreMessage] = useState(false);
  const [ultimaPalabraGenerada, setUltimaPalabraGenerada] = useState("");
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true); // Estado para mostrar instrucciones

  const navigate = useNavigate();
  const timerRef = useRef(null);

  const normalizar = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // fetchPalabraInicial ahora no se llama en useEffect, sino cuando se oculta el modal (al continuar)
  const fetchPalabraInicial = async () => {
    try {
      const res = await fetch("https://rae-api.com/api/random");
      const data = await res.json();
      const palabra = data.ok ? data.data.word : "inicio";
      setPalabras([palabra]);
      setUltimaPalabraGenerada(palabra);
      setPartidaFinalizada(false);
    } catch (error) {
      console.error("Error obteniendo palabra inicial:", error);
      setPalabras(["inicio"]);
      setUltimaPalabraGenerada("inicio");
      setPartidaFinalizada(false);
    }
  };

  // Quitar este useEffect que se ejecutaba al cargar el componente:
  // useEffect(() => {
  //   fetchPalabraInicial();
  // }, []);

  const verificarPalabraDiccionario = async (palabra) => {
    try {
      const res = await fetch(
        `https://rae-api.com/api/words/${normalizar(palabra)}`
      );
      const data = await res.json();
      return data.ok;
    } catch (error) {
      console.error("Error verificando palabra:", error);
      return false;
    }
  };

  const ultimaPalabra = palabras[palabras.length - 1] || "";
  const obtenerUltimaSilaba = (palabra) => {
    if (palabra.length <= 2) return normalizar(palabra);
    return normalizar(palabra.slice(-2));
  };
  const ultimaSilaba = obtenerUltimaSilaba(ultimaPalabra);

  useEffect(() => {
    if (!ultimaPalabra || partidaFinalizada || mostrarInstrucciones) return; // NO iniciar temporizador si modal visible
    setTiempo(20);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempo((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!partidaFinalizada) {
            finalizarPartida("⏳ Se acabó el tiempo.", "time");
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [palabras, partidaFinalizada, mostrarInstrucciones]);

  const handleVerificar = async () => {
    if (partidaFinalizada || mostrarInstrucciones) return; // no dejar seguir jugando si modal visible

    const palabraIngresada = entrada.trim();
    const palabraNormalizada = normalizar(palabraIngresada);
    if (!palabraNormalizada) return;

    if (palabras.some((p) => normalizar(p) === palabraNormalizada)) {
      setMensaje("⚠️ Esa palabra ya fue usada. ¡No se puede repetir!");
      setTiempo((t) => t + 2);
      setEntrada("");
      return;
    }

    if (!palabraNormalizada.startsWith(ultimaSilaba)) {
      finalizarPartida(
        `❌ La palabra debe empezar con "${ultimaSilaba.toUpperCase()}".`,
        palabraIngresada
      );
      return;
    }

    const existe = await verificarPalabraDiccionario(palabraIngresada);
    if (!existe) {
      finalizarPartida(
        "❌ Esa palabra no existe en el diccionario español.",
        palabraIngresada
      );
      return;
    }

    // ✅ Correcto
    setPalabras([...palabras, palabraIngresada]);
    setEntrada("");
    setMensaje("✅ ¡Bien hecho!");
    const puntosGanados = 10 + tiempo;
    setPuntaje((p) => p + puntosGanados);
    setLastScore(puntosGanados);
    setShowScoreMessage(true);
    setTimeout(() => setShowScoreMessage(false), 2000);
    setUltimaPalabraGenerada(palabraIngresada);
  };

  const finalizarPartida = async (msg, palabraIncorrecta = "") => {
    setMensaje(msg);
    setPerdio(true);
    setPartidaFinalizada(true); // bloquear futuras acciones

    // usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No hay usuario autenticado");
      return;
    }

    const ejercicioFallido = `${ultimaPalabraGenerada},${palabraIncorrecta || "time"}`;

    const partida = {
      usuarioid: user.id,
      juego: "PalabrasEncadenadas",
      puntaje,
      nivel_fallido: palabras.length,
      rondas_correctas: 0,
      tiempo_total: 0,
      ejercicio_fallido: ejercicioFallido,
    };

    const { error } = await supabase.from("resultados_juegos").insert([partida]);
    if (error) console.error("Error guardando en Supabase:", error.message);
  };

  const handleReiniciar = async () => {
    setPerdio(false);
    setMensaje(null);
    setPuntaje(0);
    setEntrada("");
    setPalabras([]);
    setUltimaPalabraGenerada("");
    setPartidaFinalizada(false);
    await fetchPalabraInicial();
  };

  // Función para ocultar instrucciones y empezar juego
  const handleContinuar = () => {
    setMostrarInstrucciones(false);
    fetchPalabraInicial();
  };

  return (
    <div className="ejercicio-container">
      {mostrarInstrucciones && (
        <InstruccionesModal
          titulo="✍️ Palabras Encadenadas"
          texto="Debes escribir una palabra que comience con las dos últimas letras de la palabra anterior. Tienes 20 segundos para ingresar cada palabra. ¡Buena suerte!"
          onContinuar={handleContinuar}
        />
      )}

      {!mostrarInstrucciones && (
        <>
          <h2>✍️ Palabras Encadenadas</h2>
          <p>
            Escribe una palabra que empiece con la última sílaba resaltada de
            la palabra anterior.
          </p>

          {ultimaPalabra && (
            <h3>
              {ultimaPalabra.slice(0, -2)}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {ultimaPalabra.slice(-2)}
              </span>
            </h3>
          )}

          {!perdio ? (
            <div className="input-container">
              <input
                type="text"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder={`Debe empezar con "${ultimaSilaba}"`}
              />
              <button onClick={handleVerificar}>Ingresar</button>
            </div>
          ) : (
            <div className="resultado-actions" style={{ marginTop: "15px" }}>
              <button onClick={handleReiniciar}>🔄 Reintentar</button>
              <button onClick={() => navigate("/Ejercicios")}>🏠 Menú</button>
            </div>
          )}

          {!perdio && (
            <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
              ⏳ Tiempo restante: {tiempo} segundos
            </p>
          )}

          <p style={{ marginTop: "10px", fontWeight: "bold" }}>🏆 Puntaje: {puntaje}</p>

          {mensaje && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: mensaje.includes("✅")
                  ? "#4caf50"
                  : mensaje.includes("⚠️")
                  ? "#ff9800"
                  : "#f44336",
                color: "white",
              }}
            >
              {mensaje}
            </div>
          )}

          {showScoreMessage && <div className="puntaje-popup">+{lastScore} ✅</div>}

          <h4>Lista de palabras:</h4>
          <ul>
            {palabras.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default EjercicioPalabrasEncadenadas;
