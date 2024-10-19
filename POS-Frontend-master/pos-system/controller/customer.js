
import CustomerModel from "../model/CustomerModel.js";
import {loadCombos} from "./order.js";

var recordIndex;
initialize();

function initialize() {
    $.ajax({
        url: "http://localhost:8080/pos/api/v1/customer/nextId",
        type: "GET",
        success: (res) => {
            console.log(res);
            $("#customer_id").val(res);
        },
        error: (err) => {
            console.error(err);
        }
    });
    setTimeout(() => {
        loadTable();
    }, 1000);
}


function validateCustomerAddress(address) {
    const lettersOnlyRegex = /^[A-Za-z\s]+$/;
    if (!address || address.trim() === "") {
        alert("Customer address cannot be empty.");
        return false;
    }
    if (!lettersOnlyRegex.test(address)) {
        alert("Customer address can only contain letters and spaces.");
        return false;
    }
    return true;
}

function validateCustomerName(name) {
    const lettersOnlyRegex = /^[A-Za-z\s]+$/;
    if (!name || name.trim() === "") {
        alert("Customer name cannot be empty.");
        return false;
    }
    if (!lettersOnlyRegex.test(name)) {
        alert("Customer name can only contain letters and spaces.");
        return false;
    }
    return true;
}

function validateCustomerPhoneNumber(phoneNumber) {
    const phoneRegex = /^(?:\+94|94|0)?7\d{8}$/; // 10-digit phone number
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        alert("Invalid phone number. Please enter a valid 10-digit phone number.");
        return false;
    }
    return true;
}

$('#save-customer').on('click', () => {
    var customerId = $('#customer_id').val();
    var customerName = $('#customer_name').val();
    var customerAddress = $('#customer_address').val();
    var customerContact = $('#customer_tel').val();

    if (!validateCustomerName(customerName) ||
        !validateCustomerAddress(customerAddress) ||
        !validateCustomerPhoneNumber(customerContact)) {
        return;
    }

    $('#close-customer-model').click();

    let customer = new CustomerModel(customerId, customerName, customerAddress, customerContact);
    let JsonCustomer = JSON.stringify(customer);
    $.ajax({
        url: "http://localhost:8080/pos/api/v1customer",
        type: "POST",
        data: JsonCustomer,
        headers: {"Content-Type": "application/json"},
        success: (res) => {
            alert("Customer saved successfully");
            initialize();
        },
        error: (err) => {
            console.error(err);
            alert("Failed to save customer");
        }
    });

    console.log(customer);

    initialize();
});

$('#inputGroupSelect-customer').on('change', () => {
    if ($('#inputGroupSelect-customer').val() !== 'select the customer') {
        $('#customer-tbl-body').empty();

        $.ajax({
            url: "http://localhost:8080/pos/api/v1/customer/search/"+$('#inputGroupSelect-customer').val(),
            type: "GET",
            success: (res) => {
                let customer = res;
                let record = `<tr>
                                <td class="customer-id-value">${customer.id}</td>
                                <td class="customer-name-value">${customer.name}</td>
                                <td class="customer-address-value">${customer.address}</td>
                                <td class="customer-contact-value">${customer.contact}</td>
                            </tr>`;
                $('#customer-tbl-body').append(record);
            },
            error: (err) => {
                console.error(err);
            }
        });
    } else {
        loadTable();
    }
});

function loadTable() {
    $('#customer-tbl-body').empty();
    let customerArray = [];

    $.ajax({
        url: "http://localhost:8080/pos/api/v1/customer",
        type: "GET",
        success: (res) => {
            console.log("customer all ");
            console.log(res);
            customerArray = res;
            loadComboBoxes(customerArray, "inputGroupSelect-customer");
            loadCombos(customerArray, "customer-id-order");
            customerArray.map((customer) => {
                let record = `<tr>
                        <td class="customer-id-value">${customer.id}</td>
                        <td class="customer-name-value">${customer.name}</td>
                        <td class="customer-address-value">${customer.address}</td>
                        <td class="customer-contact-value">${customer.contact}</td>
                    </tr>`;
                $('#customer-tbl-body').append(record);
            });
        },
        error: (err) => {
            console.log(err);
        }
    });
}

