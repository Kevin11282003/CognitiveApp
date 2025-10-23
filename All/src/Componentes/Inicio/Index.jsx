import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import "../../App.css";

export default function Inicio() {
  const navigate = useNavigate();
  const [notificacion, setNotificacion] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rol, setRol] = useState(""); // 👈 estado para guardar el rol
  const [cargando, setCargando] = useState(true);

  // 🧠 Cargar nombre y rol del usuario desde Supabase
  useEffect(() => {
    async function fetchUsuario() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setNombreUsuario("Usuario");
          setCargando(false);
          return;
        }

        const { data, error } = await supabase
          .from("usuario")
          .select("nombre, roll")
          .eq("id", user.id)
          .single();

        if (error || !data) {
          setNombreUsuario("Usuario");
        } else {
          setNombreUsuario(data.nombre);
          setRol(data.roll); // 👈 guardar rol
        }
      } catch (err) {
        console.error("Error obteniendo datos del usuario:", err);
        setNombreUsuario("Usuario");
      } finally {
        setCargando(false);
      }
    }

    fetchUsuario();
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

        {/* 🔐 Solo visible si el rol es Admin */}
        {rol === "Admin" && (
          <div className="inicio-card admin-card">
            <span className="ico">🛠️</span>
            <h3>Panel de administración</h3>
            <p>Gestiona el contenido y ejercicios de la aplicación.</p>
            <div className="admin-buttons">
              <button onClick={() => navigate("/admin/crud-logica")}>
                Editar lógica →
              </button>
              <button onClick={() => navigate("/admin/crud-ejercicios")}>
                Editar ejercicios →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notificación opcional */}
      {notificacion && <div className="notificacion">{notificacion}</div>}
    </div>
  );
}
