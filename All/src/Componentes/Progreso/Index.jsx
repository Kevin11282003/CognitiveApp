import React from "react";
import { useNavigate } from "react-router-dom";
import "./Progreso.css";

export default function Progreso() {
  const navigate = useNavigate();

  const datosSemana = [60, 75, 80, 50, 90, 70, 85];
  const datosMes = Array.from({ length: 12 }, () =>
    Math.floor(40 + Math.random() * 55)
  );

  return (
    <div className="progreso-container">
      <div className="progreso-actions">
        <button onClick={() => navigate(-1)}>← Volver</button>
      </div>

      <h2 className="progreso-titulo">Tu progreso</h2>
      <p className="progreso-subtitulo">
        Resumen visual de tu rendimiento. (Datos de ejemplo)
      </p>

      <div className="progreso-charts">
        <div className="progreso-chart">
          <strong>Desempeño semanal</strong>
          <div className="bar-wrap">
            {datosSemana.map((v, i) => (
              <div key={i} className="bar" style={{ height: v + "px" }}></div>
            ))}
          </div>
          <p className="legend">🗓️ Últimos 7 días</p>
        </div>

        <div className="progreso-chart">
          <strong>Desempeño mensual</strong>
          <div className="bar-wrap">
            {datosMes.map((v, i) => (
              <div key={i} className="bar" style={{ height: v + "px" }}></div>
            ))}
          </div>
          <p className="legend">📅 Últimos 30 días</p>
        </div>
      </div>
    </div>
  );
}