$("#customer-tbl-body").on('click', 'tr', function () {
    let id = $(this).find(".customer-id-value").text();
    let name = $(this).find(".customer-name-value").text();
    let address = $(this).find(".customer-address-value").text();
    let contact = $(this).find(".customer-contact-value").text();

    $("#inputGroupSelect-customer").val(id);

    $("#customer_id").val(id);
    $("#customer_name").val(name);
    $("#customer_address").val(address);
    $("#customer_tel").val(contact);
});

$("#delete-customer").on('click', () => {
    const confirmation = confirm("Are you sure you want to delete this customer?");
    if (confirmation) {
        let id = $("#inputGroupSelect-customer").val();
        $.ajax({
            url: "http://localhost:8080/pos/api/v1/customer/" + id,
            type: "DELETE",
            success: (res) => {
                console.log(JSON.stringify(res));
                alert("Customer deleted successfully.");
            },
            error: (res) => {
                console.error(res);
            }
        });

        setTimeout(()=>{
            initialize()
        },1000)
    } else {
        alert("Deletion canceled.");
    }
});

$('#revew-customer').on('click', () => {
    var customerId = $('#customer_id').val();

    $.ajax({
        url: "http://localhost:8080/pos/api/v1/customer/"+customerId,
        type: "GET",
        success: (res) => {
            let customer = JSON.parse(res);
            $("#customer_name").val(customer.name);
            $("#customer_address").val(customer.address);
            $("#customer_tel").val(customer.contact);
        },
        error: (err) => {
            console.error(err);
            alert("Customer with the entered ID does not exist.");
        }
    });
});

$('#close-customer-model').on('click', () => {
    $('#customer_id').val('');
    $('#customer_name').val('');
    $('#customer_address').val('');
    $('#customer_tel').val('');
});

$('#exite-customer-model').on('click', () => {
    $('#staticBackdrop-customer').modal('hide');
});

$("#Update-customer").on("click", () => {
    let id = $("#customer_id").val();
    let name = $("#customer_name").val();
    let address = $("#customer_address").val();
    let contact = $("#customer_tel").val();

    if (id) {
        $("#staticBackdrop-customer").modal("show");
        $("#customer_id").val(id);
        $("#customer_name").val(name);
        $("#customer_address").val(address);
        $("#customer_tel").val(contact);
    } else {
        alert("Please select a customer from the table.");
    }
});

$("#update-customer-model").on("click", () => {
    var updatedId = $("#customer_id").val();
    var updatedName = $("#customer_name").val();
    var updatedAddress = $("#customer_address").val();
    var updatedTel = $("#customer_tel").val();

    let customer = new CustomerModel(updatedId, updatedName, updatedAddress, updatedTel);
    let customerJson = JSON.stringify(customer);

    $.ajax({
        url: "http://localhost:8080/pos/api/v1/customer/" + updatedId,
        type: "PUT",
        data: customerJson,
        contentType: "application/json",
        success: (res) => {
            alert("Customer updated successfully.");
        },
        error: (err) => {
            console.error(err);
            alert("Customer not updated.");
        }
    });

    setTimeout(()=>{
        initialize()
    },1000)
});

function loadComboBoxes(array, comboBoxId) {
    var comboBox = $('#' + comboBoxId);
    comboBox.empty();

    comboBox.append($('<option>', {
        value: 'select the customer',
        text: 'select the customer'
    }));

    array.forEach(function(customer) {
        comboBox.append($('<option>', {
            value: customer.id,
            text: customer.id
        }));
    });
}



$('#all-customer').on('click', () => {
    loadTable();
});

$('#add').on('click', () => {
    initialize()
});