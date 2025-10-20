import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import "../../App.css";

function ReproductorEjercicio() {
  const { id } = useParams();  // id del ejercicio seleccionado
  const [ejercicio, setEjercicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pasos, setPasos] = useState([]);
  const [pasoActual, setPasoActual] = useState(0);
  const [ejecutando, setEjecutando] = useState(false);
  const navigate = useNavigate();

  const speechRef = useRef(null);
  const detenidoRef = useRef(false);

  const cargarEjercicio = async () => {
    const { data, error } = await supabase
      .from("ejercicios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error al cargar ejercicio:", error.message);
    } else {
      setEjercicio(data);
      const pasosSeparados = data.descripcion.split("|").map(p => p.trim());
      setPasos(pasosSeparados);
    }
    setLoading(false);
  };

  const leerEnVozAlta = (texto) => {
    return new Promise((resolve, reject) => {
      if (detenidoRef.current) return reject("Detenido");

      const speech = new SpeechSynthesisUtterance(texto);
      speech.lang = "es-ES";
      speechRef.current = speech;

      speech.onend = () => {
        speechRef.current = null;
        if (detenidoRef.current) reject("Detenido");
        else resolve();
      };

      speech.onerror = (e) => {
        speechRef.current = null;
        reject(e.error);
      };

      window.speechSynthesis.speak(speech);
    });
  };

  const ejecutarPasos = async () => {
    if (ejecutando || pasos.length === 0) return;

    setEjecutando(true);
    detenidoRef.current = false;
    setPasoActual(0);

    try {
      await leerEnVozAlta(`Vamos a comenzar el ejercicio: ${ejercicio.titulo}`);
      await leerEnVozAlta(`Duración estimada: ${ejercicio.duracion_estimada} segundos.`);

      for (let i = 0; i < pasos.length; i++) {
        if (detenidoRef.current) break;

        setPasoActual(i);
        await leerEnVozAlta(pasos[i]);

        if (detenidoRef.current) break;

        const espera = Math.floor(ejercicio.duracion_estimada / pasos.length) * 1000;
        await new Promise((resolve) => setTimeout(resolve, espera));
      }

      if (!detenidoRef.current) {
        await leerEnVozAlta("¡Muy bien! Has terminado este ejercicio.");
        await registrarResultado();
      }
    } catch (error) {
      if (error !== "Detenido") {
        console.error("Error en síntesis de voz:", error);
      }
    }

    setEjecutando(false);
    detenidoRef.current = false;
    setPasoActual(0);
  };

  const detenerEjercicio = () => {
    detenidoRef.current = true;
    setEjecutando(false);
    setPasoActual(0);
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
  };

  const registrarResultado = async () => {
    const { data: userData, error: errUser } = await supabase.auth.getUser();
    if (errUser || !userData.user) {
      console.error("Usuario no autenticado:", errUser);
      return;
    }
    const usuarioid = userData.user.id;

    const nuevoRegistro = {
      usuarioid,
      juego: "Ejercicio",
      puntaje: 1,
      nivel_fallido: 0,
      rondas_correctas: 0,
      tiempo_total: 0,
      ejercicio_fallido: null,
      ejercicio_id: Number(id),
    };

    const { error } = await supabase
      .from("resultados_juegos")
      .insert([nuevoRegistro]);
    if (error) {
      console.error("Error al registrar resultado:", error.message);
    }
  };

  useEffect(() => {
    cargarEjercicio();

    return () => {
      detenerEjercicio();
    };
  }, [id]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando ejercicio...</p>;
  if (!ejercicio) return <p style={{ textAlign: "center" }}>Ejercicio no encontrado.</p>;

  return (
    <div
      className="reproductor-ejercicio"
      style={{
        maxWidth: "480px",
        margin: "20px auto",
        padding: "0 15px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        🎧 {ejercicio.titulo}
      </h2>
      <p style={{ textAlign: "center", fontWeight: "600", marginBottom: "20px" }}>
        Duración estimada: {ejercicio.duracion_estimada} s
      </p>

      <ol style={{ paddingLeft: "20px", marginBottom: "30px" }}>
        {pasos.map((paso, idx) => (
          <li
            key={idx}
            style={{
              fontWeight: idx === pasoActual ? "700" : "400",
              marginBottom: "12px",
              color: idx === pasoActual ? "#1e90ff" : "#444",
              transition: "color 0.3s ease",
              fontSize: idx === pasoActual ? "1.1rem" : "1rem",
              userSelect: "none",
            }}
          >
            {paso}
          </li>
        ))}
      </ol>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        {!ejecutando ? (
          <button
            onClick={ejecutarPasos}
            style={{
              backgroundColor: "#4caf50",
              border: "none",
              padding: "12px 25px",
              borderRadius: "8px",
              fontSize: "1.1rem",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              minWidth: "200px",
            }}
            aria-label="Iniciar ejercicio guiado"
          >
            ▶️ Iniciar ejercicio guiado
          </button>
        ) : (
          <>
            <p
              style={{
                fontSize: "1rem",
                alignSelf: "center",
                margin: "0",
                color: "#333",
              }}
              aria-live="polite"
            >
              ⏱ Ejecutando ejercicio…
            </p>
            <button
              onClick={detenerEjercicio}
              style={{
                backgroundColor: "#e74c3c",
                border: "none",
                padding: "12px 25px",
                borderRadius: "8px",
                fontSize: "1.1rem",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                minWidth: "200px",
              }}
              aria-label="Detener ejercicio"
            >
              ⏹ Detener ejercicio
            </button>
          </>
        )}
      </div>

      {!ejecutando && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/Ejercicios")}
            style={{
              backgroundColor: "#1976d2",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "1rem",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              minWidth: "180px",
            }}
            aria-label="Volver al menú de ejercicios"
          >
            🔙 Volver al menú de ejercicios
          </button>
        </div>
      )}
    </div>
  );
}

export default ReproductorEjercicio;
