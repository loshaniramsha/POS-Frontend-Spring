
export function loadCMBDetails(array, comboBoxId) {
    console.log("combo-box loaded", array, comboBoxId);
    const comboBox = $('#' + comboBoxId);
    comboBox.empty();
    comboBox.append($('<option>', { value: '', text: 'Search order...' }));

    // Populate the combo box with the fetched orders
    array.forEach(function (order) {
        comboBox.append($('<option>', { value: order.orderId, text: order.orderId }));
    });
}

// Fetch the order details from the server when the combo box changes
$('#inputGroupSelect-orderDetails').on('change', () => {
    const selectedOrderId = $('#inputGroupSelect-orderDetails').val();

    if (selectedOrderId !== '') {
        // Make an AJAX request to get order details for the selected order ID
        $.ajax({
            url: "http://localhost:8080/order-details", // Change the URL as needed
            type: "GET",
            data: { orderId: selectedOrderId },
            success: (response) => {
                console.log("Selected Order Details:", response);

                const selectedOrderDetails = JSON.parse(response); // Parse the response from the server

                if (selectedOrderDetails.length > 0) {
                    $('#ordrDtails-tbl-body').empty();
                    selectedOrderDetails.forEach(orderDetail => {
                        $('#ordrDtails-tbl-body').append(`
                            <tr>
                                <td>${orderDetail.orderId}</td>
                                <td>${orderDetail.itemCode}</td>
                                <td>${orderDetail.unitPrice}</td>
                                <td>${orderDetail.qty}</td>
                                <td>${orderDetail.total}</td>
                            </tr>
                        `);
                    });
                } else {
                    $('#ordrDtails-tbl-body').empty();
                }
            },
            error: (error) => {
                console.error("Error fetching order details:", error);
            }
        });
    } else {
        $('#ordrDtails-tbl-body').empty();
    }
});
