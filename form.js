document.addEventListener("DOMContentLoaded", function () {
    // Verificar si el usuario está autenticado
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
        window.location.href = "index.html"; // Redirigir si no está autenticado
        return;
    }


    function salir () {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "index.html";
        return;
    }

    document.querySelector("#salir").addEventListener("click", salir)

    const form = document.getElementById("form");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let isValid = true;
        const servicio = document.getElementById("servicio");
        const taller = document.getElementById("taller");
        const componente = document.getElementById("componente");
        const subComponente = document.getElementById("subComponente");
        const ot = document.getElementById("ot");
        const fecha = document.getElementById("fecha");
        const comentario = document.getElementById("comentario");

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

        if (subComponente.value.trim() === "") {
            mostrarError(subComponente, "El campo Sub-Componente es obligatorio.");
            isValid = false;
        } else {
            limpiarError(subComponente);
        }

        if (ot.value.trim() === "") {
            mostrarError(ot, "El OT es obligatorio.");
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

        if (comentario.value.trim().length < 7) {
            mostrarError(comentario, "El comentario debe tener al menos 7 caracteres.");
            isValid = false;
        } else {
            limpiarError(comentario);
        }

        if (isValid) {
            const modalElement = document.getElementById("modalConfirmacion");
            

            const json = {
                servicio: servicio.value,
                taller: taller.value,
                componente: componente.value,
                subcomponente: subComponente.value,
                ot: ot.value,
                fecha: fecha.value,
                comentario: comentario.value,
                accessToken
            };

            try {
                const response = await fetch(
                    "https://prod-218.westeurope.logic.azure.com:443/workflows/27c42dececd441429944ef882dc5d628/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zmHAVvXajH2oAL66V3RhCaTW_Wpyp_6U6tT1INbIVf4",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(json)
                    }
                );

                if (response.status === 403) {
                    salir();
                }

                if (!response.ok) {
                    throw new Error("Error en la solicitud. Verifique los datos e intente nuevamente.");
                }
                else {
                    if (modalElement) {
                        const modalConfirmacion = new bootstrap.Modal(modalElement);
                        modalConfirmacion.show();
        
                        document.getElementById("btnAceptar").addEventListener("click", function () {
                            window.location.reload();
                        });
                    }
                }

                

            } catch (error) {
                console.error(error.message);
            }
        }
    });

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
