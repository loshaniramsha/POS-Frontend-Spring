
import ItemModel from "../model/ItemModel.js";
import {loadComboItem, loadCombos} from "./order.js";

let recordIndex;

initialize();


function initialize() {
    $.ajax({
        url: "http://localhost:8080/item",
        type: "GET",
        data: { "nextid": "nextid" },
        success: (res) => {
            let code = res.substring(1, res.length - 1);
            console.log(code);
            $("#itemCode").val(code);
        },
        error: (err) => {
            console.error(err);
        }
    });

    setTimeout(() => {
        loadItemTable();
    }, 1000);
}

// Function to validate item name
function validateItemName(name) {
    const lettersOnlyRegex = /^[A-Za-z\s]+$/;
    if (!name || name.trim() === "") {
        alert("Item name cannot be empty.");
        return false;
    }
    if (!lettersOnlyRegex.test(name)) {
        alert("Item name can only contain letters and spaces.");
        return false;
    }
    return true;
}

// Function to validate item price
function validateItemPrice(price) {
    if (!price || isNaN(price) || price <= 0) {
        alert("Item price must be a positive number.");
        return false;
    }
    return true;
}

// Function to validate item quantity
function validateItemQty(qty) {
    if (!qty || isNaN(qty) || qty <= 0) {
        alert("Item quantity must be a positive number.");
        return false;
    }
    return true;
}


$("#item-save").on('click', () => {
    const itemCode = $("#itemCode").val();
    const itemName = $("#item_name").val();
    const itemPrice = $("#item_price").val();
    const itemQty = $("#item_qty").val();

    // Validate fields
    if (!validateItemName(itemName)) return;
    if (!validateItemPrice(itemPrice)) return;
    if (!validateItemQty(itemQty)) return;

    $('#close-item-model').click();

    const newItem = {
        itemId: itemCode,
        itemName: itemName,
        itemPrice: itemPrice,
        itemQty: itemQty
    }; // Create new item object

    let jsonItem = JSON.stringify(newItem); // Convert item to JSON

    $.ajax({
        url: "http://localhost:8080/item",
        type: "POST",
        data: jsonItem,
        contentType: "application/json", // Correctly set Content-Type
        success: (res) => {
            console.log(JSON.stringify(res));
            alert("Item saved successfully");
            initialize();
        },
        error: (err) => {
            console.error(err);
        }
    });

    console.log(newItem);
    initialize();
});


// Item selection change event
$("#inputGroupSelect-item").on('change', () => {


    if ($('#inputGroupSelect-item').val() !== 'select the item') {
        $("#item-tbl-body").empty();
        // Make an AJAX call to fetch the selected item details
        $.ajax({
            url: "http://localhost:8080/item",
            type: "GET",
            data: { "id":$('#inputGroupSelect-item').val() },  // Correct parameter to match the ID
            success: (res) => {
                let item = JSON.parse(res);  // Parse the JSON response
                $("#item-tbl-body").empty();  // Clear the table body before adding the new item

                // Create a table row for the selected item
                const record = `<tr>
                    <td class="item-code-value">${item.itemId}</td>
                    <td class="item-name-value">${item.itemName}</td>
                    <td class="item-price-value">${item.itemPrice}</td>
                    <td class="item-qty-value">${item.itemQty}</td>
                </tr>`;

                $("#item-tbl-body").append(record);  // Append the item record to the table
            },
            error: (err) => {
                console.error(err);
                alert("Failed to load the selected item. Please try again.");
            }
        });
    } else {
        // Load all items if 'select the item' is chosen
        loadItemTable();  // Corrected function call to load all items
    }
});



// Function to load items into the table
function loadItemTable() {
    $("#item-tbl-body").empty(); // Clear the current table body

    $.ajax({
        url: "http://localhost:8080/item",
        type: "GET",
        data: { "all": "getAll" }, // Request to get all items
        success: (res) => {
            console.log(res);
            let itemArray = JSON.parse(res); // Parse the JSON response
            console.log(itemArray);
            loadItemComboBoxes(itemArray, "inputGroupSelect-item");
            loadComboItem(itemArray, "item-id-order");

            // Loop through the array and add each item to the table
            itemArray.forEach((item) => {
                const record = `<tr>
                    <td class="item-code-value">${item.itemId}</td>
                    <td class="item-name-value">${item.itemName}</td>
                    <td class="item-price-value">${item.itemPrice}</td>
                    <td class="item-qty-value">${item.itemQty}</td>
                </tr>`;
                $("#item-tbl-body").append(record); // Append each record to the table body
            });
        },
        error: (err) => {
            console.error(err); // Log errors to the console
            alert("Failed to load items. Please try again.");
        }
    });
}




