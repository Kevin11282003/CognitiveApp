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
    roll: ""
  });

  const [nuevaUrl, setNuevaUrl] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos del usuario
  useEffect(() => {
    async function fetchUsuario() {
      setCargando(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("usuario")
            .select("*")
            .eq("id", user.id)
            .single();
          if (data) {
            setUsuario(data);
            setForm(data);
            fetchImagenes(user.id);
          } else {
            setError("Error al cargar los datos del usuario.");
          }
        }
      } catch (error) {
        setError("Error al obtener los datos del usuario.");
      } finally {
        setCargando(false);
      }
    }

    fetchUsuario();
  }, []);

  const fetchImagenes = async (usuarioid) => {
    setCargando(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("multimedia")
        .select("*")
        .eq("usuarioid", usuarioid);
      if (data) {
        setImagenes(data);
      } else {
        setError("Error al cargar las imágenes.");
      }
    } catch (error) {
      setError("Error al cargar las imágenes.");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setCargando(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("usuario")
        .update(form)
        .eq("id", usuario.id);
      if (error) {
        setError("Error al actualizar");
      } else {
        alert("Datos actualizados");
      }
    } catch (error) {
      setError("Error al actualizar");
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarUrl = async () => {
    if (!nuevaUrl.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("multimedia")
        .insert([{ url: nuevaUrl, usuarioid: usuario.id }]);
      if (error) {
        setError("Error al agregar la imagen");
      } else {
        setNuevaUrl("");
        fetchImagenes(usuario.id);
      }
    } catch (error) {
      setError("Error al agregar la imagen");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarImagen = async (id) => {
    setCargando(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("multimedia")
        .delete()
        .eq("id", id);
      if (!error) {
        setImagenes(imagenes.filter((img) => img.id !== id));
      } else {
        setError("Error al eliminar la imagen.");
      }
    } catch (error) {
      setError("Error al eliminar la imagen.");
    } finally {
      setCargando(false);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setImagenes([]);
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!usuario) return <p>No se encontró el usuario.</p>;

  return (
  <div id="divsu">
    <div className="perfil-section">
      <h2>Perfil de Usuario</h2>
      <div className="form-group">
        <label>Nombre:
          <input name="nombre" value={form.nombre} onChange={handleChange} />
        </label>
        <label>Correo:
          <input name="correo" value={form.correo} onChange={handleChange} />
        </label>
        <label>Fecha de nacimiento:
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
        </label>
        <label>Teléfono:
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </label>
        <label>Rol:
          <input name="roll" value={form.roll} onChange={handleChange} />
        </label>
      </div>
      <button onClick={handleUpdate} disabled={cargando}>Guardar cambios</button>
    </div>

    <div className="imagenes-section">
      <h3>Agregar imagen</h3>
      <div className="agregar-imagen">
        <input
          type="text"
          placeholder="URL de la imagen"
          value={nuevaUrl}
          onChange={(e) => setNuevaUrl(e.target.value)}
        />
        <button onClick={handleAgregarUrl} disabled={cargando}>Agregar</button>
      </div>

      <h3>Imágenes guardadas</h3>
      <ul className="lista-imagenes">
        {imagenes.map((img) => (
          <li key={img.id}>
            <img src={img.url} alt="Imagen" width="150" />
            <br />
            <button onClick={() => handleEliminarImagen(img.id)} disabled={cargando}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>

    <div className="logout-section">
      <h2>¿Deseas cerrar sesión?</h2>
      <button onClick={handleLogout} disabled={cargando}>Cerrar sesión</button>
    </div>
  </div>
);

}
