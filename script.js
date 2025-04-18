// Restaurant data
const restaurantInfo = {
    shopName: "Delicious Bites",
    address: "123 Food Street, Mumbai",
    phone: "+91 9876543210",
    cashier: "John Doe"
};

// Sample menu data
let menuItems = [
    {id: 1, name: 'Pizza', price: 100},
    {id: 2, name: 'Cake', price: 50},
    {id: 3, name: 'Burger', price: 20},
    {id: 4, name: 'French Fries', price: 20},
    {id: 5, name: 'Samosa', price: 30},
    {id: 6, name: 'Donut', price: 40},
    {id: 7, name: 'Spring Roll', price: 50},
    {id: 8, name: 'Sandwich', price: 10},
    {id: 9, name: 'Fried Chicken', price: 50},
    {id: 10, name: 'Vada Pav', price: 60},
    {id: 11, name: 'Egg Roll', price: 70},
    {id: 12, name: 'Puri Sabji', price: 100},
    {id: 13, name: 'Paneer Roll', price: 100}
];

// Current bill data
let currentBill = {
    items: [],
    total: 0,
    paymentMethod: 'Cash',
    customerName: 'Walk-in'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log("App initialized");
    renderMenuItems();
    setupReceipt();
    updateCurrentDate();
    initializeQRGenerator();
    setupBillItemListeners();
});

// Tab navigation
function openTab(tabId) {
    console.log(`Attempting to switch to tab: ${tabId}`);
    try {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

        const tabElement = document.getElementById(tabId);
        const tabButton = document.querySelector(`.tab[onclick="openTab('${tabId}')"]`);

        if (tabElement && tabButton) {
            tabElement.classList.add('active');
            tabElement.style.display = 'block';
            tabButton.classList.add('active');
            console.log(`Successfully switched to tab: ${tabId}`);
            if (tabId === 'customer-bill' && currentBill.items.length === 0) {
                alert('Please create a bill first in the "Create Bill" tab.');
            }
        } else {
            console.error(`Tab element or button not found for ID: ${tabId}`);
        }
    } catch (error) {
        console.error(`Error in openTab: ${error.message}`);
    }
}

// Menu Management
function renderMenuItems() {
    const tbody = document.getElementById('menu-items');
    if (!tbody) return;
    tbody.innerHTML = '';
    menuItems.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>
                <button onclick="editMenuItem(${item.id})">Edit</button>
                <button onclick="deleteMenuItem(${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function addMenuItem() {
    const name = document.getElementById('new-name').value.trim();
    const price = parseInt(document.getElementById('new-price').value);
    
    if (!name || isNaN(price) || price < 0) {
        alert('Please fill all fields correctly with valid values');
        return;
    }

    const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
    menuItems.push({ id: newId, name, price });

    document.getElementById('new-name').value = '';
    document.getElementById('new-price').value = '';
    renderMenuItems();
}

function editMenuItem(id) {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;

    const newName = prompt('Enter new name:', item.name);
    const newPrice = parseInt(prompt('Enter new price:', item.price));
    
    if (newName && !isNaN(newPrice) && newPrice >= 0) {
        item.name = newName.trim();
        item.price = newPrice;
        renderMenuItems();
    }
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        renderMenuItems();
    }
}

