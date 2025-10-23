import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import "../../App.css";

export default function CrudEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [nuevo, setNuevo] = useState({
    id: null,
    titulo: "",
    categoria: "",
    nivel: "Principiante",
    duracion_estimada: "",
    pasos: [""],
  });

  const niveles = ["Principiante", "Intermedio", "Avanzado"];

  useEffect(() => {
    obtenerEjercicios();
    obtenerCategorias();
  }, []);

  async function obtenerEjercicios() {
    const { data, error } = await supabase.from("ejercicios").select("*").order("id");
    if (!error) setEjercicios(data);
  }

  async function obtenerCategorias() {
    const { data, error } = await supabase.from("ejercicios").select("categoria");
    if (!error) {
      const unicas = Array.from(new Set(data.map((e) => e.categoria).filter(Boolean)));
      setCategorias(unicas);
    }
  }

  function manejarCambioPaso(index, valor) {
    const nuevosPasos = [...nuevo.pasos];
    nuevosPasos[index] = valor;
    setNuevo({ ...nuevo, pasos: nuevosPasos });
  }

  function agregarPaso() {
    setNuevo({ ...nuevo, pasos: [...nuevo.pasos, ""] });
  }

  function eliminarPaso(index) {
    const nuevos = nuevo.pasos.filter((_, i) => i !== index);
    setNuevo({ ...nuevo, pasos: nuevos });
  }

  function limpiarFormulario() {
    setNuevo({
      id: null,
      titulo: "",
      categoria: "",
      nivel: "Principiante",
      duracion_estimada: "",
      pasos: [""],
    });
    setModoEdicion(false);
  }

  async function guardarEjercicio() {
    if (!nuevo.titulo.trim()) return alert("El título es obligatorio.");
    if (!nuevo.duracion_estimada || isNaN(nuevo.duracion_estimada))
      return alert("La duración debe ser un número (segundos).");

    const pasosVacios = nuevo.pasos.some((p) => !p.trim());
    if (pasosVacios) return alert("Completa todos los pasos antes de guardar.");

    const descripcion = nuevo.pasos.map((p, i) => `Paso ${i + 1}: ${p.trim()}`).join("|");

    const datos = {
      titulo: nuevo.titulo.trim(),
      descripcion,
      categoria: nuevo.categoria.trim(),
      nivel: nuevo.nivel.trim(),
      duracion_estimada: Number(nuevo.duracion_estimada),
    };

    if (modoEdicion && nuevo.id) {
      const { error } = await supabase.from("ejercicios").update(datos).eq("id", nuevo.id);
      if (error) alert("❌ Error al actualizar el ejercicio");
      else alert("✅ Ejercicio actualizado correctamente");
    } else {
      const { error } = await supabase.from("ejercicios").insert([datos]);
      if (error) alert("❌ Error al crear el ejercicio");
      else alert("✅ Ejercicio creado correctamente");
    }

    limpiarFormulario();
    obtenerEjercicios();
    obtenerCategorias();
  }

  async function eliminarEjercicio(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
    await supabase.from("ejercicios").delete().eq("id", id);
    obtenerEjercicios();
  }

  function editarEjercicio(e) {
    const pasosSeparados = e.descripcion
      ? e.descripcion.split("|").map((p) => p.replace(/Paso \d+:\s*/, "").trim())
      : [""];
    setNuevo({
      id: e.id,
      titulo: e.titulo,
      categoria: e.categoria,
      nivel: e.nivel,
      duracion_estimada: e.duracion_estimada,
      pasos: pasosSeparados,
    });
    setModoEdicion(true);
  }

  return (
    <div className="crud-ejercicios-container">
      <h2>💪 CRUD - Ejercicios físicos</h2>

      <div className="crud-form">
        <h3>{modoEdicion ? "✏️ Editar ejercicio" : "➕ Nuevo ejercicio"}</h3>

        <input
          type="text"
          placeholder="Título del ejercicio"
          value={nuevo.titulo}
          onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
        />

        <label>Categoría:</label>
        <select
          value={nuevo.categoria}
          onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
        >
          <option value="">-- Selecciona o escribe nueva --</option>
          {categorias.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="O escribe una nueva categoría"
          value={categorias.includes(nuevo.categoria) ? "" : nuevo.categoria}
          onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
        />

        <label>Nivel:</label>
        <select
          value={nuevo.nivel}
          onChange={(e) => setNuevo({ ...nuevo, nivel: e.target.value })}
        >
          {niveles.map((n, i) => (
            <option key={i} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label>Duración estimada (segundos):</label>
        <input
          type="number"
          min="10"
          placeholder="Ej: 60"
          value={nuevo.duracion_estimada}
          onChange={(e) => setNuevo({ ...nuevo, duracion_estimada: e.target.value })}
        />

        <h4>🦶 Pasos del ejercicio:</h4>
        {nuevo.pasos.map((paso, index) => (
          <div className="crud-step" key={index}>
            <span>Paso {index + 1}:</span>
            <input
              type="text"
              value={paso}
              placeholder="Escribe el paso..."
              onChange={(e) => manejarCambioPaso(index, e.target.value)}
            />
            {nuevo.pasos.length > 1 && (
              <button className="delete-step-btn" onClick={() => eliminarPaso(index)}>
                ✖
              </button>
            )}
          </div>
        ))}

        <button className="add-step-btn" onClick={agregarPaso}>
          ➕ Agregar paso
        </button>

        <div className="crud-actions">
          <button className="primary-btn" onClick={guardarEjercicio}>
            {modoEdicion ? "💾 Guardar cambios" : "✅ Crear ejercicio"}
          </button>
          {modoEdicion && (
            <button className="cancel-btn" onClick={limpiarFormulario}>
              ↩️ Cancelar
            </button>
          )}
        </div>
      </div>

      <h3>📋 Lista de ejercicios</h3>
      <ul className="crud-lista">
        {ejercicios.map((e) => (
          <li key={e.id} className="crud-item">
            <div>
              <strong>{e.titulo}</strong> <br />
              <small>
                {e.categoria} - {e.nivel} ({e.duracion_estimada}s)
              </small>
            </div>
            <div className="crud-item-buttons">
              <button className="edit-btn" onClick={() => editarEjercicio(e)}>
                ✏️
              </button>
              <button className="delete-btn" onClick={() => eliminarEjercicio(e.id)}>
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
