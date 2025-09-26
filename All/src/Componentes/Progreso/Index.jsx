import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "../../App.css";

export default function Progreso({ usuarioId }) {
  const [cargando, setCargando] = useState(true);
  const [racha, setRacha] = useState(0);
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [fallos, setFallos] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState([]);

  const coloresJuegos = {
    PalabrasEncadenadas: "#0d8abc",
    Secuencias: "#f39c12",
    TriggerQuest: "#27ae60",
    Default: "#7f8c8d"
  };

  useEffect(() => {
    if (usuarioId) cargarDatos();
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
      if (userError) throw userError;
      setRacha(userData?.racha_diaria || 0);

      // Resultados del usuario
      const { data, error: resultadosError } = await supabase
        .from("resultados_juegos")
        .select("*")
        .eq("usuarioid", usuarioId)
        .order("fecha", { ascending: true });
      if (resultadosError) throw resultadosError;
      setResultados(data);

      // Puntaje total
      const total = data.reduce((sum, r) => sum + r.puntaje, 0);
      setPuntajeTotal(total);

      // Ranking global con nombres
      const { data: rankingData, error: rankingError } = await supabase
        .from("resultados_juegos")
        .select("usuarioid, puntaje, usuario!inner(nombre)");
      if (rankingError) throw rankingError;

      // Agrupar puntaje por usuario
      const rankingArr = Object.values(
        rankingData.reduce((acc, r) => {
          if (!acc[r.usuarioid]) {
            acc[r.usuarioid] = { nombre: r.usuario.nombre, puntaje_total: 0 };
          }
          acc[r.usuarioid].puntaje_total += r.puntaje;
          return acc;
        }, {})
      ).sort((a, b) => b.puntaje_total - a.puntaje_total);
      setRanking(rankingArr);

      // Ejercicios fallidos nivel <5
      const fallosData = data.filter(r => r.nivel_fallido < 5);
      setFallos(fallosData);

      // Semana actual
      const hoy = new Date();
      const primerDiaSemana = new Date(hoy);
      primerDiaSemana.setDate(hoy.getDate() - hoy.getDay()); // domingo
      setSemanaSeleccionada(getSemana(primerDiaSemana));

      // Tab juego activo
      const juegos = [...new Set(data.map(r => r.juego))];
      setJuegoActivo(juegos[0] || null);

    } catch (err) {
      console.error("Error cargando progreso:", err.message);
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

  const datosPorJuegoSemana = (juego) => {
    if (!semanaSeleccionada.length) return [];
    return semanaSeleccionada.map(dia => {
      const diaStr = dia.toISOString().split("T")[0];
      const pts = resultados
        .filter(r => r.juego === juego && r.fecha.split("T")[0] === diaStr)
        .reduce((sum, r) => sum + r.puntaje, 0);
      return { dia: dia.toLocaleDateString("es-CO", { weekday: "short" }), puntaje: pts };
    });
  };

  if (cargando) return <p>⏳ Cargando...</p>;
  if (!resultados.length) return <p>No hay datos disponibles</p>;

  const juegos = [...new Set(resultados.map(r => r.juego))];

  return (
    <div className="progreso-container">
      <h2>📊 Tu progreso</h2>
      <p style={{ fontWeight: "bold", color: "#e67e22" }}>
        🔥 Racha diaria: {racha} día{racha !== 1 ? "s" : ""} consecutivo(s)
      </p>
      <p style={{ fontWeight: "bold", color: "#27ae60" }}>
        🏆 Puntaje total: {puntajeTotal}
      </p>

      {/* Tabs por juego */}
      <div className="tabs">
        {juegos.map(j => (
          <button
            key={j}
            className={juegoActivo === j ? "active" : ""}
            onClick={() => setJuegoActivo(j)}
          >
            {j}
          </button>
        ))}
      </div>

      {/* Gráfica semana actual */}
      {juegoActivo && (
        <div className="tab-content">
          <h3>{juegoActivo} - Semana actual</h3>

          {/* Puntaje total de ese juego */}
          <p style={{ fontWeight: "bold", color: "#2980b9", marginBottom: "5px" }}>
            🎯 Puntaje total en {juegoActivo}:{" "}
            {resultados
              .filter(r => r.juego === juegoActivo)
              .reduce((sum, r) => sum + r.puntaje, 0)}
          </p>

          {/* Veces jugado ese juego */}
          <p style={{ fontWeight: "bold", color: "#8e44ad", marginBottom: "10px" }}>
            🎮 Veces jugado en {juegoActivo}:{" "}
            {resultados.filter(r => r.juego === juegoActivo).length}
          </p>

          <div className="grafica-semana">
            <div className="bar-wrap">
              {datosPorJuegoSemana(juegoActivo).map((d, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: `${Math.min(d.puntaje, 1000) / 10}px`,
                    backgroundColor: coloresJuegos[juegoActivo] || coloresJuegos.Default,
                    transition: "height 0.5s ease"
                  }}
                  title={`${d.dia}: ${d.puntaje} pts`}
                ></div>
              ))}
            </div>
            <div className="dias-legend">
              {datosPorJuegoSemana(juegoActivo).map((d, i) => (
                <span key={i}>{d.dia}</span>
              ))}
            </div>
          </div>
        </div>
      )}

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
      </div>

      {/* Ejercicios fallidos */}
      <div className="ejercicios-fallidos">
        <h3>❌ Ejercicios perdidos críticos</h3>
        <table>
          <thead>
            <tr>
              <th>Juego</th>
              <th>Fecha</th>
              <th>Nivel fallido</th>
              <th>Ejercicio fallido</th>
            </tr>
          </thead>
          <tbody>
            {fallos.map((f, i) => (
              <tr key={i}>
                <td>{f.juego}</td>
                <td>{new Date(f.fecha).toLocaleString()}</td>
                <td>{f.nivel_fallido}</td>
                <td>{f.ejercicio_fallido || "No definido"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
