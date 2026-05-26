import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class FormEspecifico extends LitElement {
  createRenderRoot() { return this; } // Integración con Tailwind global

  static properties = {
    cuestionario: { type: Array },
    // Estado interno para rastrear qué selecciona el usuario en tiempo real
    _respuestas: { state: true } 
  };

  constructor() {
    super();
    this.cuestionario = [];
    this._respuestas = {};
  }

  // Método para actualizar el estado cada vez que cambia un input/select
  _handleAnswerChange(e, preguntaId) {
    this._respuestas = {
      ...this._respuestas,
      [preguntaId]: e.target.value
    };
  }

  render() {
    if (!this.cuestionario || this.cuestionario.length === 0) {
      return html`<p class="text-gray-500">Cargando formato específico...</p>`;
    }

    return html`
      <div class="mt-4 border-t-2 border-dashed border-gray-300 pt-4">
        ${this.cuestionario.map(sec => html`
          <div class="bg-gray-100 p-4 rounded mb-4">
            <h4 class="font-bold border-b border-gray-300 mb-3">${sec.seccion}</h4>
            
            ${sec.preguntas.map(preg => {
              // Evaluamos las condiciones lógicas para esta pregunta específica
              const respuestaActual = this._respuestas[preg.id] || '';
              const esNA = respuestaActual === 'N/A';
              
              // 1. Verificamos si el campo de comentario DEBE EXISTIR
              const permiteComentario = preg.requiereComentario === true 
                                        
              // 2. Verificamos si el comentario (en caso de existir) ES OBLIGATORIO
              const esComentarioRequerido = preg.comentarioObligatorio === true 

              return html`
                <div class="mb-4 specific-question" data-id="${preg.id}" data-coddaf="${preg.codDaf}" data-evidencia="${preg.requiereEvidencia}">
                  <label class="block text-sm font-bold mb-1"><span class="text-blue-600">${preg.id}</span> - ${preg.texto}</label>
                  
                  ${preg.tipo === 'select' 
                    ? html`
                        <select 
                          class="q-answer w-full p-2 border rounded" 
                          required
                          @change="${(e) => this._handleAnswerChange(e, preg.id)}"
                        >
                          <option value="">Seleccione...</option>
                          ${preg.opciones.map(opt => html`<option value="${opt}">${opt}</option>`)}
                        </select>
                      `
                    : html`
                        <input 
                          type="text" 
                          class="q-answer w-full p-2 border rounded uppercase" 
                          required
                          @input="${(e) => this._handleAnswerChange(e, preg.id)}"
                        >
                      `
                  }

                  ${!esNA ? html`
                    
                    ${permiteComentario 
                      ? html`
                          <textarea 
                            class="q-comment mt-2 w-full p-2 border rounded text-sm uppercase" 
                            rows="2"
                            placeholder="${esComentarioRequerido ? 'COMENTARIO (REQUERIDO)' : 'COMENTARIO (OPCIONAL)'}"
                            ?required="${esComentarioRequerido}"
                          ></textarea>
                        `
                      : ''
                    }

                    ${preg.requiereEvidencia === "Si" 
                      ? html`
                          <input 
                            type="file" 
                            accept=".jpg,.jpeg,.png" 
                            class="q-evidence mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            required
                          >
                        `
                      : ''
                    }

                  ` : ''} 
                </div>
              `;
            })}
          </div>
        `)}
      </div>
    `;
  }
}
customElements.define('form-especifico', FormEspecifico);