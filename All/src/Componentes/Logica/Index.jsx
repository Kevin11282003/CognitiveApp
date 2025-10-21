import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ INSEGURA PARA PRODUCCIÓN: Usa esto solo para pruebas
const API_KEY = "API_KEY_AQUI_XD"; // ← Reemplaza esto con tu clave de Gemini

function JuegoLogica() {
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState("");
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

useEffect(() => {
  async function cargarPreguntas() {
    const { data, error } = await supabase
      .from("ejercicios_logica")
      .select("*");

    if (error) {
      console.error("Error cargando preguntas:", error.message);
    } else {
      setPreguntas(data);
      if (data.length > 0) {
        setPreguntaActual(data[Math.floor(Math.random() * data.length)]);
      }
    }
  }

  cargarPreguntas();
}, []);


  async function enviarRespuesta() {
  if (!respuestaUsuario.trim()) return alert("Por favor ingresa una respuesta.");
  if (!API_KEY || API_KEY === "TU_API_KEY_AQUI") {
    setError("Por favor, reemplaza TU_API_KEY_AQUI con tu clave real de Gemini.");
    return;
  }

  setEnviando(true);
  setRetroalimentacion(null);
  setError(null);

  const prompt = `
Eres un asistente que evalúa respuestas a preguntas de lógica y razonamiento.
Pregunta: "${preguntaActual.pregunta}"
Respuesta del usuario: "${respuestaUsuario}"
¿La respuesta es correcta? Da una retroalimentación breve y clara en español.
  `;

try {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = result.response.text(); // ✅ usa el método directo, más estable
  setRetroalimentacion(text);


    const { data: userData, error: errUser } = await supabase.auth.getUser();
    if (!errUser && userData?.user) {
      await supabase.from("resultados_juegos").insert([
        {
          usuarioid: userData.user.id,
          juego: "JuegoLogica",
          puntaje: 1,
          nivel_fallido: 0,
          rondas_correctas: 0,
          tiempo_total: 0,
          ejercicio_fallido: null,
          respuesta_usuario: respuestaUsuario,
          retroalimentacion_ia: text,
        },
      ]);
    }
  } catch (err) {
    console.error("Error al comunicarse con Gemini:", err);
    setError("Hubo un problema al generar texto con Gemini.");

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
const genAI = new GoogleGenerativeAI("TU_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const result = await model.generateContent("Hola");
console.log(result.response.text());

  } finally {
    setEnviando(false);
  }
}



  function nuevaPregunta() {
    if (preguntas.length === 0) return;
    setPreguntaActual(preguntas[Math.floor(Math.random() * preguntas.length)]);
    setRespuestaUsuario("");
    setRetroalimentacion(null);
    setError(null);
  }

  function repetirRespuesta() {
    if (retroalimentacion) enviarRespuesta();
  }

  if (!preguntaActual) return <p>Cargando preguntas...</p>;

  return (
    <div className="juego-logica" style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Ejercicio de Lógica y Razonamiento</h2>

      <p><strong>Pregunta:</strong></p>
      <p style={{ fontStyle: "italic" }}>{preguntaActual.pregunta}</p>

      <textarea
        rows={4}
        style={{ width: "100%", marginTop: 10 }}
        placeholder="Escribe tu respuesta aquí..."
        value={respuestaUsuario}
        onChange={(e) => setRespuestaUsuario(e.target.value)}
        disabled={enviando}
      />

      <div style={{ marginTop: 15 }}>
        <button onClick={enviarRespuesta} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar respuesta"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {retroalimentacion && (
        <div style={{ marginTop: 20, backgroundColor: "#eef", padding: 15, borderRadius: 8 }}>
          <h3>Retroalimentación de la IA:</h3>
          <p>{retroalimentacion}</p>
        </div>
      )}

      <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
        <button onClick={repetirRespuesta} disabled={!retroalimentacion || enviando}>
          Repetir respuesta
        </button>
        <button onClick={nuevaPregunta} disabled={enviando}>
          Nueva pregunta
        </button>
        <button onClick={() => navigate("/Ejercicios")}>Volver al menú</button>
      </div>
    </div>
  );
}

export default JuegoLogica;
