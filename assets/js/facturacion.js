document.addEventListener("DOMContentLoaded", function () {
    const facturaForm = document.getElementById("facturaForm");
    const facturasTableBody = document.getElementById("facturasTableBody");
    const facturaModal = new bootstrap.Modal(document.getElementById("facturaModal"));
    const pedidoSelect = document.getElementById("pedido");
    const clienteField = document.getElementById("cliente");
    const totalField = document.getElementById("totalFactura");

    let facturas = JSON.parse(localStorage.getItem("facturas")) || [];
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    // Función para renderizar la tabla de facturas
    function renderFacturas() {
        facturasTableBody.innerHTML = "";

        facturas.forEach((factura, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${factura.pedido}</td>
                <td>${factura.cliente}</td>
                <td>$${factura.total}</td>
                <td>${factura.fecha}</td>
                <td>${factura.estado}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editFactura(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteFactura(${index})">Eliminar</button>
                </td>
            `;
            facturasTableBody.appendChild(row);
        });
    }

    // Cargar pedidos al <select> en el formulario
    function loadPedidos() {
        pedidoSelect.innerHTML = '<option value="">Seleccione un pedido...</option>';

        pedidos.forEach((pedido) => {
            pedidoSelect.innerHTML += `
                <option value="${pedido.id}" data-cliente="${pedido.cliente}" data-total="${pedido.total}">
                    Pedido #${pedido.id} - ${pedido.cliente}
                </option>
            `;
        });
    }

    // Evento al cambiar el pedido seleccionado
    pedidoSelect.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        const cliente = selectedOption.getAttribute("data-cliente") || "";
        const total = selectedOption.getAttribute("data-total") || "";

        clienteField.value = cliente;
        totalField.value = total ? `$${total}` : "";
    });

    // Añadir o actualizar factura
    facturaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const pedido = pedidoSelect.value;
        const cliente = clienteField.value.trim();
        const total = totalField.value.trim();
        const estado = document.getElementById("estado").value;
        const fecha = new Date().toLocaleDateString();

        if (!pedido || !cliente || !total || !estado) {
            Swal.fire({
                icon: "warning",
                title: "Datos incompletos",
                text: "Por favor, complete todos los campos.",
            });
            return;
        }

        const nuevaFactura = {
            pedido,
            cliente,
            total: parseFloat(total.replace("$", "")),
            fecha,
            estado,
        };

        // Verificar si estamos en modo edición
        const facturaId = facturaForm.getAttribute("data-edit-id");
        if (facturaId) {
            facturas[parseInt(facturaId)] = nuevaFactura;
            Swal.fire("Actualizado", "Factura actualizada correctamente", "success");
            facturaForm.removeAttribute("data-edit-id");
        } else {
            facturas.push(nuevaFactura);
            Swal.fire("Guardado", "Factura guardada correctamente", "success");
        }

        localStorage.setItem("facturas", JSON.stringify(facturas));
        facturaForm.reset();
        facturaModal.hide();
        renderFacturas();
    });

    // Función para editar una factura
    window.editFactura = function (index) {
        const factura = facturas[index];
        pedidoSelect.value = factura.pedido;
        clienteField.value = factura.cliente;
        totalField.value = `$${factura.total}`;
        document.getElementById("estado").value = factura.estado;
        facturaForm.setAttribute("data-edit-id", index);
        facturaModal.show();
    };

    // Función para eliminar una factura
    window.deleteFactura = function (index) {
        Swal.fire({
            title: "¿Está seguro?",
            text: "No podrás revertir esta acción",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                facturas.splice(index, 1);
                localStorage.setItem("facturas", JSON.stringify(facturas));
                Swal.fire("Eliminado", "Factura eliminada correctamente", "success");
                renderFacturas();
            }
        });
    };

    // Buscar facturas
    document.getElementById("searchFactura").addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        const rows = facturasTableBody.querySelectorAll("tr");

        rows.forEach((row) => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? "" : "none";
        });
    });

    // Inicializar datos y eventos
    loadPedidos(); // Cargar los pedidos en el <select>
    renderFacturas(); // Renderizar las facturas existentes
});