// Item table row click event to select an item
$("#item-tbl-body").on('click', 'tr', function () {
   // recordIndex = $(this).index();
    const code = $(this).find(".item-code-value").text();
    const name = $(this).find(".item-name-value").text();
    const price = $(this).find(".item-price-value").text();
    const qty = $(this).find(".item-qty-value").text();

    $('#inputGroupSelect-item').val(code);

    $("#itemCode").val(code);
    $("#item_name").val(name);
    $("#item_price").val(price);
    $("#item_qty").val(qty);
});

// Delete item button click event
$("#item-delete").on('click', () => {
    const confirmation = confirm("Are you sure you want to delete this item?");
    if (confirmation) {
        let id=$("#itemCode").val();
        $.ajax({
            url: "http://localhost:8080/item?id=" + id,
            type: "DELETE",
            success: (res) => {
                console.log(JSON.stringify(res));
                alert("item deleted successfully.");
            },
            error: (res) => {
                console.error(res);
            }
        });

        setTimeout(()=>{
            initialize()
        },1000)
    } else {
        alert("Delete canceled");
    }
});

// Close item modal button click event
$('#close-item-model').on('click', () => {
    $('#itemCode').val('');
    $('#item_name').val('');
    $('#item_price').val('');
    $('#item_qty').val('');
});

// Exit item modal button click event
$('#exite-item-model').on('click', () => {
    $('#staticBackdrop-item').modal('hide');
});


// Update item button click event
$('#update-item').on('click', () => {
    const code = $("#itemCode").val();
    const name = $("#item_name").val();
    const price = $("#item_price").val();
    const qty = $("#item_qty").val();

    if (code) {
        $("#staticBackdrop-item").modal("show");
        $("#itemCode").val(code);
        $("#item_name").val(name);
        $("#item_price").val(price);
        $("#item_qty").val(qty);
    } else {
        alert("Please select an item from the table.");
    }
});

// Review item button click event
$('#revew-item').on('click', () => {
    console.log("Click review");
    const itemId = $("#itemCode").val();

    if (!itemId) {
        alert("Please enter an item code to review.");
        return;
    }

    $.ajax({
        url: "http://localhost:8080/item",
        type: "GET",
        data: { "id": itemId },
        success: (res) => {
            if (res) {
                let item = JSON.parse(res);
                $("#item_name").val(item.itemName);  // Corrected property name
                $("#item_price").val(item.itemPrice);  // Corrected property name
                $("#item_qty").val(item.itemQty);  // Corrected property name
            } else {
                alert("No item found with the entered ID.");
            }
        },
        error: (err) => {
            console.error(err);
            alert("Error retrieving item. Please check the item ID.");
        }
    });
});




// Update item modal button click event
$("#update-item-model").on("click", () => {
    const updatedCode = $("#itemCode").val();
    const updatedName = $("#item_name").val();
    const updatedPrice = $("#item_price").val();
    const updatedQty = $("#item_qty").val();
    let item=new ItemModel(updatedCode,updatedName,updatedPrice,updatedQty);
    let itemJson=JSON.stringify(item);

    $.ajax({
        url: "http://localhost:8080/item",
        type: "PUT",
        data: itemJson,
        contentType: "application/json",
        success: (res) => {
            alert("Item updated successfully.");
        },
        error: (err) => {
            console.error(err);
            alert("item not updated.");
        }
    });

    setTimeout(()=>{
        initialize()
    },1000)



});

// Function to load items into a combo box
function loadItemComboBoxes(array, comboBoxId) {
    var comboBox = $('#' + comboBoxId);
    comboBox.empty();

    comboBox.append($('<option>', {
        value: 'select the item',
        text: 'select the item'
    }));

    array.forEach(function(item) {
        comboBox.append($('<option>', {
            value: item.itemId,
            text: item.itemId
        }));
    });
}



// Load all items button click event
$('#all-item').on('click', () => {
    loadItemTable();
});
