import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "../../App.css";

export default function Usuario() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    fecha_nacimiento: "",
    telefono: "",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // estados para modales
  const [modalEditar, setModalEditar] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modalOTP, setModalOTP] = useState(false);

  // flujo cambio contraseña
  const [otp, setOtp] = useState("");
  const [otpVerificada, setOtpVerificada] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // cargar usuario
  useEffect(() => {
    async function fetchUsuario() {
      setCargando(true);
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
        if (error || !data) setError("Error al cargar los datos.");
        else {
          setUsuario(data);
          setForm({
            nombre: data.nombre,
            fecha_nacimiento: data.fecha_nacimiento,
            telefono: data.telefono,
          });
        }
      } catch (err) {
        setError("Error al obtener los datos.");
      } finally {
        setCargando(false);
      }
    }
    fetchUsuario();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    setCargando(true);
    try {
      const { error } = await supabase
        .from("usuario")
        .update(form)
        .eq("id", usuario.id);
      if (error) setError("Error al actualizar: " + error.message);
      else {
        alert("Datos actualizados correctamente ✅");
        setUsuario({ ...usuario, ...form });
        setModalEditar(false);
      }
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
        <h2>{usuario.nombre}</h2>
        <p><strong>Correo:</strong> {usuario.correo}</p>
        <p><strong>Fecha de nacimiento:</strong> {usuario.fecha_nacimiento}</p>
        <p><strong>Teléfono:</strong> {usuario.telefono}</p>

        <button className="btn-editar" onClick={() => setModalEditar(true)}>
          ✏️ Editar datos
        </button>
        <button className="btn-password" onClick={() => setModalPassword(true)}>
          🔑 Cambiar contraseña
        </button>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>

      {/* ===== MODAL EDITAR DATOS ===== */}
      {modalEditar && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar datos</h2>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
            />
            <input
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              placeholder="Fecha de nacimiento"
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
            />
            <button className="btn-guardar" onClick={handleUpdate}>
              💾 Guardar cambios
            </button>
            <button onClick={() => setModalEditar(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ===== MODAL SOLICITAR OTP ===== */}
      {modalPassword && (
        <div className="modal">
          <div className="modal-content">
            <h2>Verificación para cambiar contraseña</h2>
            <p>Se enviará un código a tu correo: <strong>{usuario.correo}</strong></p>
            <button
              className="btn-password"
              onClick={async () => {
                await supabase.auth.resetPasswordForEmail(usuario.correo); // 👈 sin redirectTo
                setModalPassword(false);
                setModalOTP(true);
              }}
            >
              Enviar código
            </button>
            <button onClick={() => setModalPassword(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ===== MODAL VERIFICAR OTP Y NUEVA CONTRASEÑA ===== */}
      {modalOTP && (
        <div className="modal">
          <div className="modal-content">
            <h2>{!otpVerificada ? "Confirme código OTP" : "Nueva contraseña"}</h2>

            {!otpVerificada ? (
              <>
                <input
                  type="text"
                  placeholder="Ingrese código OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  className="btn-guardar"
                  onClick={async () => {
                    if (otp.trim() === "") {
                      alert("Debe ingresar el código OTP.");
                      return;
                    }

                    const { error } = await supabase.auth.verifyOtp({
                      email: usuario.correo,
                      token: otp,
                      type: "recovery",
                    });

                    if (error) {
                      alert("OTP incorrecto ❌. Intenta de nuevo.");
                      return;
                    }

                    // ✅ OTP correcta
                    setOtpVerificada(true);
                    alert("✅ OTP verificada, ahora puedes ingresar tu nueva contraseña.");
                  }}
                >
                  Confirmar OTP
                </button>
                <button onClick={() => setModalOTP(false)}>Cancelar</button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="btn-guardar"
                  onClick={async () => {
                    if (newPassword.trim() === "") {
                      alert("La nueva contraseña no puede estar vacía.");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      alert("Las contraseñas no coinciden.");
                      return;
                    }
                    const { error } = await supabase.auth.updateUser({
                      password: newPassword,
                    });
                    if (error) {
                      alert("Error: " + error.message);
                      return;
                    }
                    alert("Contraseña cambiada con éxito ✅");
                    setModalOTP(false);
                    setOtp("");
                    setOtpVerificada(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Guardar nueva contraseña
                </button>
                <button onClick={() => setModalOTP(false)}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
