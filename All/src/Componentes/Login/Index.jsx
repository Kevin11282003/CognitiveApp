import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [mode, setMode] = useState("login"); // "login" | "forgot" | "otp" | "reset"
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🔹 NUEVO estado

  const navigate = useNavigate();

  // 🔹 Reiniciar visibilidad de contraseña al cambiar de modo
  useEffect(() => {
    setShowPassword(false);
  }, [mode]);

  // 🔹 Login normal
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("❌ Usuario o contraseña no válidos");
    } else {
      navigate("/");
    }
  };

  // 🔹 Enviar OTP al correo
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Por favor escribe tu correo");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      alert("❌ " + error.message);
    } else {
      alert("📧 Te enviamos un código a tu correo");
      setMode("otp");
    }
  };

  // 🔹 Verificar OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Introduce el código recibido");
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink",
    });

    if (error) {
      alert("❌ Código incorrecto");
    } else {
      alert("✅ Código verificado, ahora puedes cambiar tu contraseña");
      setOtpVerified(true);
      setMode("reset");
    }
  };

  // 🔹 Actualizar contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("❌ " + error.message);
    } else {
      alert("✅ Contraseña actualizada correctamente");
      setMode("login");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <center>
      <div id="divisaun">
        <h1>CognitiveApp</h1>

        {/* 🔹 LOGIN NORMAL */}
        {mode === "login" && (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                Mostrar contraseña
              </label>
              <button type="submit">Iniciar sesión</button>
            </form>
            <p>
              <button onClick={() => setMode("forgot")}>
                Olvidé mi contraseña
              </button>
            </p>
            <h4>¿No tiene cuenta?</h4>
            <button onClick={() => navigate(`/registro`)}>Regístrese</button>
          </>
        )}

        {/* 🔹 PEDIR CORREO */}
        {mode === "forgot" && (
          <>
            <h2>Recuperar contraseña</h2>
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Enviar código</button>
            </form>
            <p>
              <button onClick={() => setMode("login")}>Volver</button>
            </p>
          </>
        )}

        {/* 🔹 VERIFICAR OTP */}
        {mode === "otp" && (
          <>
            <h2>Verificar código</h2>
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                placeholder="Código recibido en el correo"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="submit">Verificar</button>
            </form>
            <p>
              <button onClick={() => setMode("forgot")}>Volver</button>
            </p>
          </>
        )}

        {/* 🔹 CAMBIAR CONTRASEÑA */}
        {mode === "reset" && otpVerified && (
          <>
            <h2>Nueva contraseña</h2>
            <form onSubmit={handleResetPassword}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                Mostrar contraseña
              </label>
              <button type="submit">Actualizar contraseña</button>
            </form>
          </>
        )}
      </div>
    </center>
  );
}

export default Login;
