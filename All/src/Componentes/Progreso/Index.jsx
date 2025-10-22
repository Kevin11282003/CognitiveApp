import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsPDF } from "jspdf";
import "../../App.css";

const API_KEY = "AIzaSyD8X3RAGJdbbe6PU3v__5SL3ciSG3NANMY";


export default function Progreso({ usuarioId }) {
  const [cargando, setCargando] = useState(true);
  const [racha, setRacha] = useState(0);
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState([]);
  const [ejerciciosMap, setEjerciciosMap] = useState({});
  const [ejerciciosLogicaMap, setEjerciciosLogicaMap] = useState({});
  const [generandoPDF, setGenerandoPDF] = useState(false);


  const coloresJuegos = {
    PalabrasEncadenadas: "#0d8abc",
    Secuencias: "#f39c12",
    TriggerQuest: "#27ae60",
    Ejercicios: "#8e44ad",
    JuegoLogica: "#16a085",
    Default: "#7f8c8d",
  };

  useEffect(() => {
    if (usuarioId) cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Racha diaria
      const { data: userData, error: userError } = await supabase
        .from("usuario")
        .select("racha_diaria")
        .eq("id", usuarioId)
        .single();
      if (userError) console.warn(userError);
      setRacha(userData?.racha_diaria || 0);

      // Traer resultados (sin joins)
      const { data, error } = await supabase
        .from("resultados_juegos")
        .select("*")
        .eq("usuarioid", usuarioId)
        .order("fecha", { ascending: true });

      if (error) throw error;
      const resultadosData = data || [];
      setResultados(resultadosData);

      // Obtener ids únicos de ejercicios y ejercicios_logica
      const ejercicioIds = [
        ...new Set(
          resultadosData
            .map((r) => r.ejercicio_id)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];
      const logicaIds = [
        ...new Set(
          resultadosData
            .map((r) => r.ejerciciologica_id)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];

      // Traer ejercicios si hay ids
      let ejerciciosFetched = [];
      if (ejercicioIds.length) {
        const { data: ejData, error: ejError } = await supabase
          .from("ejercicios")
          .select("id, titulo, categoria, nivel")
          .in("id", ejercicioIds);
        if (ejError) throw ejError;
        ejerciciosFetched = ejData || [];
      }

      // Traer ejercicios_logica si hay ids
      let logicaFetched = [];
      if (logicaIds.length) {
        const { data: logData, error: logError } = await supabase
          .from("ejercicios_logica")
          .select("id, pregunta")
          .in("id", logicaIds);
        if (logError) throw logError;
        logicaFetched = logData || [];
      }

      // Crear mapas por id para acceso rápido en render
      const ejMap = Object.fromEntries(
        (ejerciciosFetched || []).map((e) => [e.id, e])
      );
      const logMap = Object.fromEntries(
        (logicaFetched || []).map((l) => [l.id, l])
      );
      setEjerciciosMap(ejMap);
      setEjerciciosLogicaMap(logMap);

      // Puntaje total
      const total = resultadosData.reduce((sum, r) => sum + (r.puntaje || 0), 0);
      setPuntajeTotal(total);

      // Ranking global (sin cambios)
      const { data: rankingData } = await supabase
        .from("resultados_juegos")
        .select("usuarioid, puntaje, usuario!inner(nombre)");

      const rankingArr = Object.values(
        (rankingData || []).reduce((acc, r) => {
          if (!acc[r.usuarioid])
            acc[r.usuarioid] = { nombre: r.usuario.nombre, puntaje_total: 0 };
          acc[r.usuarioid].puntaje_total += r.puntaje;
          return acc;
        }, {})
      ).sort((a, b) => b.puntaje_total - a.puntaje_total);
      setRanking(rankingArr);

      // Semana actual
      const hoy = new Date();
      const primerDiaSemana = new Date(hoy);
      primerDiaSemana.setDate(hoy.getDate() - hoy.getDay()); // domingo
      setSemanaSeleccionada(getSemana(primerDiaSemana));

      const juegos = [...new Set(resultadosData.map((r) => r.juego))];
      setJuegoActivo(juegos[0] || null);
    } catch (err) {
      console.error("Error cargando progreso:", err.message || err);
    } finally {
      setCargando(false);
    }
  };

  const getSemana = (primerDia) => {
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(primerDia);
      d.setDate(primerDia.getDate() + i);
      dias.push(d);
    }
    return dias;
  };

    const generarReportePDF = async () => {
    if (!API_KEY) {
      alert("Falta la API Key de Gemini.");
      return;
    }
    setGenerandoPDF(true);

     try {
  const resumen = resultados
    .map((r) => {
      let infoExtra = "";
      if (r.juego === "Ejercicio") {
        const ej = ejerciciosMap[r.ejercicio_id];
        infoExtra = ej
          ? `Título: ${ej.titulo}, Categoría: ${ej.categoria}, Nivel: ${ej.nivel}`
          : "";
      } else if (r.juego === "JuegoLogica") {
        const log = ejerciciosLogicaMap[r.ejerciciologica_id];
        infoExtra = log
          ? `Pregunta: ${log.pregunta}, Respuesta: ${r.respuesta_usuario}, Feedback: ${r.retroalimentacion_ia}`
          : "";
      }
      return `Juego: ${r.juego}, Puntaje: ${r.puntaje}, Fecha: ${r.fecha}, ${infoExtra}`;
    })
    .join("\n");

  const prompt = `
Eres un asistente médico especializado en Alzheimer.
Analiza los resultados cognitivos de un paciente con Alzheimer basándote en sus puntuaciones de distintos juegos de memoria, lógica y lenguaje.

Datos del paciente:
${resumen}

Proporciona una retroalimentación profesional y empática sobre:
- Su estado cognitivo actual.
- Aspectos donde muestra mejora o deterioro.
- Recomendaciones personalizadas de estimulación cognitiva.
Redacta en tono humano, cálido y claro, en español.
`;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const retroalimentacionIA = result.response.text();

  // 🧠 Generar el PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let y = 15;

  // Encabezado
  doc.setFontSize(16);
  doc.text("Reporte Cognitivo - Paciente con Alzheimer", margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, margin, y);
  y += 7;
  doc.text(`Racha diaria: ${racha} días`, margin, y);
  y += 7;
  doc.text(`Puntaje total: ${puntajeTotal}`, margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("Retroalimentación de la IA:", margin, y);
  y += 8;

  // Texto dividido por líneas ajustadas al ancho de la página
  doc.setFontSize(11);
  const lineas = doc.splitTextToSize(retroalimentacionIA, pageWidth - margin * 2);

  // Escribir línea por línea, agregando páginas si se necesita
  for (let i = 0; i < lineas.length; i++) {
    if (y > pageHeight - 15) {
      doc.addPage();
      y = 15; // Reiniciar posición vertical
    }
    doc.text(lineas[i], margin, y);
    y += 7; // Espaciado entre líneas
  }

  // Guardar PDF
  doc.save("Reporte_Cognitivo.pdf");
} catch (err) {
  console.error("Error generando el reporte:", err);
  alert("Error al generar el reporte con IA.");
} finally {
  setGenerandoPDF(false);
}

  };


  const datosPorJuegoSemana = (juego) => {
    if (!semanaSeleccionada.length) return [];
    return semanaSeleccionada.map((dia) => {
      const diaStr = dia.toISOString().split("T")[0];
      const pts = resultados
        .filter((r) => r.juego === juego && r.fecha && r.fecha.split("T")[0] === diaStr)
        .reduce((sum, r) => sum + (r.puntaje || 0), 0);
      return {
        dia: dia.toLocaleDateString("es-CO", { weekday: "short" }),
        puntaje: pts,
      };
    });
  };

  const maxEscala = (juego) => {
    const datos = datosPorJuegoSemana(juego);
    const maxPuntaje = Math.max(...datos.map((d) => d.puntaje), 0);
    if (["Secuencias", "PalabrasEncadenadas"].includes(juego)) {
      return maxPuntaje + 1000;
    } else if (["Ejercicios", "JuegoLogica"].includes(juego)) {
      return maxPuntaje + 5;
    }
    return maxPuntaje + 10;
  };

  const resultadosSemana = resultados.filter((r) => {
    if (!semanaSeleccionada.length || !juegoActivo) return false;
    const fecha = r.fecha ? new Date(r.fecha) : null;
    const inicio = semanaSeleccionada[0];
    const fin = semanaSeleccionada[6];
    return fecha && fecha >= inicio && fecha <= fin && r.juego === juegoActivo;
  });

  if (cargando) return <p>⏳ Cargando...</p>;
  if (!resultados.length) return <p>No hay datos disponibles</p>;

  const juegos = [...new Set(resultados.map((r) => r.juego))];

  return (
    <div className="progreso-container">
      <h2>📊 Tu progreso</h2>
      <p style={{ fontWeight: "bold", color: "#e67e22" }}>
        🔥 Racha diaria: {racha} día{racha !== 1 ? "s" : ""} consecutivo(s)
      </p>
      <p style={{ fontWeight: "bold", color: "#27ae60" }}>
        🏆 Puntaje total: {puntajeTotal}
      </p>

      {/* Tabs de juegos */}
      <div className="tabs">
        {juegos.map((j) => (
          <button
            key={j}
            className={juegoActivo === j ? "active" : ""}
            onClick={() => setJuegoActivo(j)}
          >
            {j}
          </button>
        ))}
      </div>

      {/* Gráfica semanal */}
      {juegoActivo && (
        <div className="tab-content">
          <h3>{juegoActivo} - Semana actual</h3>
          <p style={{ fontWeight: "bold", color: "#2980b9" }}>
            🎯 Puntaje total:{" "}
            {resultados
              .filter((r) => r.juego === juegoActivo)
              .reduce((sum, r) => sum + (r.puntaje || 0), 0)}
          </p>

          <div className="grafica-semana" style={{ width: "100%", overflowX: "auto" }}>
            <div className="bar-wrap" style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "200px" }}>
              {datosPorJuegoSemana(juegoActivo).map((d, i) => {
                const max = maxEscala(juegoActivo);
                const altura = max > 0 ? (d.puntaje / max) * 180 : 0;
                return (
                  <div
                    key={i}
                    className="bar"
                    style={{
                      flex: 1,
                      minWidth: "30px",
                      height: `${altura}px`,
                      backgroundColor: coloresJuegos[juegoActivo] || coloresJuegos.Default,
                      borderRadius: "8px",
                      transition: "height 0.4s ease",
                    }}
                    title={`${d.dia}: ${d.puntaje} pts`}
                  ></div>
                );
              })}
            </div>
            <div className="dias-legend" style={{ display: "flex", justifyContent: "space-around" }}>
              {datosPorJuegoSemana(juegoActivo).map((d, i) => (
                <span key={i}>{d.dia}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de resultados según el juego (usando los mapas) */}
      <div className="ejercicios-fallidos">
        <h3>📋 Resultados de la semana ({juegoActivo})</h3>
        <table>
          <thead>
            <tr>
              {juegoActivo === "Secuencias" ?(
                <>
                  <th>Fecha</th>
                  <th>Puntaje</th>
                  <th>Rondas correctas</th>
                  <th>Tiempo total</th>
                  <th>Ejercicio fallido</th>
                </>
              ): juegoActivo === "PalabrasEncadenadas" ? (
                <>
                  <th>Fecha</th>
                  <th>Puntaje</th>
                  <th>Rondas correctas</th>
                  <th>Ejercicio fallido</th>
                </>
              ) : juegoActivo === "Ejercicio" ? (
                <>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Nivel</th>
                </>
              ) : juegoActivo === "JuegoLogica" ? (
                <>
                  <th>Fecha</th>
                  <th>Pregunta</th>
                  <th>Respuesta usuario</th>
                  <th>Retroalimentación IA</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {resultadosSemana.map((f, i) => (
              <tr key={i}>
                {juegoActivo === "Secuencias" ?(
                  <>
                    <td>{new Date(f.fecha).toLocaleString()}</td>
                    <td>{f.puntaje}</td>
                    <td>{f.rondas_correctas}</td>
                    <td>{f.tiempo_total}</td>
                    <td>{f.ejercicio_fallido || "N/A"}</td>
                  </>
                ): juegoActivo === "PalabrasEncadenadas" ? (
                  <>
                    <td>{new Date(f.fecha).toLocaleString()}</td>
                    <td>{f.puntaje}</td>
                    <td>{f.nivel_fallido}</td>
                    <td>{f.ejercicio_fallido || "N/A"}</td>
                  </>
                ) : juegoActivo === "Ejercicio" ? (
                  <>
                    <td>{new Date(f.fecha).toLocaleString()}</td>
                    <td>{ejerciciosMap[f.ejercicio_id]?.titulo || "N/A"}</td>
                    <td>{ejerciciosMap[f.ejercicio_id]?.categoria || "N/A"}</td>
                    <td>{ejerciciosMap[f.ejercicio_id]?.nivel || "N/A"}</td>
                  </>
                ) : juegoActivo === "JuegoLogica" ? (
                  <>
                    <td>{new Date(f.fecha).toLocaleString()}</td>
                    <td>{ejerciciosLogicaMap[f.ejerciciologica_id]?.pregunta || "N/A"}</td>
                    <td>{f.respuesta_usuario || "N/A"}</td>
                    <td>{f.retroalimentacion_ia || "N/A"}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ranking global */}
      <div className="ranking-global">
        <h3>🏅 Ranking global</h3>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Puntaje total</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => (
              <tr key={i}>
                <td>{r.nombre}</td>
                <td>{r.puntaje_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
              <button
        onClick={generarReportePDF}
        disabled={generandoPDF}
        style={{
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {generandoPDF ? "Generando reporte..." : "🧾 Generar reporte IA (PDF)"}
      </button>
      </div>
    </div>
  );
}
