let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

function estadoTexto(valor) {
  return valor == 1 ? "Crítico" : valor == 2 ? "Avanzado" : valor == 3 ? "Leve" : "Estable";
}

function estadoNumero(texto) {
  const t = texto?.toLowerCase();
  if (t.includes("crítico")) return 1;
  if (t.includes("avanzado")) return 2;
  if (t.includes("leve")) return 3;
  return 4;
}

function parseSintomasDesdeTexto(texto) {
  return texto.split("|").map(s => {
    const [nombre, prioridadTexto] = s.trim().split(":");
    const prioridad = prioridadTexto?.trim().toLowerCase();
    return {
      nombre: nombre?.trim() || "",
      prioridad: prioridad === "alta" ? 1 : prioridad === "media" ? 2 : 3
    };
  }).filter(s => s.nombre);
}

function agregarSintoma() {
  const container = document.getElementById("sintomasContainer");
  const div = document.createElement("div");
  div.className = "sintomaItem";
  div.innerHTML = `
    <input type="text" placeholder="Síntoma" class="sintomaNombre" />
    <select class="sintomaPrioridad">
      <option value="1">Alta</option>
      <option value="2">Media</option>
      <option value="3">Baja</option>
    </select>
  `;
  container.appendChild(div);
}

function renderTabla() {
  pacientes.sort((a, b) => a.prioridad - b.prioridad);
  const tbody = document.querySelector("#tablaPacientes tbody");
  tbody.innerHTML = "";
  pacientes.forEach((p, index) => {
    const fila = document.createElement("tr");
    fila.dataset.prioridad = parseInt(p.prioridad);

    const sintomasTexto = (p.sintomas || []).map(s => {
      const nivel = s.prioridad == 1 ? 'Alta' : s.prioridad == 2 ? 'Media' : 'Baja';
      return `${s.nombre}: ${nivel}`;
    }).join(" | ");

    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.edad}</td>
      <td>${p.habitacion}</td>
      <td>${p.localizacion}</td>
      <td>${p.fechaConsulta}</td>
      <td>${estadoTexto(p.estado)}</td>
      <td>${p.prioridad}</td>
      <td>${p.alergias}</td>
      <td>${p.vacunas}</td>
      <td>${sintomasTexto}</td>
      <td>
        <button onclick="borrar(${index})">Borrar</button>
        <button onclick="editar(${index})">Editar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });

  localStorage.setItem("pacientes", JSON.stringify(pacientes));
}

document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const sintomas = Array.from(document.querySelectorAll(".sintomaItem")).map(item => ({
    nombre: item.querySelector(".sintomaNombre").value.trim(),
    prioridad: item.querySelector(".sintomaPrioridad").value
  })).filter(s => s.nombre);

  const estado = parseInt(document.getElementById("estado").value);

  const paciente = {
    nombre: document.getElementById("nombre").value,
    edad: document.getElementById("edad").value,
    habitacion: document.getElementById("habitacion").value,
    localizacion: document.getElementById("localizacion").value,
    fechaConsulta: document.getElementById("fechaConsulta").value,
    cronicas: document.getElementById("cronicas").value,
    alergias: document.getElementById("alergias").value,
    vacunas: document.getElementById("vacunas").value,
    medicamentos: document.getElementById("medicamentos").value,
    visitas: document.getElementById("visitas").value,
    estado: estado,
    sintomas,
    prioridad: estado // ✅ Prioridad basada SOLO en estado
  };

  pacientes.push(paciente);
  renderTabla();
  this.reset();
  document.getElementById("sintomasContainer").innerHTML = `
    <div class="sintomaItem">
      <input type="text" placeholder="Síntoma" class="sintomaNombre"/>
      <select class="sintomaPrioridad">
        <option value="1">Alta</option>
        <option value="2">Media</option>
        <option value="3">Baja</option>
      </select>
    </div>
  `;
});

function borrar(index) {
  pacientes.splice(index, 1);
  renderTabla();
}

function editar(index) {
  const p = pacientes[index];
  document.getElementById("indiceEdicion").value = index;
  document.getElementById("editarNombre").value = p.nombre;
  document.getElementById("editarEdad").value = p.edad;
  document.getElementById("editarHabitacion").value = p.habitacion;
  document.getElementById("editarLocalizacion").value = p.localizacion;
  document.getElementById("editarFechaConsulta").value = p.fechaConsulta;
  document.getElementById("editarCronicas").value = p.cronicas;
  document.getElementById("editarAlergias").value = p.alergias;
  document.getElementById("editarVacunas").value = p.vacunas;
  document.getElementById("editarMedicamentos").value = p.medicamentos;
  document.getElementById("editarVisitas").value = p.visitas;
  document.getElementById("editarEstado").value = String(p.estado);

  const container = document.getElementById("editarSintomasContainer");
  container.innerHTML = "";
  (p.sintomas || []).forEach(s => {
    const div = document.createElement("div");
    div.className = "sintomaItem";
    div.innerHTML = `
      <input type="text" value="${s.nombre}" class="sintomaNombre">
      <select class="sintomaPrioridad">
        <option value="1" ${s.prioridad == 1 ? 'selected' : ''}>Alta</option>
        <option value="2" ${s.prioridad == 2 ? 'selected' : ''}>Media</option>
        <option value="3" ${s.prioridad == 3 ? 'selected' : ''}>Baja</option>
      </select>
    `;
    container.appendChild(div);
  });

  document.getElementById("modalEdicion").style.display = "block";
}

