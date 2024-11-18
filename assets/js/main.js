(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    const elements = select(el, all);
    if (all && elements) {
      elements.forEach((e) => e.addEventListener(type, listener));
    } else if (elements) {
      elements.addEventListener(type, listener);
    }
  };

  /**
   * Sidebar toggle
   */
  if (select(".toggle-sidebar-btn")) {
    on("click", ".toggle-sidebar-btn", () => {
      select("body").classList.toggle("toggle-sidebar");
    });
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  window.addEventListener("scroll", navbarlinksActive);

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  const toggleBacktotop = () => {
    if (backtotop) {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    }
  };
  window.addEventListener("load", toggleBacktotop);
  window.addEventListener("scroll", toggleBacktotop);

  /**
   * Initiate Bootstrap validation check
   */
  const needsValidation = document.querySelectorAll(".needs-validation");
  needsValidation.forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // **Verificar si el usuario está autenticado**
  if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html";
  }

  // **Función para cerrar sesión**
  const logoutBtn = select("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "login.html";
    });
  }
})();

// Referencia al formulario de cliente y modal
const clientForm = document.getElementById("clientForm");
const addClientModal = new bootstrap.Modal(document.getElementById("addClientModal"));

// Función para mostrar alertas con SweetAlert2
function showAlert(message, iconType) {
  Swal.fire({
    icon: iconType,
    title: iconType === 'success' ? '¡Éxito!' : 'Error',
    text: message,
    confirmButtonText: 'OK'
  });
}

// Evento de envío del formulario
clientForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevenir el envío normal del formulario

  // Obtener los valores de los campos del formulario
  const clientName = document.getElementById("clientName").value.trim();
  const clientType = document.getElementById("clientType").value.trim();
  const clientID = document.getElementById("clientID").value.trim();
  const clientAddress = document.getElementById("clientAddress").value.trim();
  const clientPhone = document.getElementById("clientPhone").value.trim();
  const clientEmail = document.getElementById("clientEmail").value.trim();
  const clientStatus = document.getElementById("clientStatus").value.trim();

  // Validación básica para asegurarse de que no hay campos vacíos
  if (!clientName || !clientType || !clientID || !clientAddress || !clientPhone || !clientEmail || !clientStatus) {
    showAlert('Por favor, complete todos los campos.', 'error');
    return;
  }

  // Crear objeto cliente
  const client = {
    name: clientName,
    type: clientType,
    id: clientID,
    address: clientAddress,
    phone: clientPhone,
    email: clientEmail,
    status: clientStatus,
  };

  // Obtener la lista de clientes desde localStorage
  let clients = JSON.parse(localStorage.getItem("clients")) || [];

  // Verificar si estamos editando un cliente existente
  const clientId = clientForm.getAttribute("data-edit-client-id");
  if (clientId) {
    const clientIndex = clients.findIndex((c) => c.id === clientId);
    if (clientIndex > -1) {
      clients[clientIndex] = client;
    }
  } else {
    // Validar si el ID ya existe para evitar duplicados
    const existingClient = clients.find((c) => c.id === client.id);
    if (existingClient) {
      showAlert('El ID del cliente ya existe. Por favor, use un ID diferente.', 'error');
      return;
    }
    clients.push(client);
  }

  // Guardar la lista actualizada de clientes en localStorage
  try {
    localStorage.setItem("clients", JSON.stringify(clients));
    showAlert('Cliente guardado con éxito.', 'success');
  } catch (error) {
    showAlert('Hubo un error al guardar el cliente. Inténtelo nuevamente.', 'error');
    return;
  }

  // Limpiar el formulario y restablecer el estado
  clientForm.reset();
  clientForm.removeAttribute("data-edit-client-id");
  document.querySelector("#clientForm button").textContent = "Guardar Cliente";
  addClientModal.hide();

  // Recargar la lista de clientes en la tabla
  loadClients();
});

// Función para cargar y mostrar clientes en una tabla
// Función para cargar y mostrar clientes en una tabla
function loadClients() {
  const tableBody = document.querySelector("#clientesTableBody");
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  tableBody.innerHTML = ""; // Limpiar filas anteriores

  clients.forEach((client, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${client.name}</td>
      <td>${client.type}</td>
      <td>${client.id}</td>
      <td>${client.address}</td>
      <td>${client.phone}</td>
      <td>${client.email}</td>
      <td>${client.status}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editClient('${client.id}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Eliminar</button>
      </td>
    `;
    // Usa 'tableBody' en lugar de 'clientsTableBody'
    tableBody.appendChild(row);
  });
}


// Función para editar un cliente
function editClient(clientId) {
  const clients = JSON.parse(localStorage.getItem("clients")) || [];
  const client = clients.find((c) => c.id === clientId);
  if (client) {
    document.getElementById("clientName").value = client.name;
    document.getElementById("clientType").value = client.type;
    document.getElementById("clientID").value = client.id;
    document.getElementById("clientAddress").value = client.address;
    document.getElementById("clientPhone").value = client.phone;
    document.getElementById("clientEmail").value = client.email;
    document.getElementById("clientStatus").value = client.status;
    clientForm.setAttribute("data-edit-client-id", clientId);
    document.querySelector("#clientForm button").textContent = "Actualizar Cliente";
    addClientModal.show();
  }
}

// Función para eliminar un cliente
function deleteClient(clientId) {
  Swal.fire({
    title: '¿Está seguro?',
    text: "¡No podrás revertir esta acción!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      let clients = JSON.parse(localStorage.getItem("clients")) || [];
      clients = clients.filter((client) => client.id !== clientId);
      localStorage.setItem("clients", JSON.stringify(clients));
      showAlert('Cliente eliminado correctamente.', 'success');
      loadClients();
    }
  });
}

// Función de búsqueda
function searchClient() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#clientesTableBody tr");

  rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(input) ? "" : "none";
  });
}



// Cargar los clientes al iniciar la página
document.addEventListener("DOMContentLoaded", loadClients);
