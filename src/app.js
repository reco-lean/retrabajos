import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { catalogComponents, componentesConFormato } from './config/catalogos.js';
import { compressAndEncodeImage } from './utils/helpers.js';

// Importamos los subcomponentes para que se registren en el DOM
import './components/FormEspecifico.js';
import './components/FormGenerico.js';

class RegistroOtApp extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    _tallerSeleccionado: { state: true },
    _componentesDisponibles: { state: true },
    _componenteSeleccionado: { state: true },
    _modoActual: { state: true },
    _cuestionarioJSON: { state: true }
  };

  constructor() {
    super();
    this._tallerSeleccionado = '';
    this._componentesDisponibles = [];
    this._componenteSeleccionado = '';
    this._modoActual = 'none';
    this._cuestionarioJSON = [];
  }

  _handleTallerChange(e) {
    this._tallerSeleccionado = e.target.value;
    this._componenteSeleccionado = '';
    this._modoActual = 'none';
    this._componentesDisponibles = catalogComponents[this._tallerSeleccionado] || [];
  }

  async _handleComponenteChange(e) {
    this._componenteSeleccionado = e.target.value;
    if (!this._componenteSeleccionado) {
      this._modoActual = 'none';
      return;
    }

    const archivoJsonAsignado = componentesConFormato[this._componenteSeleccionado];
    if (archivoJsonAsignado) {
      this._modoActual = 'specific';
      this._cuestionarioJSON = null; // Muestra "Cargando..."
      try {
        const res = await fetch(`src/forms/${archivoJsonAsignado.toLowerCase()}.json`);
        this._cuestionarioJSON = await res.json();
      } catch (err) {
        Swal.fire('Error', 'No se pudo cargar el archivo de configuración', 'error');
      }
    } else {
      this._modoActual = 'generic';
    }
  }

  async _onSubmit(e) {
    e.preventDefault();
    Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const payload = {
      tecnico: this.querySelector('#nombreTecnico').value,
      ot: this.querySelector('#ot').value,
      numeroComponente: this.querySelector('#numeroComponente').value,
      taller: this._tallerSeleccionado,
      componente: this._componenteSeleccionado,
      tipoFormulario: this._modoActual,
      fecha: new Date().toISOString()
    };

    try {
      if (this._modoActual === 'specific') {
        const preguntasData = [];
        const blocks = this.querySelectorAll('.specific-question');
        
        for (let block of blocks) {
          const fileInput = block.querySelector('.q-evidence');
          const commentInput = block.querySelector('.q-comment');
        
          const file = fileInput && fileInput.files ? fileInput.files[0] : null;

          preguntasData.push({
            idPregunta: block.dataset.id,
            codigoDAF: block.dataset.coddaf,
            tieneEvidencia: block.dataset.evidencia,
            respuesta: block.querySelector('.q-answer').value,
            comentario: commentInput ? commentInput.value : "", // Lo enviamos al payload
            evidenciaBase64: file ? await compressAndEncodeImage(file) : "",
            nombreArchivo: file ? file.name.replace(/\.[^/.]+$/, "") + ".jpg" : ""
          });
        }
        payload.respuestasEspecificas = preguntasData;

      } else if (this._modoActual === 'generic') {
        payload.comentarioGeneral = this.querySelector('#genComment').value;
        const subComponenteGenerico = this.querySelector('form-generico');
        const archivos = subComponenteGenerico.archivosCargados;
        
        if (archivos.length === 0) throw new Error("Debe subir al menos una foto.");

        const commentInputs = this.querySelectorAll('.photo-comment');
        payload.evidenciasGenericas = await Promise.all(archivos.map(async (file, idx) => ({
          nombreArchivo: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
          comentario: commentInputs[idx].value,
          base64: await compressAndEncodeImage(file)
        })));
      }

      // Envío HTTP a Power Automate
      const res = await fetch("https://defaultc9a8e948bf0d4f8d9e9d551ac1b45a.48.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/403406fe6985492ca0ff581ed00693f1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zTK-OlTY3MhKhpJyORGaODDcSJ-ctfbTFFWEUxknq9A", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error al transmitir los datos al servidor.");

      Swal.fire('Éxito', 'Información procesada y enviada', 'success');
      e.target.reset();
      this._tallerSeleccionado = '';
      this._componenteSeleccionado = '';
      this._modoActual = 'none';

    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  render() {
    return html`
      <div class="bg-white p-8 border border-gray-200 shadow-sm rounded">
        <h2 class="text-xl font-bold mb-6 text-center border-b-4 border-[#FFC528] pb-2">REGISTRO DE EVIDENCIAS DEL DESARME</h2>
        
        <form @submit="${this._onSubmit}" class="flex flex-col gap-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <input id="nombreTecnico" type="text" placeholder="NOMBRE DEL TÉCNICO" required class="sm:col-span-2 p-3 border rounded uppercase focus:ring-2 focus:ring-[#FFC528] outline-none">
            
            <input id="ot" type="text" placeholder="ORDEN DE TRABAJO" required class="p-3 border rounded uppercase focus:ring-2 focus:ring-[#FFC528] outline-none">
            <input id="numeroComponente" type="text" placeholder="NÚMERO DE COMPONENTE" required class="p-3 border rounded uppercase focus:ring-2 focus:ring-[#FFC528] outline-none">
            
            <select id="workshop" required class="p-3 border rounded uppercase focus:ring-2 focus:ring-[#FFC528] outline-none" @change="${this._handleTallerChange}">
              <option value="">SELECCIONE TALLER...</option>
              ${Object.keys(catalogComponents).map(taller => html`<option value="${taller}">${taller}</option>`)}
            </select>
            
            <select id="component" required class="p-3 border rounded uppercase focus:ring-2 focus:ring-[#FFC528] outline-none" @change="${this._handleComponenteChange}">
              <option value="">SELECCIONE COMPONENTE...</option>
              ${this._componentesDisponibles.map(comp => html`<option value="${comp}">${comp}</option>`)}
            </select>
          </div>

          ${this._modoActual === 'specific' ? html`<form-especifico .cuestionario="${this._cuestionarioJSON}"></form-especifico>` : ''}
          ${this._modoActual === 'generic' ? html`<form-generico></form-generico>` : ''}

          <button type="submit" class="mt-6 p-3 bg-[#FFC528] hover:bg-[#EDAF18] font-bold rounded transition-colors">ENVIAR</button>
        </form>
      </div>
    `;
  }
}
customElements.define('registro-ot-app', RegistroOtApp);