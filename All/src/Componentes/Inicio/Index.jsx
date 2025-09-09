import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Inicio.css";

export default function Inicio() {
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState("");

  const handleRecordatorio = () => {
    setNotificacion("✅ ¡Recuerda hacer tus ejercicios de hoy!");
    setTimeout(() => setNotificacion(""), 3000);
  };

  return (
    <div className="inicio-container">
      {/* Barra de acciones */}
      <div className="inicio-actions">
        <button onClick={() => navigate(-1)}>← Volver</button>
        <button onClick={handleRecordatorio}>📌 Recordatorio</button>
      </div>

      {/* Notificación */}
      {notificacion && (
        <div className="inicio-notificacion">{notificacion}</div>
      )}

      {/* Bienvenida */}
      <h2 className="inicio-titulo">Bienvenido, Usuario 👋</h2>
      <p className="inicio-subtitulo">
        Continúa tu entrenamiento diario. Mantén tus rachas activas y fortalece
        memoria, lógica, vocabulario y atención.
      </p>

      {/* Opciones */}
      <div className="inicio-opciones">
        <div className="inicio-card">
          <span className="ico">🎯</span>
          <h3>Ejercicios diarios</h3>
          <p>Sesión guiada de 10–15 min con dificultad adaptativa.</p>
          <button onClick={() => navigate("/ejercicios")}>Empezar →</button>
        </div>

        <div className="inicio-card">
          <span className="ico">📈</span>
          <h3>Ver progreso</h3>
          <p>Consulta tus resultados y rachas semanales y mensuales.</p>
          <button onClick={() => navigate("/progreso")}>Abrir →</button>
        </div>

        <div className="inicio-card">
          <span className="ico">⚙️</span>
          <h3>Accesibilidad</h3>
          <p>Ajusta tamaño de letra, alto contraste y ayudas visuales.</p>
          <button onClick={() => navigate("/accesibilidad")}>Configurar →</button>
        </div>
      </div>
    </div>
  );
}
