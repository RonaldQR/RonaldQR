document.addEventListener("DOMContentLoaded", function () {
    const pedidoForm = document.getElementById("pedidoForm");
    const pedidosTableBody = document.getElementById("pedidosTableBody");
    const pedidoModal = new bootstrap.Modal(document.getElementById("pedidoModal"));
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
  
    // Calcular el total del pedido (ejemplo simple)
    function calcularTotal(productos) {
      const productosArray = productos.split(",");
      return productosArray.length * 10000; // Asume que cada producto cuesta 10,000
    }
  
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
  
    renderPedidos(); // Inicializar tabla al cargar la página
  });
  