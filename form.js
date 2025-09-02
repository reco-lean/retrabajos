document.addEventListener("DOMContentLoaded", function () {
    // Verificar si el usuario está autenticado
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        window.location.href = "index.html"; // Redirigir si no está autenticado
        return;
    }

    function salir () {
        sessionStorage.removeItem("accessToken");
        window.location.href = "index.html";
        return;
    }

    document.querySelector("#salir").addEventListener("click", salir);

    const servicio = document.getElementById("servicio");
    const taller = document.getElementById("taller");
    const componente = document.getElementById("componente");
    const subComponente = document.getElementById("subComponente");
    const ot = document.getElementById("ot");
    const fecha = document.getElementById("fecha");
    const comentario = document.getElementById("comentario");
    const tipo_desperdicio = document.getElementById("tipo_desperdicio");
    const tiempo = document.getElementById("tiempo");
    const divEquipo = document.getElementById("campoEquipo")
    const inputEquipo = document.getElementById("equipo");
    const btnEnviar = document.getElementById("btnEnviar");
    const spinner = document.getElementById("spinner");


    servicio.addEventListener("change", (e) => {
      if(e.target.value === "Mantenimiento") {
          divEquipo.classList.remove("d-none");
      }
      else {
          divEquipo.classList.add("d-none");
      }
    });


    const form = document.getElementById("form");
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      let isValid = true; 
        
      if (servicio.value === "") {
        mostrarError(servicio, "Debes seleccionar un servicio.");
        isValid = false;
      } else {
        limpiarError(servicio);
      }

      if (taller.value === "") {
        mostrarError(taller, "Debes seleccionar un taller.");
        isValid = false;
      } else {
        limpiarError(taller);
      }

      if (componente.value.trim() === "") {
        mostrarError(componente, "El campo Componente es obligatorio.");
        isValid = false;
      } else {
        limpiarError(componente);
      }

      if (tipo_desperdicio.value.trim() === "") {
        mostrarError(tipo_desperdicio, "El campo Tipo de desperdicio es obligatorio.");
        isValid = false;
      } else {
        limpiarError(tipo_desperdicio);
      }

    	if (subComponente.value.trim() === "") {
        mostrarError(subComponente, "El campo Parte/Subcomponente es obligatorio.");
        isValid = false;
      } else {
        limpiarError(subComponente);
      }

      if (ot.value.trim() === "") {
        mostrarError(ot, "La OT es obligatoria.");
        isValid = false;
      } else {
        limpiarError(ot);
      }

      if (fecha.value === "") {
        mostrarError(fecha, "Debes seleccionar una fecha.");
        isValid = false;
      } else {
        limpiarError(fecha);
      }

      if (isValid) {
      	const json = {
          servicio: servicio.value,
          taller: taller.value,
          componente: componente.value,
          subcomponente: subComponente.value,
          ot: ot.value,
          fecha: fecha.value,
          comentario: comentario.value,
          tipo_desperdicio: tipo_desperdicio.value,
          accessToken,
          tiempo: tiempo.value,
          equipo: inputEquipo.value
        }
        btnEnviar.disabled = true;
        spinner.style.display = "inline-block";
        const response = await fetch( "https://defaultc9a8e948bf0d4f8d9e9d551ac1b45a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/27c42dececd441429944ef882dc5d628/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ckXIqwdMVb_Vgl2h-ufh1NHdeH6_WGrA_KdUZUIPEKA",   
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
          }
        );
        if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Algo salio mal!"
          }).then(() => {
            if (response.status === 403) salir();
            else window.location.reload();
          });
        } else {
          Swal.fire({
            title: "Muda registrada!",
            icon: "success",
          }).then(() => window.location.reload())
        }
      }
            
    }
);

    function mostrarError(input, mensaje) {
        limpiarError(input);
        const error = document.createElement("div");
        error.className = "text-danger mt-1";
        error.innerText = mensaje;
        input.classList.add("is-invalid");
        input.parentElement.appendChild(error);
    }

    function limpiarError(input) {
        input.classList.remove("is-invalid");
        const errorMensaje = input.parentElement.querySelector(".text-danger");
        if (errorMensaje) {
            errorMensaje.remove();
        }
    }
});

