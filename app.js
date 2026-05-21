document.addEventListener("DOMContentLoaded", function () {
    const servicio = document.getElementById("servicio");
    const taller = document.getElementById("taller");
    const tipo_desperdicio = document.getElementById("tipo_desperdicio");
    const componente = document.getElementById("componente");
    const subComponente = document.getElementById("subComponente");
    const ot = document.getElementById("ot");
    const fecha = document.getElementById("fecha");
    const comentario = document.getElementById("comentario");
    const tiempo = document.getElementById("tiempo");
    const inputEquipo = document.getElementById("equipo");
    
    // Contenedores y Labels para lógica visual
    const campoSubComponente = document.getElementById("campoSubComponente");
    const campoEquipo = document.getElementById("campoEquipo");
    const campoTiempo = document.getElementById("campoTiempo");
    const labelClasificacion = document.getElementById("labelClasificacion");
    const labelComentario = document.getElementById("labelComentario");

    const btnEnviar = document.getElementById("btnEnviar");
    const form = document.getElementById("form");

    // Llenar fecha actual por defecto
    fecha.valueAsDate = new Date();

    // ==========================================
    // LÓGICA DE INTERFAZ DINÁMICA
    // ==========================================
    const opcionesEstandar = [
        "Defecto en material", "Sobreproceso", "Sobreproducción", 
        "Tiempos de Espera", "Exceso de Inventario", "Transporte innecesario"
    ];
    
    // Opciones técnicas separadas para QPSuite
    // Opciones técnicas separadas para QPSuite
    const opcionesQPSuite = [
        "Predecesora sin cierre en sistema", 
        "Orden de Trabajo no liberada en sistema", 
        "OT no suministrada físicamente por Programación", // NUEVA OPCIÓN
        "Falla de conectividad / Sistema no disponible",
        "Otra incidencia de software"
    ];

    servicio.addEventListener("change", (e) => {
        const val = e.target.value;
        
        // 1. Manejo del Equipo (Solo Mantenimiento)
        if (val === "Mantenimiento") {
            campoEquipo.classList.remove("d-none");
        } else {
            campoEquipo.classList.add("d-none");
            inputEquipo.value = "";
        }

        
        // 2. Manejo de Opciones, SubComponente y Tiempo
        tipo_desperdicio.innerHTML = '<option value="" disabled selected>Seleccione un parámetro</option>';

        if (val === "QPSuite") {
            // Modo QPSuite
            labelClasificacion.innerText = "Causa Raíz del Bloqueo:";
            campoSubComponente.classList.add("d-none");
            subComponente.value = "No Aplica";
            
            // Ocultar tiempo (No aplica para bloqueos administrativos)
            campoTiempo.classList.add("d-none");
            tiempo.value = "0";

            // Modificar instrucción del comentario para mayor rigor
            labelComentario.innerHTML = "Estado Real de la Operación <span class='text-accent'>(Obligatorio)</span>:";
            comentario.placeholder = "Indique explícitamente en qué tarea se generó la restricción del sistema y qué actividades se ha adelantado o adelantará físicamente en el taller.";
            
            opcionesQPSuite.forEach(opt => {
                tipo_desperdicio.innerHTML += `<option value="${opt}">${opt}</option>`;
            });
        } else {
            // Modo Operativo Normal
            labelClasificacion.innerText = "Categoría de la Desviación:";
            campoSubComponente.classList.remove("d-none");
            if(subComponente.value === "No Aplica") subComponente.value = ""; 
            
            // Mostrar tiempo
            campoTiempo.classList.remove("d-none");

            // Restaurar comentario
            labelComentario.innerText = "Detalle Técnico / Observaciones:";
            comentario.placeholder = "Describa el contexto operativo y el impacto de la desviación...";
            
            opcionesEstandar.forEach(opt => {
                tipo_desperdicio.innerHTML += `<option value="${opt}">${opt}</option>`;
            });
        }
    });

    // Lógica para autocompletar OT si no se la entregaron al técnico
    tipo_desperdicio.addEventListener("change", (e) => {
        if (e.target.value === "OT no suministrada físicamente por Programación") {
            ot.value = "PENDIENTE";
            ot.readOnly = true;
            ot.classList.add("text-danger"); // La pone en rojo visualmente
        } else {
            ot.value = "";
            ot.readOnly = false;
            ot.classList.remove("text-danger");
        }
    });

    // ==========================================
    // LÓGICA DE VALIDACIÓN Y ENVÍO
    // ==========================================
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        let isValid = true; 
        
        const validarCampo = (campo, mensaje) => {
            if(campo.parentElement.classList.contains("d-none")) {
                limpiarError(campo);
                return true;
            }
            if (campo.value.trim() === "") {
                mostrarError(campo, mensaje);
                return false;
            } else {
                limpiarError(campo);
                return true;
            }
        };

        if (!validarCampo(servicio, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(taller, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(tipo_desperdicio, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(componente, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(subComponente, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(ot, "Parámetro requerido.")) isValid = false;
        if (!validarCampo(fecha, "Parámetro requerido.")) isValid = false;
        
        // Validación extra: Si es QPSuite, el comentario no puede ir vacío
        if (servicio.value === "QPSuite" && comentario.value.trim() === "") {
            mostrarError(comentario, "Debe especificar el estado físico de la operación.");
            isValid = false;
        } else {
            limpiarError(comentario);
        }

        if (isValid) {
            const json = {
                servicio: servicio.value,
                taller: taller.value,
                componente: componente.value,
                subcomponente: subComponente.value,
                ot: ot.value.trim().toUpperCase(),
                fecha: fecha.value,
                comentario: comentario.value,
                tipo_desperdicio: tipo_desperdicio.value,
                tiempo: tiempo.value || "0",
                equipo: inputEquipo.value
            };
            
            btnEnviar.disabled = true;
            document.getElementById("spinner").style.display = "inline-block";
            
            try {
                const response = await fetch( "https://defaultc9a8e948bf0d4f8d9e9d551ac1b45a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/27c42dececd441429944ef882dc5d628/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ckXIqwdMVb_Vgl2h-ufh1NHdeH6_WGrA_KdUZUIPEKA",   
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(json)
                    }
                );
                
                if (!response.ok) throw new Error("Error en servidor");
                
                Swal.fire({
                    title: "Transacción Exitosa",
                    text: "La desviación ha sido documentada en el sistema.",
                    icon: "success",
                    confirmButtonColor: "#F57C00",
                    background: "#1E1E1E",
                    color: "#fff"
                }).then(() => window.location.reload());

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error de Conectividad",
                    text: "No se logró establecer conexión con el servidor. Reintente.",
                    confirmButtonColor: "#EF5350",
                    background: "#1E1E1E",
                    color: "#fff"
                });
                btnEnviar.disabled = false;
                document.getElementById("spinner").style.display = "none";
            }
        }
    });

    // ==========================================
    // FUNCIONES VISUALES DE ERROR
    // ==========================================
    function mostrarError(input, mensaje) {
        limpiarError(input);
        const error = document.createElement("div");
        error.className = "error-text";
        error.innerText = mensaje;
        input.classList.add("is-invalid");
        input.parentElement.appendChild(error);
    }

    function limpiarError(input) {
        input.classList.remove("is-invalid");
        const errorMensaje = input.parentElement.querySelector(".error-text");
        if (errorMensaje) errorMensaje.remove();
    }
});
