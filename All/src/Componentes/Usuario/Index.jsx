import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "../../App.css";

export default function Usuario() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    fecha_nacimiento: "",
    telefono: "",
    roll: "",
    racha_diaria: 0,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    async function fetchUsuario() {
      setCargando(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError("Usuario no logueado");
          setCargando(false);
          return;
        }

        const { data, error } = await supabase
          .from("usuario")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error || !data) {
          setError("Error al cargar los datos del usuario.");
        } else {
          setUsuario(data);
          setForm(data);
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener los datos del usuario.");
      } finally {
        setCargando(false);
      }
    }

    fetchUsuario();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setCargando(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("usuario")
        .update({
          nombre: form.nombre,
          correo: form.correo,
          telefono: form.telefono,
        })
        .eq("id", usuario.id);

      if (error) {
        setError("Error al actualizar los datos: " + error.message);
      } else {
        alert("Datos actualizados correctamente");
        setUsuario({ ...usuario, ...form });
        setEditMode(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error al actualizar los datos.");
    } finally {
      setCargando(false);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recarga para volver al login o pantalla inicial
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!usuario) return <p>No se encontró el usuario.</p>;

  return (
    <div className="perfil-card moderno">
      <div className="avatar">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            usuario.nombre
          )}&background=random&color=fff&size=128&rounded=true&bold=true`}
          alt="Avatar"
        />
        <div className="racha">
          🔥 {usuario.racha_diaria} día{usuario.racha_diaria !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="datos">
        <h2>
          {editMode ? (
            <input name="nombre" value={form.nombre} onChange={handleChange} />
          ) : (
            usuario.nombre
          )}
        </h2>
        <p>
          <strong>Correo:</strong>{" "}
          {editMode ? (
            <input name="correo" value={form.correo} onChange={handleChange} />
          ) : (
            usuario.correo
          )}
        </p>
        <p>
          <strong>Fecha de nacimiento:</strong> {usuario.fecha_nacimiento}
        </p>
        <p>
          <strong>Teléfono:</strong>{" "}
          {editMode ? (
            <input name="telefono" value={form.telefono} onChange={handleChange} />
          ) : (
            usuario.telefono
          )}
        </p>

        {!editMode ? (
          <button className="btn-editar" onClick={() => setEditMode(true)}>
            ✏️ Editar
          </button>
        ) : (
          <button className="btn-guardar" onClick={handleUpdate}>
            💾 Guardar cambios
          </button>
        )}

        {/* Botón cerrar sesión */}
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}
