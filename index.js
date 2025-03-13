document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");
  
  loginForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Evita el envío tradicional del formulario
      
      // Capturar valores de los inputs
      const username = document.getElementById("cedula").value.trim();
      

      // JSON que se enviará a la API
      const requestData = { username, action: "login" };

      try {
          // Hacer la petición a la API
          const response = await fetch("https://prod-90.westeurope.logic.azure.com:443/workflows/9bd6afe1c8a6458fb8951535152cc54a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vd38NtPGMx79EcTwaRouLrCK7WbBnbjxDvOHS2F8Hpc", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(requestData)
          });

          if (!response.ok) {
              throw new Error("Credenciales incorrectas. Inténtelo de nuevo.");
          }

          const data = await response.json();

          // Suponiendo que la API devuelve { accessToken: "...", refreshToken: "..." }
          if (data.accessToken && data.refreshToken) {
              sessionStorage.setItem("accessToken", data.accessToken);
              sessionStorage.setItem("refreshToken", data.refreshToken);

              // Redirigir a la página deseada
              window.location.href = "main.html";
          } else {
              throw new Error("No se recibieron los tokens esperados.");
          }
      } catch (error) {
          console.error(error.message);
      }
  });
});
