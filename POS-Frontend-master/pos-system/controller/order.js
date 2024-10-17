
import { OrderModel } from "../model/OrderModel.js";
import { OrderDetailsModel } from "../model/OrderDetailsModel.js";
import { loadCMBDetails } from "./orderDetails.js";

initialize()

function initialize() {
    generateOrderId()

}

function generateOrderId() {
    $.ajax({
        url: "http://localhost:8080/orders",
        type: "GET",
        data: { "nextid": "nextid" },
        success: (res) => {
            let code = res.substring(1, res.length - 1);
            $('#order-id').val(code);
        },
        error: (err) => {
            console.error(err);
        }
    });
}


export function loadCombos(array, comboBoxId) {
    var comboBox = $('#' + comboBoxId);
    comboBox.empty();
    comboBox.append($('<option>', { value: '', text: 'Select Customer ID...' }));
    array.forEach(function (customer) {
        comboBox.append($('<option>', { value: customer.id, text: customer.id }));
    });
}

$('#customer-id-order').on('change', () => {
    var selectedId = $('#customer-id-order').val();
    $.ajax({
        url: "http://localhost:8080/customer",
        type: "GET",
        data: { "id": selectedId },
        success: (res) => {
            const selectedCustomer = JSON.parse(res);
            if (selectedCustomer) {
                $('#customer-name-orderForm').val(selectedCustomer.name);
                $('#customer_address-orderForm').val(selectedCustomer.address);
                $('#customer-salary-orderForm').val(selectedCustomer.salary);
            }
        },
        error: (err) => {
            console.error(err);
        }
    });
});

export function loadComboItem(array, comboBoxId) {
    var comboBox = $('#' + comboBoxId);
    comboBox.empty();
    comboBox.append($('<option>', { value: '', text: 'Select Item Code...' }));
    array.forEach(function (item) {
        comboBox.append($('<option>', { value: item.itemId, text: item.itemId }));
    });
}

$('#inputState-item').on('change', () => {
    var selectedCode = $('#inputState-item').val();
    $.ajax({
        url: "http://localhost:8080/item",
        type: "GET",
        data: { "code": selectedCode },
        success: (res) => {
            const selectedItem = JSON.parse(res);
            if (selectedItem) {
                $('#inputPassword4').val(selectedItem.itemCode);
                $('#item-name-orderForm').val(selectedItem.name);
                $('#item-price-orderForm').val(selectedItem.price);
                $('#qtyHand').val(selectedItem.qty);
            }
        },
        error: (err) => {
            console.error(err);
        }
    });
});

let cart = [];

$('#btn-item').on('click', () => {
    let itemId = $('#inputPassword4').val();
    let orderQTY = parseInt($('#order-qty').val());
    let unitPrice = parseFloat($('#item-price-orderForm').val());
    let qty = parseInt($('#qtyHand').val());

    let total = unitPrice * orderQTY;

    if (qty >= orderQTY) {
        let cartItemIndex = cart.findIndex(cartItem => cartItem.itemId === itemId);
        if (cartItemIndex < 0) {
            let cart_item = { itemId: itemId, unitPrice: unitPrice, qty: orderQTY, total: total }
            cart.push(cart_item);
            loadCart();
            setTotalValues();
            clearItemSection();
        } else {
            cart[cartItemIndex].qty += orderQTY;
            cart[cartItemIndex].total = cart[cartItemIndex].qty * cart[cartItemIndex].unitPrice;
            loadCart();
            setTotalValues();
            clearItemSection();
        }
    } else {
        alert("Not enough quantity in stock");
    }
});

function loadCart() {
    $('#order-table-body').empty();
    cart.map((item) => {
        $('#order-table-body').append(
            `<tr>
                <th scope="row">${item.itemId}</th>
                <td>${item.unitPrice}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
                <td><button class="cart_remove" data-id="${item.itemId}">Remove</button></td>
            </tr>`
        );
    });
}

function calculateTotal() {
    let netTotal = 0;
    cart.map((cart_item) => {
        netTotal += cart_item.total;
    });
    return netTotal;
}

function setTotalValues() {
    let netTotal = calculateTotal();
    $('#total').val(`${netTotal}/=`);
    let discount_percentage = $('#discount').val() || 0;
    let discountAmount = (netTotal * discount_percentage) / 100;
    $('#subtotal').val(`${netTotal - discountAmount}/=`);
}

function clearItemSection() {
    $('#inputPassword4').val('');
    $('#item-name-orderForm').val('');
    $('#item-price-orderForm').val('');
    $('#qtyHand').val('');
    $('#order-qty').val('');
}

function clearCustomerSection() {
    $('#customer-name-orderForm').val('');
    $('#customer_address-orderForm').val('');
    $('#customer-salary-orderForm').val('');
}

function clearPaymentSection() {
    $('#cash').val('');
    $('#balance').val('');
    $('#discount').val('');
}

function setBalance() {
    let subTotal = parseFloat($('#subtotal').val());
    let cashAmount = parseFloat($('#cash').val());
    $('#balance').val(cashAmount - subTotal);
}

$('#cash').on('input', setBalance);

$('#discount').on('input', () => {
    let discountValue = parseFloat($('#discount').val()) || 0;
    if (discountValue < 0 || discountValue > 100) {
        discountValue = Math.min(100, Math.max(0, discountValue));
        $('#discount').val(discountValue);
    }
    setTotalValues();
    setBalance();
});

$('#order-table-body').on('click', '.cart_remove', function () {
    const itemId = $(this).data('id');
    cart = cart.filter(cartItem => cartItem.itemId !== itemId);
    loadCart();
    setTotalValues();
});

$('#btn-order').on('click', () => {
    const confirmation = confirm("Do you want to proceed with the payment?");
    if (confirmation) {
        const orderId = $('#order-id').val();
        const orderDate = $('#order-date').val();
        const customerId = $('#customer-id-order').val();
        const total = $('#subtotal').val();

        if (!orderId || !orderDate || !customerId || cart.length === 0) {
            alert("Please fill in all the details and add at least one item to the cart.");
            return;
        }

        cart.forEach(cartItem => {
            const item = items.find(i => i.itemCode === cartItem.itemId);
            if (item) {
                item.qty -= cartItem.qty;
            }
        });

        const newOrder = new OrderModel(orderId, orderDate, total, customerId);
        orders.push(newOrder);

        cart.forEach(cartItem => {
            let orderDetailsItem = new OrderDetailsModel(orderId, cartItem.itemId, cartItem.unitPrice, cartItem.qty, cartItem.total);
            orderDetails.push(orderDetailsItem);
        });

        loadCMBDetails(orders, 'inputGroupSelect-orderDetails');

        cart = [];
        loadCart();
        setTotalValues();
        clearCustomerSection();
        generateOrderId();
        clearPaymentSection();

        alert("Payment successful. Order has been placed.");
    }
});

