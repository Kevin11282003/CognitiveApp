import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase"; // 👈 importa supabase
import "../../App.css";

export default function Inicio() {
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState(""); // 👈 estado para guardar el nombre
  const [cargando, setCargando] = useState(true);

  // 🧠 Cargar nombre del usuario desde Supabase
  useEffect(() => {
    async function fetchNombre() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNombreUsuario("Usuario");
          setCargando(false);
          return;
        }

        const { data, error } = await supabase
          .from("usuario")
          .select("nombre")
          .eq("id", user.id)
          .single();

        if (error || !data) {
          setNombreUsuario("Usuario");
        } else {
          setNombreUsuario(data.nombre);
        }
      } catch (err) {
        console.error("Error obteniendo el nombre:", err);
        setNombreUsuario("Usuario");
      } finally {
        setCargando(false);
      }
    }

    fetchNombre();
  }, []);

  const handleRecordatorio = () => {
    setNotificacion("✅ ¡Recuerda hacer tus ejercicios de hoy!");
    setTimeout(() => setNotificacion(""), 3000);
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div className="inicio-container">
      {/* Bienvenida */}
      <h2 className="inicio-titulo">Bienvenido, {nombreUsuario} 👋</h2>
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
          <span className="ico">👤</span>
          <h3>Mi perfil</h3>
          <p>Consulta o edita tu información personal y datos de la cuenta.</p>
          <button onClick={() => navigate("/usuario")}>Ir a perfil →</button>
        </div>
      </div>
    </div>
  );
}
