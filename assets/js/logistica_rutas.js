document.addEventListener("DOMContentLoaded", function () {
    const routeForm = document.getElementById("routeForm");
    const routesTableBody = document.getElementById("routesTableBody");
    const routeModal = new bootstrap.Modal(document.getElementById("routeModal"));

    let routes = JSON.parse(localStorage.getItem("routes")) || [];

    // Renderizar la tabla de rutas
    function renderRoutes() {
        routesTableBody.innerHTML = "";
        routes.forEach((route, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${route.vehicle}</td>
                <td>${route.driver}</td>
                <td>${route.orders.join(", ")}</td>
                <td>${route.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editRoute(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRoute(${index})">Eliminar</button>
                </td>
            `;
            routesTableBody.appendChild(row);
        });
    }

    // Añadir o actualizar ruta
    routeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const vehicle = routeForm.vehicle.value;
        const driver = routeForm.driver.value;
        const orders = Array.from(routeForm.orders.selectedOptions).map(opt => opt.value);
        const status = routeForm.status.value;

        if (!vehicle || !driver || orders.length === 0 || !status) {
            Swal.fire("Error", "Por favor, complete todos los campos.", "error");
            return;
        }

        const newRoute = { vehicle, driver, orders, status };

        const routeId = routeForm.getAttribute("data-edit-id");
        if (routeId) {
            routes[routeId] = newRoute;
            Swal.fire("Actualizado", "Ruta actualizada correctamente.", "success");
            routeForm.removeAttribute("data-edit-id");
        } else {
            routes.push(newRoute);
            Swal.fire("Guardado", "Ruta añadida correctamente.", "success");
        }

        localStorage.setItem("routes", JSON.stringify(routes));
        renderRoutes();
        routeForm.reset();
        routeModal.hide();
    });

    // Editar ruta
    window.editRoute = function (index) {
        const route = routes[index];
        routeForm.vehicle.value = route.vehicle;
        routeForm.driver.value = route.driver;
        Array.from(routeForm.orders.options).forEach(opt => {
            opt.selected = route.orders.includes(opt.value);
        });
        routeForm.status.value = route.status;
        routeForm.setAttribute("data-edit-id", index);
        routeModal.show();
    };

    // Eliminar ruta
    window.deleteRoute = function (index) {
        Swal.fire({
            title: "¿Está seguro?",
            text: "No podrás revertir esta acción.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(result => {
            if (result.isConfirmed) {
                routes.splice(index, 1);
                localStorage.setItem("routes", JSON.stringify(routes));
                Swal.fire("Eliminado", "Ruta eliminada correctamente.", "success");
                renderRoutes();
            }
        });
    };

    renderRoutes();
});
