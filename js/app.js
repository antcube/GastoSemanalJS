// Variables y Selectores
const modal = document.querySelector('#exampleModal');
const formModal = document.querySelector('#formulario');
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');
let myModal;

// Event Listeners
eventListeners();

function eventListeners() {
    document.addEventListener('DOMContentLoaded', mostrarModal);

    formModal.addEventListener('submit', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

// Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    // Agrega un nuevo gasto al presupuesto
    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    // Calcula el presupuesto restante después de un gasto
    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }
    
    // Elimina un gasto del presupuesto
    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI {
    // Inserta el presupuesto y el restante en la interfaz de usuario
    insertarPresupuesto(cantidad) {
        // Extrayendo los valores
        const {presupuesto, restante} = cantidad;

        // Agregar al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    // Imprime una alerta en la interfaz de usuario
    imprimirAlerta(mensaje, tipo) {
        // Crear el div
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }
        
        // Mensaje de error o éxito
        divMensaje.textContent = mensaje;

        // Insertar en el HTML
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // Quitar del HTML creado
        setTimeout(() => {
            divMensaje.remove();
        }, 2000);
    }

    // Muestra los gastos en la interfaz de usuario
    mostrarGastos(gastos) {
        // Elimina el HTML previo
        this.limpiarHTML();

        // Iterar sobre los gastos
        gastos.forEach((gasto) => {
            const {nombre, cantidad, id} = gasto;

            // Crear un li
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')
            nuevoGasto.dataset.id = id; //nuevoGasto.setAttribute('data-id', id);
            nuevoGasto.innerHTML = `
                ${nombre} <span class="badge badge-primary badge-pill px-3">$ ${cantidad}</span>
            `;

            // Botón para borrar el gasto
            const btnBorrar = document.createElement('BUTTON');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.addEventListener('click', () => {
                eliminarGasto(id);
            });

            // Agregar al HTML
            nuevoGasto.appendChild(btnBorrar);
            gastoListado.appendChild(nuevoGasto);
        });
    }

    // Limpia el HTML de los gastos mostrados
    limpiarHTML() {
        while(gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    // Actualiza el restante en la interfaz de usuario
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    // Comprueba el estado del presupuesto y actualiza la interfaz de usuario en consecuencia
    comprobarPresupuesto(prespuestoObj) {
        const {presupuesto, restante} = prespuestoObj;

        const restanteDiv = document.querySelector('.restante');

        if((presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if((presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-success');
        }

        if(restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type = "submit"]').disabled = true;
        } else {
            formulario.querySelector('button[type = "submit"]').disabled = false;
        }
    }
}

// Instanciar
const ui = new UI();
let presupuesto;

// Funciones
// Muestra el modal para ingresar el presupuesto
function mostrarModal() {
    myModal = new bootstrap.Modal(modal, {
        backdrop: 'static',
        keyboard: false
    });
    myModal.show();
}

// Pregunta al usuario su presupuesto y lo establece
function preguntarPresupuesto(e) {
    e.preventDefault();

    const propuestoUsuario = document.querySelector('#inicio').value;   

    if(propuestoUsuario === '' || propuestoUsuario === null || isNaN(propuestoUsuario) || propuestoUsuario <= 0) {
        window.location.reload();
    }
    
    myModal.hide();

    presupuesto = new Presupuesto(propuestoUsuario);
    
    ui.insertarPresupuesto(presupuesto);
}

// Agrega un gasto al presupuesto
function agregarGasto(e) {
    e.preventDefault();

    const nombre = document.querySelector('#gasto').value.trim();
    const cantidad = Number(document.querySelector('#cantidad').value.trim());

    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if(cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    // Generar objeto para gusto
    const gasto = {nombre, cantidad, id: Date.now()};

    // Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    ui.imprimirAlerta('Gasto agreado correctamente');

    // Imprimir los gastos
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);

    // Reinicia el formulario
    formulario.reset();
}

// Elimina un gasto del presupuesto
function eliminarGasto(id) {
    // Elimina los gastos del objeto
    presupuesto.eliminarGasto(id)

    // Eliminar los gastos del HTML
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);     
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}