function agregarSintomaEdicion() {
  const container = document.getElementById("editarSintomasContainer");
  const div = document.createElement("div");
  div.className = "sintomaItem";
  div.innerHTML = `
    <input type="text" class="sintomaNombre" placeholder="Síntoma" />
    <select class="sintomaPrioridad">
      <option value="1">Alta</option>
      <option value="2">Media</option>
      <option value="3">Baja</option>
    </select>
  `;
  container.appendChild(div);
}

function cerrarModal() {
  document.getElementById("modalEdicion").style.display = "none";
}

document.getElementById("formularioEdicion").addEventListener("submit", function (e) {
  e.preventDefault();
  const index = parseInt(document.getElementById("indiceEdicion").value);
  const sintomas = Array.from(document.querySelectorAll("#editarSintomasContainer .sintomaItem")).map(item => ({
    nombre: item.querySelector(".sintomaNombre").value.trim(),
    prioridad: item.querySelector(".sintomaPrioridad").value
  })).filter(s => s.nombre);

  const estado = parseInt(document.getElementById("editarEstado").value);

  pacientes[index] = {
    nombre: document.getElementById("editarNombre").value,
    edad: document.getElementById("editarEdad").value,
    habitacion: document.getElementById("editarHabitacion").value,
    localizacion: document.getElementById("editarLocalizacion").value,
    fechaConsulta: document.getElementById("editarFechaConsulta").value,
    cronicas: document.getElementById("editarCronicas").value,
    alergias: document.getElementById("editarAlergias").value,
    vacunas: document.getElementById("editarVacunas").value,
    medicamentos: document.getElementById("editarMedicamentos").value,
    visitas: document.getElementById("editarVisitas").value,
    estado: estado,
    sintomas,
    prioridad: estado // ✅ Prioridad solo desde el estado
  };

  cerrarModal();
  renderTabla();
});

document.getElementById("archivoExcel").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      pacientes = json.map(p => ({
        nombre: p.Nombre,
        edad: p.Edad,
        habitacion: p.Habitación,
        localizacion: p.Localización,
        fechaConsulta: p["Fecha Consulta"],
        cronicas: p["Enfermedades Crónicas"],
        alergias: p.Alergias,
        vacunas: p.Vacunas,
        medicamentos: p.Medicamentos,
        visitas: p["Visitas Médicas"],
        estado: estadoNumero(p["Estado de Enfermedad"]),
        prioridad: estadoNumero(p["Estado de Enfermedad"]),
        sintomas: parseSintomasDesdeTexto(p.Síntomas || "")
      }));

      renderTabla();
    } catch (err) {
      alert("⚠️ Error al importar el archivo. Asegúrate de que sea un Excel válido exportado desde esta app.");
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(file);
});

function exportarExcel() {
  const datos = pacientes.map(p => ({
    Nombre: p.nombre,
    Edad: p.edad,
    Habitación: p.habitacion,
    Localización: p.localizacion,
    "Fecha Consulta": p.fechaConsulta,
    "Enfermedades Crónicas": p.cronicas,
    Alergias: p.alergias,
    Vacunas: p.vacunas,
    Medicamentos: p.medicamentos,
    "Visitas Médicas": p.visitas,
    "Estado de Enfermedad": estadoTexto(p.estado),
    Prioridad: p.prioridad,
    Síntomas: (p.sintomas || []).map(s => `${s.nombre}: ${s.prioridad == 1 ? "Alta" : s.prioridad == 2 ? "Media" : "Baja"}`).join(" | ")
  }));

  const hoja = XLSX.utils.json_to_sheet(datos);
  hoja["!cols"] = Array(Object.keys(datos[0]).length).fill({ wch: 20 });

  datos.forEach((p, i) => {
    const row = i + 2;
    const color = p.Prioridad == 1 ? "FFCCCC" : p.Prioridad == 2 ? "FFE0B3" : p.Prioridad == 3 ? "FFF6B3" : "FFFFFF";
    for (let c = 0; c < Object.keys(p).length; c++) {
      const cell = XLSX.utils.encode_cell({ r: row - 1, c });
      if (!hoja[cell]) continue;
      if (!hoja[cell].s) hoja[cell].s = {};
      hoja[cell].s.fill = { patternType: "solid", fgColor: { rgb: color } };
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, hoja, "Pacientes");
  XLSX.writeFile(wb, "pacientes.xlsx");
}

renderTabla();

