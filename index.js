document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const btnLogin = document.getElementById("btnLogin");
    const spinner = document.getElementById("spinner");
    const alertaError = document.getElementById("alertaError");
    
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        alertaError.classList.add("d-none"); // Ocultar alerta si estaba visible
        btnLogin.disabled = true;
        spinner.style.display = "inline-block"; // Mostrar spinner
        
        const username = document.getElementById("cedula").value.trim();
        const requestData = { username, action: "login" };
        
        try {
            const response = await fetch("https://prod-90.westeurope.logic.azure.com:443/workflows/9bd6afe1c8a6458fb8951535152cc54a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vd38NtPGMx79EcTwaRouLrCK7WbBnbjxDvOHS2F8Hpc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error("Credenciales incorrectas.");
            }
            
            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
                sessionStorage.setItem("accessToken", data.accessToken);
                window.location.href = "main.html";
            } else {
                throw new Error("No se recibieron los tokens esperados.");
            }
        } catch (error) {
            alertaError.classList.remove("d-none");
        } finally {
            btnLogin.disabled = false;
            spinner.style.display = "none"; // Ocultar spinner
        }
    });
});