// Bill Management
function addBillItem() {
    const billItems = document.getElementById('bill-items');
    if (!billItems) return;
    const newItem = document.createElement('div');
    newItem.className = 'bill-item';
    newItem.innerHTML = `
        <input type="text" class="food-id" placeholder="Food ID" onchange="fillFoodDetails(this)">
        <input type="text" class="food-name" placeholder="Food Name" readonly>
        <input type="number" class="food-price" placeholder="Price" readonly>
        <input type="number" class="food-qty" placeholder="Qty" min="1" onchange="calculateTotal(this)">
        <input type="number" class="food-total" placeholder="Total" readonly>
        <button class="danger-btn" onclick="removeBillItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    billItems.appendChild(newItem);
    setupBillItemListeners();
    newItem.querySelector('.food-id').focus();
}

function removeBillItem(button) {
    if (button && button.parentElement) {
        button.parentElement.remove();
        calculateGrandTotal();
    }
}

function fillFoodDetails(input) {
    const foodId = parseInt(input.value);
    const item = menuItems.find(item => item.id === foodId);
    
    if (item) {
        const parent = input.parentElement;
        parent.querySelector('.food-name').value = item.name;
        parent.querySelector('.food-price').value = item.price;
    }
}

function calculateTotal(input) {
    const parent = input.parentElement;
    const price = parseInt(parent.querySelector('.food-price').value) || 0;
    const qty = parseInt(input.value) || 0;
    const total = price * qty;
    parent.querySelector('.food-total').value = total;
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let grandTotal = 0;
    document.querySelectorAll('.food-total').forEach(input => {
        grandTotal += parseInt(input.value) || 0;
    });
    document.getElementById('grand-total').textContent = grandTotal;
}

function setupBillItemListeners() {
    document.querySelectorAll('.food-id').forEach(input => {
        input.removeEventListener('keydown', handleFoodIdEnter);
        input.addEventListener('keydown', handleFoodIdEnter);
    });
    document.querySelectorAll('.food-qty').forEach(input => {
        input.removeEventListener('keydown', handleQtyEnter);
        input.addEventListener('keydown', handleQtyEnter);
    });
}

function handleFoodIdEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        fillFoodDetails(event.target);
        const parent = event.target.parentElement;
        const qtyInput = parent.querySelector('.food-qty');
        if (qtyInput) qtyInput.focus();
    }
}

function handleQtyEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        calculateTotal(event.target);
        const addButton = document.querySelector('.secondary-btn[onclick="addBillItem()"]');
        if (addButton) addButton.click();
    }
}

function generateQR() {
    console.log("Generate QR & Receipt button clicked");
    try {
        currentBill.items = [];
        const billItems = document.querySelectorAll('.bill-item');
        console.log(`Found ${billItems.length} bill items`);
        billItems.forEach((item, index) => {
            console.log(`Processing bill item ${index + 1}`);
            const id = item.querySelector('.food-id')?.value || '';
            const name = item.querySelector('.food-name')?.value || '';
            const price = parseInt(item.querySelector('.food-price')?.value || '0');
            const qty = parseInt(item.querySelector('.food-qty')?.value || '0');
            const total = parseInt(item.querySelector('.food-total')?.value || '0');
            
            if (id && name && !isNaN(price) && !isNaN(qty) && !isNaN(total)) {
                currentBill.items.push({ id, name, price, qty, total });
            } else {
                console.warn(`Invalid data in bill item ${index + 1}: id=${id}, name=${name}, price=${price}, qty=${qty}, total=${total}`);
            }
        });

        if (currentBill.items.length === 0) {
            alert('Please add at least one item to the bill.');
            console.log("No valid items added to bill, aborting");
            return;
        }

        const grandTotalElement = document.getElementById('grand-total');
        if (!grandTotalElement) throw new Error("Grand total element not found");
        currentBill.total = parseInt(grandTotalElement.textContent) || 0;

        const paymentMethodElement = document.getElementById('payment-method');
        if (!paymentMethodElement) throw new Error("Payment method element not found");
        currentBill.paymentMethod = paymentMethodElement.value;

        const customerNameElement = document.getElementById('customer-name');
        if (!customerNameElement) throw new Error("Customer name element not found");
        currentBill.customerName = customerNameElement.value.trim() || 'Walk-in';
        
        console.log("Current bill:", currentBill);

        try {
            generateReceipt();
        } catch (receiptError) {
            console.error(`Error generating receipt: ${receiptError.message}`);
        }

        try {
            autoFillQRGeneratorFromBill();
        } catch (qrError) {
            console.error(`Error auto-filling QR generator: ${qrError.message}`);
        }

        console.log("Switching to QR Generator tab");
        openTab('qr-generator');
    } catch (error) {
        console.error(`Error in generateQR: ${error.message}`);
        alert("An error occurred while generating the QR and receipt. Please check the console for details.");
        console.log("Switching to QR Generator tab despite error");
        openTab('qr-generator');
    }
}

// Receipt Generation
function setupReceipt() {
    document.getElementById('receipt-shop-name').textContent = restaurantInfo.shopName;
    document.getElementById('receipt-address').textContent = restaurantInfo.address;
    document.getElementById('receipt-number').textContent = restaurantInfo.phone;
    document.getElementById('receipt-cashier').textContent = restaurantInfo.cashier;
}

function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('receipt-date').textContent = now.toLocaleDateString('en-US', options);
}

function generateReceipt() {
    console.log("Generating receipt");
    const billNoElement = document.getElementById('bill-no');
    if (!billNoElement) throw new Error("Bill number element not found");
    document.getElementById('receipt-bill-no').textContent = billNoElement.value || '0001';

    document.getElementById('receipt-customer').textContent = currentBill.customerName;
    updateCurrentDate();
    
    const receiptTable = document.getElementById('receipt-items');
    if (!receiptTable) throw new Error("Receipt items table not found");
    receiptTable.innerHTML = '';
    
    currentBill.items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.qty}pcs</td>
            <td>₹${item.total}</td>
        `;
        receiptTable.appendChild(tr);
    });
    
    document.getElementById('receipt-total').textContent = `₹${currentBill.total}`;
    document.getElementById('receipt-payment-method').textContent = currentBill.paymentMethod;
}

