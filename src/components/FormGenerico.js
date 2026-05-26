import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class FormGenerico extends LitElement {
  createRenderRoot() { return this; }

  static properties = {
    archivosCargados: { type: Array }
  };

  constructor() {
    super();
    this.archivosCargados = [];
  }

  _handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 30) {
      Swal.fire('Error', 'Máximo 30 fotos permitidas', 'error');
      e.target.value = '';
      this.archivosCargados = [];
      return;
    }
    this.archivosCargados = files;
  }

  render() {
    return html`
      <div class="mt-4 border-t-2 border-dashed border-gray-300 pt-4">
        <textarea id="genComment" rows="3" class="w-full p-3 border rounded mb-4 uppercase" placeholder="COMENTARIO GENERAL DE LA OT"></textarea>
        <div class="border p-4 rounded bg-gray-50">
          <label class="block font-bold mb-2">SUBIR FOTOS (MÁX 30):</label>
          <input type="file" id="genPhotos" multiple accept=".jpg,.jpeg,.png" class="mb-4" @change="${this._handleFileChange}">
          
          <div id="genPhotosContainer" class="flex flex-col gap-4">
            ${this.archivosCargados.map(file => html`
              <div class="flex flex-col sm:flex-row gap-3 border p-2 rounded bg-white generic-photo-item">
                <p class="text-xs truncate w-32 font-bold">${file.name}</p>
                <input type="text" class="p-2 border rounded w-full text-sm uppercase photo-comment" placeholder="Comentario de esta foto..." required>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('form-generico', FormGenerico);