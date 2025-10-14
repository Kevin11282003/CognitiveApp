import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

function JuegoLogica() {
  const [pregunta, setPregunta] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [retro, setRetro] = useState(null);
  const [mostrarRetro, setMostrarRetro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPregunta();
  }, []);

  const cargarPregunta = async () => {
    setMostrarRetro(false);
    setRespuesta("");
    setRetro(null);

    const { data, error } = await supabase
      .from("ejercicios_logica")
      .select("*");

    if (error) {
      console.error("Error al cargar pregunta:", error.message);
      return;
    }

    const aleatoria = data[Math.floor(Math.random() * data.length)];
    setPregunta(aleatoria);
  };

  const analizarRespuestaIA = async (pregunta, respuestaUsuario) => {
    // Aquí simula el análisis por IA. En producción usarías una API, o tú mismo podrías integrar GPT.
    const prompt = `Pregunta: ${pregunta}\nRespuesta del usuario: ${respuestaUsuario}\nEvalúa si la respuesta es razonable o incorrecta y da una retroalimentación breve.`;
    const response = await fetch("/api/analizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();
    return result.retroalimentacion;
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return;

    const { data: userData, error: errUser } = await supabase.auth.getUser();
    if (errUser || !userData?.user) {
      alert("Usuario no autenticado.");
      return;
    }

    const retroalimentacion = await analizarRespuestaIA(pregunta.pregunta, respuesta);
    setRetro(retroalimentacion);
    setMostrarRetro(true);

    const nuevoResultado = {
      usuarioid: userData.user.id,
      juego: "Logica",
      puntaje: 1,
      nivel_fallido: 0,
      rondas_correctas: 0,
      tiempo_total: 0,
      ejercicio_fallido: null,
      ejercicio_id: pregunta.id,
      respuesta_usuario: respuesta,
      retroalimentacion_ia: retroalimentacion,
    };

    await supabase.from("resultados_juegos").insert([nuevoResultado]);
  };

  return (
    <div className="juego-logica">
      <h2>🧠 Juego de lógica y razonamiento</h2>

      {pregunta && !mostrarRetro && (
        <>
          <p><strong>Pregunta:</strong> {pregunta.pregunta}</p>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={4}
            style={{ width: "100%", marginTop: "10px" }}
            placeholder="Escribe tu respuesta aquí..."
          ></textarea>
          <br />
          <button onClick={enviarRespuesta}>✅ Enviar respuesta</button>
        </>
      )}

      {mostrarRetro && (
        <>
          <h3>📝 Retroalimentación de la IA:</h3>
          <p>{retro}</p>
          <button onClick={enviarRespuesta}>🔁 Repetir respuesta</button>
          <button onClick={cargarPregunta}>➡️ Nueva pregunta</button>
          <button onClick={() => navigate("/menu-juegos")}>🏠 Volver al menú</button>
        </>
      )}
    </div>
  );
}

export default JuegoLogica;
