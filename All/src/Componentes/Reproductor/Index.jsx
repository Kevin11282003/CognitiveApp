import { useEffect, useState } from "react";
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
    return new Promise((resolve) => {
      const speech = new SpeechSynthesisUtterance(texto);
      speech.lang = "es-ES";
      speech.onend = resolve;
      window.speechSynthesis.speak(speech);
    });
  };

  const ejecutarPasos = async () => {
    if (ejecutando || pasos.length === 0) return;
    setEjecutando(true);
    setPasoActual(0);

    await leerEnVozAlta(`Vamos a comenzar el ejercicio: ${ejercicio.titulo}`);
    await leerEnVozAlta(`Duración estimada: ${ejercicio.duracion_estimada} segundos.`);

    for (let i = 0; i < pasos.length; i++) {
      setPasoActual(i);
      await leerEnVozAlta(pasos[i]);
      // Esperar un tiempo proporcional al ejercicio (duración / cantidad de pasos)
      const espera = Math.floor(ejercicio.duracion_estimada / pasos.length) * 1000;
      await new Promise((resolve) => setTimeout(resolve, espera));
    }

    await leerEnVozAlta("¡Muy bien! Has terminado este ejercicio.");
    await registrarResultado();
    setEjecutando(false);
  };

  const registrarResultado = async () => {
    // Obtener usuario actual del supabase auth
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
  }, [id]);

  if (loading) return <p>Cargando ejercicio...</p>;
  if (!ejercicio) return <p>Ejercicio no encontrado.</p>;

  return (
    <div className="reproductor-ejercicio">
      <h2>🎧 {ejercicio.titulo}</h2>
      <p><strong>Duración estimada:</strong> {ejercicio.duracion_estimada} s</p>

      <ol>
        {pasos.map((paso, idx) => (
          <li key={idx}
              style={{
                fontWeight: idx === pasoActual ? "bold" : "normal",
                marginBottom: "8px"
              }}>
            {paso}
          </li>
        ))}
      </ol>

      <div style={{ marginTop: "20px" }}>
        {!ejecutando ? (
          <button onClick={ejecutarPasos}>▶️ Iniciar ejercicio guiado</button>
        ) : (
          <p>⏱ Ejecutando ejercicio…</p>
        )}
      </div>

      {!ejecutando && (
        <div style={{ marginTop: "30px" }}>
          <button onClick={() => navigate("/Ejercicios")}>
            🔙 Volver al menú de ejercicios
          </button>
        </div>
      )}
    </div>
  );
}

export default ReproductorEjercicio;
