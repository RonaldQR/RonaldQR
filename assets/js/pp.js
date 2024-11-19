document.addEventListener("DOMContentLoaded", function () {
    const pedidoForm = document.getElementById("pedidoForm");
    const pedidosTableBody = document.getElementById("pedidosTableBody");
    const pedidoModal = new bootstrap.Modal(
      document.getElementById("pedidoModal")
    );
    const searchInput = document.getElementById("searchPedido");
  
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  
    // Renderizar la tabla de pedidos
    function renderPedidos() {
      pedidosTableBody.innerHTML = "";
      pedidos.forEach((pedido, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.productos}</td>
            <td>${pedido.fecha}</td>
            <td>${pedido.total}</td>
            <td>${pedido.estado}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editPedido(${index})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deletePedido(${index})">Eliminar</button>
            </td>
          `;
        pedidosTableBody.appendChild(row);
      });
    }
  
    // Añadir o actualizar pedido
    pedidoForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const cliente = pedidoForm.cliente.value.trim();
      const productos = pedidoForm.productos.value.trim();
      const metodoPago = pedidoForm.metodoPago.value;
      const fecha = new Date().toLocaleDateString();
  
      // Validar campos obligatorios
      if (!cliente || !productos || !metodoPago) {
        Swal.fire({
          icon: "warning",
          title: "Datos incompletos",
          text: "Por favor, complete todos los campos.",
        });
        return;
      }
  
      const total = calcularTotal(productos); // Calculamos un total ficticio
      const nuevoPedido = {
        cliente,
        productos,
        fecha,
        total,
        estado: "Pendiente",
      };
  
      // Modo edición
      const pedidoId = pedidoForm.getAttribute("data-edit-id");
      if (pedidoId) {
        pedidos[parseInt(pedidoId)] = nuevoPedido;
        Swal.fire("Actualizado", "Pedido actualizado correctamente", "success");
        pedidoForm.removeAttribute("data-edit-id");
      } else {
        pedidos.push(nuevoPedido);
        Swal.fire("Guardado", "Pedido guardado correctamente", "success");
      }
  
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
      pedidoForm.reset();
      pedidoModal.hide();
      renderPedidos();
    });
  
    // Función para editar pedido
    window.editPedido = function (index) {
      const pedido = pedidos[index];
      pedidoForm.cliente.value = pedido.cliente;
      pedidoForm.productos.value = pedido.productos;
      pedidoForm.metodoPago.value = pedido.metodoPago;
      pedidoForm.setAttribute("data-edit-id", index);
      pedidoModal.show();
    };
  
    // Función para eliminar pedido
    window.deletePedido = function (index) {
      Swal.fire({
        title: "¿Está seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          pedidos.splice(index, 1);
          localStorage.setItem("pedidos", JSON.stringify(pedidos));
          Swal.fire("Eliminado", "Pedido eliminado correctamente", "success");
          renderPedidos();
        }
      });
    };
  
    // Función para buscar pedidos
    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();
      const rows = pedidosTableBody.querySelectorAll("tr");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    });
  
    // Función para cargar clientes en el <select> del formulario de pedido
    function loadClientes() {
      const clienteSelect = document.getElementById("cliente");
      const clients = JSON.parse(localStorage.getItem("clients")) || [];
  
      // Limpiar las opciones anteriores
      clienteSelect.innerHTML =
        '<option value="">Seleccione un cliente...</option>';
  
      // Agregar las opciones de los clientes
      clients.forEach((client) => {
        clienteSelect.innerHTML += `<option value="${client.id}">${client.name} - ${client.type} (${client.id})</option>`;
      });
    }
  
    // Llamar a `loadClientes` cuando se abra el modal
    document
      .getElementById("pedidoModal")
      .addEventListener("show.bs.modal", loadClientes);
  
    renderPedidos(); // Inicializar tabla al cargar la página
  });
  
  function loadProductos() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const productoSelects = document.querySelectorAll(".producto-select");
  
    productoSelects.forEach((select) => {
      // Limpiar opciones existentes
      select.innerHTML = '<option value="">Seleccione un producto...</option>';
  
      // Añadir productos al select
      productos.forEach((producto) => {
        select.innerHTML += `<option value="${producto.id}" data-precio="${producto.price}">
            ${producto.name} - $${producto.price}
          </option>`;
      });
    });
  }
  
  // Llamar `loadProductos` al abrir el modal
  document.getElementById("pedidoModal").addEventListener("show.bs.modal", loadProductos);
  
  function updatePrecio(selectElement) {
    const precioField =
      selectElement.parentElement.querySelector(".precio-producto");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const precio = selectedOption.getAttribute("data-precio");
  
    precioField.value = precio || ""; // Asignar el precio o dejar vacío si no hay selección
  }
  
  function addProduct() {
    const productosContainer = document.getElementById("productosContainer");
  
    const productRow = `
        <div class="input-group mb-2">
          <select class="form-select producto-select" onchange="updatePrecio(this)" required>
            <option value="">Seleccione un producto...</option>
          </select>
          <input type="number" class="form-control precio-producto" placeholder="Precio" readonly>
          <input type="number" class="form-control cantidad-producto" placeholder="Cantidad" required>
          <button class="btn btn-danger" type="button" onclick="removeProduct(this)">-</button>
        </div>
      `;
  
    productosContainer.insertAdjacentHTML("beforeend", productRow);
    loadProductos(); // Cargar productos para el nuevo select
  }
  
  function removeProduct(button) {
    button.parentElement.remove();
    calculateTotal(); // Recalcular el total después de eliminar
  }
  
  function calculateTotal() {
      const productosContainer = document.getElementById("productosContainer");
      const productoRows = productosContainer.querySelectorAll(".input-group");
    
      let total = 0;
    
      productoRows.forEach((row) => {
        const precio = parseFloat(row.querySelector(".precio-producto").value) || 0;
        const cantidad = parseFloat(row.querySelector(".cantidad-producto").value) || 0;
        total += precio * cantidad;
      });
    
      document.getElementById("totalPedido").value = `$${total.toFixed(2)}`;
    }
    
    // Escuchar cambios en las cantidades para recalcular el total
    document.getElementById("productosContainer").addEventListener("input", calculateTotal);
    
  