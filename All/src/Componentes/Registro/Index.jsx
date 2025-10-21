import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import "../../App.css";

function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: '',
    telefono: '',
  });

  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // 🔹 Nuevo estado
  const navigate = useNavigate();

  useEffect(() => {
    setShowPassword(false); // Reinicia la visibilidad de contraseñas al cargar el componente
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);

    if (formulario.password !== formulario.confirmarPassword) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }

    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexPassword.test(formulario.password)) {
      setError("❌ La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número.");
      return;
    }

    const { data, error: errorAuth } = await supabase.auth.signUp({
      email: formulario.correo,
      password: formulario.password,
    });

    if (errorAuth) {
      setError(errorAuth.message);
      return;
    }

    const uid = data.user.id;

    const { error: errorInsert } = await supabase.from("usuario").insert([
      {
        id: uid,
        nombre: formulario.nombre,
        correo: formulario.correo,
        fecha_nacimiento: formulario.fechaNacimiento,
        telefono: formulario.telefono,
        roll: "usuario",
      },
    ]);

    if (errorInsert) {
      setError("Usuario creado pero error en tabla usuario: " + errorInsert.message);
    } else {
      navigate("/login");
    }
  };

  return (
    <section id="registro-container">
      <h4>Registro</h4>
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo"
          value={formulario.correo}
          onChange={handleChange}
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Contraseña"
          value={formulario.password}
          onChange={handleChange}
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          name="confirmarPassword"
          placeholder="Confirmar contraseña"
          value={formulario.confirmarPassword}
          onChange={handleChange}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          Mostrar contraseña
        </label>

        <h2>Fecha de nacimiento</h2>
        <div className="input-date-container">
          <input
            type="date"
            name="fechaNacimiento"
            id="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={handleChange}
            required
            className="custom-date-input"
          />
        </div>


        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formulario.telefono}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      <h4>Ya tengo cuenta y quiero Iniciar sesión</h4>
      <button onClick={() => navigate(`/login`)}>Iniciar sesión</button>
    </section>
  );
}

export default Registro;
