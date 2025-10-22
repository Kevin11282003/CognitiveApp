import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useNavigate } from 'react-router-dom';
import "../../App.css";

function Registro() {
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '', // 🔹 Campo de apellido
    correo: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: '',
    telefono: '',
    cedula: '', // 🔹 Campo de cédula
  });

  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // 🔹 Mensaje de éxito
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
    setSuccessMessage(''); // Reinicia el mensaje de éxito

    // Validación de contraseñas
    if (formulario.password !== formulario.confirmarPassword) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }

    // Validación de la contraseña
    const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regexPassword.test(formulario.password)) {
      setError("❌ La contraseña debe tener mínimo 8 caracteres, al menos una letra y un número.");
      return;
    }

    // Validación de teléfono (debe empezar con 3 y tener 10 dígitos)
    const regexTelefono = /^3\d{2} \d{3} \d{2} \d{2}$/;
    if (!regexTelefono.test(formulario.telefono)) {
      setError("❌ El teléfono debe tener el formato 3xx xxx xx xx y 10 dígitos.");
      return;
    }

    // Validación de cédula (debe ser numérica y tener máximo 12 dígitos)
    const regexCedula = /^\d{1,12}$/;
    if (!regexCedula.test(formulario.cedula)) {
      setError("❌ La cédula debe ser numérica y tener hasta 12 dígitos.");
      return;
    }

    // Registro de usuario en Supabase
    const { data, error: errorAuth } = await supabase.auth.signUp({
      email: formulario.correo,
      password: formulario.password,
    });

    if (errorAuth) {
      setError(errorAuth.message);
      return;
    }

    const uid = data.user.id;

    // Concatenamos el nombre y apellido antes de subirlo
    const nombreCompleto = `${formulario.nombre} ${formulario.apellido}`;

    // Inserción de usuario en la base de datos
    const { error: errorInsert } = await supabase.from("usuario").insert([
      {
        id: uid,
        nombre: nombreCompleto, // 🔹 Almacenamos nombre completo concatenado
        correo: formulario.correo,
        fecha_nacimiento: formulario.fechaNacimiento,
        telefono: formulario.telefono,
        cedula: formulario.cedula, // 🔹 Almacenamos cédula
        roll: "usuario",
      },
    ]);

    if (errorInsert) {
      setError("Usuario creado pero error en tabla usuario: " + errorInsert.message);
    } else {
      setSuccessMessage('✔️ Te has registrado correctamente. Por favor, revisa tu correo para confirmar la cuenta.');
      setTimeout(() => {
        navigate("/login"); // Redirige al login después de mostrar el mensaje
      }, 3000); // Espera 3 segundos antes de redirigir
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
          type="text"
          name="apellido"  // 🔹 Nuevo campo de apellido
          placeholder="Apellido"
          value={formulario.apellido}
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
          placeholder="Teléfono (3xx xxx xx xx)"
          value={formulario.telefono}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cedula"  // 🔹 Campo de cédula
          placeholder="Cédula (Solo números, máximo 12 dígitos)"
          value={formulario.cedula}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrarse</button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>} {/* Alarma de éxito */}

      <h4>Ya tengo cuenta y quiero Iniciar sesión</h4>
      <button onClick={() => navigate(`/login`)}>Iniciar sesión</button>
    </section>
  );
}

export default Registro;