function printReceipt() {
    const receipt = document.getElementById('receipt');
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write('<html><head><title>Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 20px; 
        }
        .receipt { 
            width: 300px; 
            margin: 0 auto; 
            padding: 20px; 
            border: 1px solid #ddd; 
        }
        .receipt-header { 
            text-align: center; 
            margin-bottom: 15px; 
        }
        .receipt-header h1 { 
            margin: 5px 0; 
            font-size: 1.5em; 
        }
        .receipt-divider { 
            text-align: center; 
            margin: 10px 0; 
            letter-spacing: 3px; 
        }
        .receipt-table { 
            width: 100%; 
            margin: 15px 0; 
        }
        .receipt-table td { 
            padding: 5px 0; 
        }
        .receipt-table td:last-child { 
            text-align: right; 
        }
        .receipt-total { 
            margin-top: 10px; 
            padding-top: 10px; 
            border-top: 2px dashed #6c757d; 
            font-weight: bold; 
            color: #4361ee; 
            text-align: right;
        }
        .payment-method { 
            margin: 5px 0; 
            text-align: right; 
            color: #6c757d; 
        }
        .qr-container { 
            margin: 15px auto; 
            text-align: center; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
        }
        .qr-container canvas { 
            width: 150px; 
            height: 150px; 
        }
        .qr-caption { 
            font-size: 0.8rem; 
            color: #6c757d; 
            margin-top: 5px; 
        }
        .thank-you { 
            text-align: center; 
            font-weight: bold; 
            margin-top: 15px; 
            font-size: 1.2rem; 
        }
        .return-policy { 
            font-size: 0.8rem; 
            color: #6c757d; 
            text-align: center; 
        }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(receipt.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// QR Generator Functionality
function initializeQRGenerator() {
    const fieldContainer = document.getElementById("field-container");
    const messageInput = document.getElementById("message");
    const passwordInput = document.getElementById("password");
    const dataSourceSelect = document.getElementById("data-source");
    const encryptBtn = document.getElementById("encrypt-btn");
    const resetBtn = document.getElementById("reset-btn");
    const downloadBtn = document.getElementById("download-btn");
    const copyTextBtn = document.getElementById("copy-text-btn");
    const encryptedOutput = document.getElementById("encrypted-output");
    const qrcodeContainer = document.getElementById("qrcode");
    
    let encryptedData = "";

    if (!fieldContainer || !messageInput || !passwordInput || !dataSourceSelect || 
        !encryptBtn || !resetBtn || !downloadBtn || !copyTextBtn || !encryptedOutput || !qrcodeContainer) {
        console.error("One or more QR Generator elements not found");
        return;
    }

    addHeaderFields();

    encryptBtn.addEventListener("click", () => {
        console.log("Generate QR clicked");
        generateEncryptedQR();
    });
    resetBtn.addEventListener("click", resetForm);
    downloadBtn.addEventListener("click", downloadQR);
    copyTextBtn.addEventListener("click", copyEncryptedText);
    dataSourceSelect.addEventListener("change", toggleDataSource);

    function addHeaderFields() {
        const headers = ["ID", "name", "price/piece", "qty", "total price"];
        fieldContainer.innerHTML = '';
        headers.forEach((header) => {
            const fieldDiv = document.createElement("div");
            fieldDiv.className = "data-field header-field";
            const fieldInput = document.createElement("input");
            fieldInput.type = "text";
            fieldInput.className = "field-input";
            fieldInput.value = header;
            fieldInput.readOnly = true;
            fieldDiv.appendChild(fieldInput);
            fieldContainer.appendChild(fieldDiv);
        });
    }
}

function toggleDataSource() {
    const dataSourceSelect = document.getElementById("data-source");
    const messageInput = document.getElementById("message");
    if (!dataSourceSelect || !messageInput) {
        console.error("Data source or message input not found");
        return;
    }
    const isManual = dataSourceSelect.value === "manual";
    messageInput.readOnly = !isManual;
    console.log("Data source toggled to:", isManual ? "manual" : "auto");
    if (isManual) {
        document.querySelectorAll(".data-field:not(.header-field)").forEach(field => field.remove());
    } else if (currentBill.items.length > 0) {
        displayBillItems();
    }
}

async function generateEncryptedQR() {
    const messageInput = document.getElementById("message");
    const passwordInput = document.getElementById("password");
    const encryptedOutput = document.getElementById("encrypted-output");
    const qrcodeContainer = document.getElementById("qrcode");
    const downloadBtn = document.getElementById("download-btn");
    const copyTextBtn = document.getElementById("copy-text-btn");
    let encryptedData = "";

    const isManual = document.getElementById("data-source").value === "manual";
    const password = passwordInput.value.trim();
    console.log("Generating QR, Mode:", isManual ? "manual" : "auto", "Password:", password);

    if (!password) {
        showError("Please enter an encryption password");
        return;
    }

    let message = messageInput.value.trim();
    if (!message) {
        showError("Please enter bill information");
        return;
    }

    let dataString = "";
    if (!isManual) {
        if (!currentBill.items.length) {
            showError("Please create a bill first in the Backend Bill section");
            return;
        }

        let column1 = [], column2 = [], column3 = [], column4 = [], column5 = [];
        currentBill.items.forEach(item => {
            column1.push(item.id);
            column2.push(item.name);
            column3.push(item.price);
            column4.push(item.qty);
            column5.push(item.total);
        });

        dataString = [
            column1.join(' '),
            column2.join(' '),
            column3.join(' '),
            column4.join(' '),
            column5.join(' ')
        ].join(',');
        console.log("Item data string:", dataString);
    }

    try {
        const encryptedMessage = await encryptMessage(message, password);
        const finalData = isManual ? encryptedMessage : `${dataString}|${encryptedMessage}`;
        encryptedData = finalData;
        encryptedOutput.value = finalData;
        console.log("Encrypted data:", finalData);

        generateQRCodeForTab(finalData);
        generateQRCodeForCustomer(finalData);
        downloadBtn.disabled = false;
        copyTextBtn.disabled = false;
        showSuccess(`QR code generated successfully from ${isManual ? 'manual' : 'bill'} data!`);
        openTab('customer-bill');
    } catch (error) {
        console.error("QR Generation error:", error);
        showError("Operation failed: " + error.message);
    }
}

function generateQRCodeForTab(data) {
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = "";
    if (typeof QRCode === "undefined") {
        console.error("QRCode library not loaded");
        showError("QR Code library not available");
        return;
    }
    new QRCode(qrcodeContainer, {
        text: data,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    console.log("QR Code generated for tab");
}

function generateQRCodeForCustomer(data) {
    const qrCodeCustomer = document.getElementById("qr-code");
    qrCodeCustomer.innerHTML = "";
    if (typeof QRCode === "undefined") {
        console.error("QRCode library not loaded");
        showError("QR Code library not available");
        return;
    }
    new QRCode(qrCodeCustomer, {
        text: data,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    const caption = document.createElement("div");
    caption.textContent = "Scan for bill details";
    caption.className = "qr-caption";
    qrCodeCustomer.appendChild(caption);
    console.log("QR Code generated for customer");
}

async function encryptMessage(message, password) {
    try {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-CBC", length: 256 },
            true,
            ["encrypt"]
        );
        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: iv
            },
            key,
            encoder.encode(message)
        );
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        return btoa(String.fromCharCode.apply(null, combined));
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Encryption failed - " + error.message);
    }
}

function downloadQR() {
    const canvas = document.getElementById("qrcode").querySelector("canvas");
    if (!canvas) {
        showError("No QR code available to download");
        return;
    }
    const link = document.createElement("a");
    link.download = "secure-qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function copyEncryptedText() {
    const encryptedOutput = document.getElementById("encrypted-output");
    if (!encryptedOutput.value) {
        showError("No encrypted data available to copy");
        return;
    }
    navigator.clipboard.writeText(encryptedOutput.value)
        .then(() => showSuccess("Encrypted data copied to clipboard!"))
        .catch(err => showError("Failed to copy: " + err));
}

function resetForm() {
    const messageInput = document.getElementById("message");
    const passwordInput = document.getElementById("password");
    const encryptedOutput = document.getElementById("encrypted-output");
    const qrcodeContainer = document.getElementById("qrcode");
    const downloadBtn = document.getElementById("download-btn");
    const copyTextBtn = document.getElementById("copy-text-btn");
    const dataSourceSelect = document.getElementById("data-source");

    messageInput.value = "";
    passwordInput.value = "";
    encryptedOutput.value = "";
    qrcodeContainer.innerHTML = "";
    downloadBtn.disabled = true;
    copyTextBtn.disabled = true;
    dataSourceSelect.value = "auto";
    toggleDataSource();
}

// Updated global functions
function autoFillQRGeneratorFromBill() {
    console.log("Auto-filling QR Generator from bill");
    if (currentBill.items.length === 0) {
        showError("No bill data available");
        return;
    }
    
    const messageInput = document.getElementById("message");
    const qrcodeContainer = document.getElementById("qrcode");
    if (!messageInput || !qrcodeContainer) {
        throw new Error("QR Generator elements missing");
    }

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    messageInput.value = `[${currentBill.total}] [${dateStr}] [${timeStr}]`;
    messageInput.readOnly = false; // Allow manual editing
    displayBillItems(); // Auto-fill item details
    qrcodeContainer.innerHTML = "<p style='text-align: center;'>Enter a password and click 'Generate Secure QR' to create the QR code.</p>";
}

function displayBillItems() {
    const fieldContainer = document.getElementById("field-container");
    if (!fieldContainer) {
        console.error("Field container not found");
        return;
    }
    document.querySelectorAll(".data-field:not(.header-field)").forEach(field => field.remove());
    
    currentBill.items.forEach(item => {
        const fields = [item.id, item.name, item.price, item.qty.toString(), item.total];
        fields.forEach(value => {
            const fieldDiv = document.createElement("div");
            fieldDiv.className = "data-field";
            const fieldInput = document.createElement("input");
            fieldInput.type = "text";
            fieldInput.className = "field-input";
            fieldInput.value = value;
            fieldInput.readOnly = true;
            fieldDiv.appendChild(fieldInput);
            fieldContainer.appendChild(fieldDiv);
        });
    });
}

function toggleDataSource() {
    const dataSourceSelect = document.getElementById("data-source");
    const messageInput = document.getElementById("message");
    if (!dataSourceSelect || !messageInput) {
        console.error("Data source or message input not found");
        return;
    }
    const isManual = dataSourceSelect.value === "manual";
    messageInput.readOnly = !isManual;
    console.log("Data source toggled to:", isManual ? "manual" : "auto");
    if (isManual) {
        document.querySelectorAll(".data-field:not(.header-field)").forEach(field => field.remove());
    } else if (currentBill.items.length > 0) {
        displayBillItems();
    }
}

function showSuccess(message) {
    updateStatus(message, "success");
}

function showError(message) {
    updateStatus(message, "error");
}

function updateStatus(message, type) {
    const existing = document.querySelector(".status-message");
    if (existing) existing.remove();
    const div = document.createElement("div");
    div.className = `status-message ${type}`;
    div.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i> ${message}`;
    document.querySelector(".creator-section").prepend(div);
}
