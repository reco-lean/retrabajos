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


    servicio.addEventListener("change", (e) => {
        console.log(equipo)
        if(e.target.value === "Mantenimiento") {
            divEquipo.classList.remove("d-none");
        }
        else {
            divEquipo.classList.add("d-none");
        }
    })


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
                tipo_desperdicio: tipo_desperdicio.value,
                accessToken,
                tiempo: tiempo.value,
                equipo: inputEquipo.value
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
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Algo salio mal!"
                    });
                    throw new Error("Error en la solicitud. Verifique los datos e intente nuevamente.");
                    
                }
                else {
                    Swal.fire({
                        title: "Muda registrada!",
                        icon: "success",
                    }).then(() => window.location.reload())
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
