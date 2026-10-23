// Admin Data Management Script

// Admin password (should match the one in login.html)
const ADMIN_PASSWORD = 'Admin@123';

// Flag to determine data source (SharePoint or localStorage)
const USE_SHAREPOINT = true;

// Initialize data from localStorage or use default data
let adminData = {
    items: [],
    customers: [],
    bookingData: {},
    shippingData: {},
    currentSpikeData: [],
    previousSpikeData: [],
    regions: ['South West', 'North East', 'North West', 'South East', 'Central'],
    submissionWindowOpen: false, // Flag to control user submission access
    submissionWindowOpenTime: null, // Date/time when window was opened
    submissionWindowCloseTime: null, // Date/time when window was closed
    scheduledAutoCloseTime: null // Date/time when window should auto-close
};

let currentClearSection = '';

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    initializeTabs();
    initializeForms();
    loadAllData();
});

// Load admin data from SharePoint or localStorage
async function loadAdminData() {
    if (USE_SHAREPOINT) {
        try {
            console.log('Loading data from SharePoint...');
            await loadAdminDataFromSharePoint();
        } catch (error) {
            console.error('SharePoint loading failed, falling back to localStorage:', error);
            alert('Could not connect to SharePoint. Using local storage instead.');
            loadAdminDataFromLocalStorage();
        }
    } else {
        console.log('Using localStorage (SharePoint disabled)');
        loadAdminDataFromLocalStorage();
    }
}

async function loadAdminDataFromSharePoint() {
    try {
        // Load all data from SharePoint lists
        const items = await getItems();
        const customers = await getCustomers();
        const bookingItems = await getListItems(SHAREPOINT_LISTS.bookingData);
        const shippingItems = await getListItems(SHAREPOINT_LISTS.shippingData);
        const spikeItems = await getListItems(SHAREPOINT_LISTS.spikeData);
        
        // Convert booking data to nested structure
        const bookingData = {};
        bookingItems.forEach(item => {
            if (!bookingData[item.CustomerCode]) {
                bookingData[item.CustomerCode] = {};
            }
            bookingData[item.CustomerCode][item.ItemID] = item.AverageBooking;
        });
        
        // Convert shipping data to nested structure
        const shippingData = {};
        shippingItems.forEach(item => {
            if (!shippingData[item.CustomerCode]) {
                shippingData[item.CustomerCode] = {};
            }
            shippingData[item.CustomerCode][item.ItemID] = item.AverageShipping;
        });
        
        // Convert SharePoint items to app format
        const formattedItems = items.map(item => ({
            itemID: item.ItemID,
            description: item.Description,
            grade: item.Grade
        }));
        
        const formattedCustomers = customers.map(customer => ({
            code: customer.CustomerCode,
            name: customer.CustomerName,
            region: customer.Region
        }));
        
        const formattedSpikeData = spikeItems.map(spike => ({
            customer: spike.CustomerCode,
            itemID: spike.ItemID,
            month1: spike.Month1,
            month2: spike.Month2,
            month3: spike.Month3,
            submitDate: spike.SubmitDate,
            userName: spike.UserName
        }));
        
        // Split into current and previous based on whether moved date exists
        const currentSpikeData = formattedSpikeData.filter(spike => !spike.movedDate);
        const previousSpikeData = formattedSpikeData.filter(spike => spike.movedDate);
        
        // Load submission window control data from a separate SharePoint list or use localStorage
        const localControlData = JSON.parse(localStorage.getItem('inventoryAdminData') || '{}');
        
        adminData = {
            items: formattedItems,
            customers: formattedCustomers,
            bookingData: bookingData,
            shippingData: shippingData,
            currentSpikeData: currentSpikeData,
            previousSpikeData: previousSpikeData,
            regions: ['South West', 'North East', 'North West', 'South East', 'Central'],
            submissionWindowOpen: localControlData.submissionWindowOpen || false,
            submissionWindowOpenTime: localControlData.submissionWindowOpenTime || null,
            submissionWindowCloseTime: localControlData.submissionWindowCloseTime || null,
            scheduledAutoCloseTime: localControlData.scheduledAutoCloseTime || null
        };
        
        console.log('Data loaded from SharePoint successfully');
        console.log('Items:', adminData.items.length);
        console.log('Customers:', adminData.customers.length);
        console.log('Current spike data:', adminData.currentSpikeData.length);
        console.log('Previous spike data:', adminData.previousSpikeData.length);
        
    } catch (error) {
        console.error('Error loading from SharePoint:', error);
        throw error;
    }
}

function loadAdminDataFromLocalStorage() {
    const storedData = localStorage.getItem('inventoryAdminData');
    console.log('Loading admin data from localStorage. Exists:', !!storedData);
    
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Parsed admin data:', parsedData);
        console.log('Current spike data in storage:', parsedData.currentSpikeData);
        console.log('Previous spike data in storage:', parsedData.previousSpikeData);
        
        // Migrate old spikeData to currentSpikeData if needed
        if (parsedData.spikeData && !parsedData.currentSpikeData) {
            console.log('Migrating old spikeData to currentSpikeData');
            parsedData.currentSpikeData = parsedData.spikeData;
            parsedData.previousSpikeData = [];
            delete parsedData.spikeData;
            // Save the migrated data
            localStorage.setItem('inventoryAdminData', JSON.stringify(parsedData));
            console.log('Migration complete and saved');
        }
        
        // Merge with existing structure to preserve all data
        adminData = {
            items: parsedData.items || [],
            customers: parsedData.customers || [],
            bookingData: parsedData.bookingData || {},
            shippingData: parsedData.shippingData || {},
            currentSpikeData: parsedData.currentSpikeData || [],
            previousSpikeData: parsedData.previousSpikeData || [],
            regions: parsedData.regions || ['South West', 'North East', 'North West', 'South East', 'Central'],
            submissionWindowOpen: parsedData.submissionWindowOpen || false,
            submissionWindowOpenTime: parsedData.submissionWindowOpenTime || null,
            submissionWindowCloseTime: parsedData.submissionWindowCloseTime || null,
            scheduledAutoCloseTime: parsedData.scheduledAutoCloseTime || null
        };
        console.log('Admin data loaded successfully');
        console.log('Current spike data count:', adminData.currentSpikeData.length);
        console.log('Previous spike data count:', adminData.previousSpikeData.length);
        console.log('Submission window status:', adminData.submissionWindowOpen);
    } else {
        console.log('No admin data found, initializing with sample data');
        // Initialize with sample data if no data exists
        initializeSampleData();
    }
}

// Initialize sample data for first-time users
function initializeSampleData() {
    adminData.items = [
        { itemID: 'ITM001', description: 'Steel Sheet 5mm', grade: 'A' },
        { itemID: 'ITM002', description: 'Steel Sheet 10mm', grade: 'B' },
        { itemID: 'ITM003', description: 'Aluminum Plate 3mm', grade: 'A' },
        { itemID: 'ITM004', description: 'Copper Wire 2mm', grade: 'C' },
        { itemID: 'ITM005', description: 'Steel Rod 20mm', grade: 'A' }
    ];

    adminData.customers = [
        { code: 'CUST001', name: 'ABC Manufacturing', region: 'South West' },
        { code: 'CUST002', name: 'XYZ Industries', region: 'North East' },
        { code: 'CUST003', name: 'Global Corp', region: 'South West' },
        { code: 'CUST004', name: 'Local Metals Ltd', region: 'North East' }
    ];

    adminData.bookingData = {
        'CUST001': { 'ITM001': 150, 'ITM002': 200, 'ITM003': 100, 'ITM004': 75, 'ITM005': 180 },
        'CUST002': { 'ITM001': 120, 'ITM002': 180, 'ITM003': 80, 'ITM004': 60, 'ITM005': 150 },
        'CUST003': { 'ITM001': 200, 'ITM002': 250, 'ITM003': 120, 'ITM004': 90, 'ITM005': 220 },
        'CUST004': { 'ITM001': 180, 'ITM002': 220, 'ITM003': 110, 'ITM004': 85, 'ITM005': 200 }
    };

    adminData.shippingData = {
        'CUST001': { 'ITM001': 140, 'ITM002': 190, 'ITM003': 95, 'ITM004': 70, 'ITM005': 170 },
        'CUST002': { 'ITM001': 115, 'ITM002': 175, 'ITM003': 75, 'ITM004': 55, 'ITM005': 145 },
        'CUST003': { 'ITM001': 190, 'ITM002': 240, 'ITM003': 115, 'ITM004': 85, 'ITM005': 210 },
        'CUST004': { 'ITM001': 170, 'ITM002': 210, 'ITM003': 100, 'ITM004': 80, 'ITM005': 190 }
    };

    adminData.currentSpikeData = [
        { customer: 'CUST001', itemID: 'ITM001', month1: 25, month2: 30, month3: 20, submitDate: '2026-09-15', userName: 'John Doe' },
        { customer: 'CUST001', itemID: 'ITM002', month1: 35, month2: 40, month3: 30, submitDate: '2026-09-16', userName: 'Jane Smith' }
    ];
    
    adminData.previousSpikeData = [];

    saveAdminData();
}

// Save admin data to SharePoint or localStorage
async function saveAdminData() {
    if (USE_SHAREPOINT) {
        try {
            await saveAdminDataToSharePoint();
        } catch (error) {
            console.error('SharePoint save failed, using localStorage fallback:', error);
            saveAdminDataToLocalStorage();
            alert('Could not save to SharePoint. Data saved locally instead.');
        }
    } else {
        saveAdminDataToLocalStorage();
    }
}

async function saveAdminDataToSharePoint() {
    // Save control data (submission window status) to localStorage only
    const controlData = {
        submissionWindowOpen: adminData.submissionWindowOpen,
        submissionWindowOpenTime: adminData.submissionWindowOpenTime,
        submissionWindowCloseTime: adminData.submissionWindowCloseTime,
        scheduledAutoCloseTime: adminData.scheduledAutoCloseTime
    };
    localStorage.setItem('inventoryAdminData', JSON.stringify(controlData));
    
    console.log('Control data saved to localStorage (submission window status)');
    console.log('Data is persisted in SharePoint lists');
}

function saveAdminDataToLocalStorage() {
    // Ensure complete data structure is saved
    const dataToSave = {
        items: adminData.items || [],
        customers: adminData.customers || [],
        bookingData: adminData.bookingData || {},
        shippingData: adminData.shippingData || {},
        currentSpikeData: adminData.currentSpikeData || [],
        previousSpikeData: adminData.previousSpikeData || [],
        regions: adminData.regions || ['South West', 'North East', 'North West', 'South East', 'Central'],
        submissionWindowOpen: adminData.submissionWindowOpen || false,
        submissionWindowOpenTime: adminData.submissionWindowOpenTime || null,
        submissionWindowCloseTime: adminData.submissionWindowCloseTime || null,
        scheduledAutoCloseTime: adminData.scheduledAutoCloseTime || null
    };
    
    localStorage.setItem('inventoryAdminData', JSON.stringify(dataToSave));
    console.log('Admin data saved to localStorage');
}

// Initialize tab navigation
function initializeTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // Remove active class from all buttons and contents
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Initialize form handlers
function initializeForms() {
    // Item form
    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);
    
    // Customer form
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);
    
    // Booking form
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
    
    // Shipping form
    document.getElementById('shipping-form').addEventListener('submit', handleShippingSubmit);
    
    // Current spike filter change handler
    const currentSpikeFilter = document.getElementById('current-spike-customer-filter');
    if (currentSpikeFilter) {
        currentSpikeFilter.addEventListener('change', loadCurrentSpikeData);
    }
    
    // Previous spike filter change handler
    const previousSpikeFilter = document.getElementById('previous-spike-customer-filter');
    if (previousSpikeFilter) {
        previousSpikeFilter.addEventListener('change', loadPreviousSpikeData);
    }
}

// Load all data into tables
function loadAllData() {
    loadItems();
    loadCustomers();
    loadBookingData();
    loadShippingData();
    loadCurrentSpikeData();
    loadPreviousSpikeData();
    loadSubmissionControl();
    populateDropdowns();
}

// Start auto-close check when admin panel loads
window.addEventListener('load', function() {
    // Set minimum date for auto-close date picker to today
    const dateInput = document.getElementById('auto-close-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    if (adminData.scheduledAutoCloseTime) {
        startAutoCloseCheck();
    }
});

// Stop auto-close check when admin panel unloads
window.addEventListener('beforeunload', function() {
    stopAutoCloseCheck();
});

// ==================== ITEMS MANAGEMENT ====================

function loadItems() {
    const tableBody = document.getElementById('items-table-body');
    tableBody.innerHTML = '';

    if (adminData.items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <div class="empty-state-text">No items found. Add your first item!</div>
                </td>
            </tr>
        `;
        return;
    }

    adminData.items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.itemID}</td>
            <td>${item.description}</td>
            <td>${item.grade}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editItem(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteItem(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openItemModal(index = -1) {
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('item-modal-title');
    const editIndex = document.getElementById('item-edit-index');
    const itemId = document.getElementById('item-id');
    const itemDescription = document.getElementById('item-description');
    const itemGrade = document.getElementById('item-grade');

    if (index >= 0) {
        const item = adminData.items[index];
        title.textContent = 'Edit Item';
        editIndex.value = index;
        itemId.value = item.itemID;
        itemDescription.value = item.description;
        itemGrade.value = item.grade;
        itemId.disabled = true; // Don't allow editing ItemID
    } else {
        title.textContent = 'Add New Item';
        editIndex.value = -1;
        itemId.value = '';
        itemDescription.value = '';
        itemGrade.value = '';
        itemId.disabled = false;
    }

    modal.style.display = 'block';
}

function editItem(index) {
    openItemModal(index);
}

async function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            if (USE_SHAREPOINT && adminData.items[index].Id) {
                await deleteItemFromSharePoint(SHAREPOINT_LISTS.items, adminData.items[index].Id);
            }
            adminData.items.splice(index, 1);
            await saveAdminData();
            loadItems();
            populateDropdowns();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item. Please try again.');
        }
    }
}

async function handleItemSubmit(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('item-edit-index').value);
    const itemID = document.getElementById('item-id').value.trim();
    const description = document.getElementById('item-description').value.trim();
    const grade = document.getElementById('item-grade').value;

    // Check for duplicate ItemID
    if (editIndex === -1 && adminData.items.some(item => item.itemID === itemID)) {
        alert('ItemID already exists!');
        return;
    }

    const itemData = { itemID, description, grade };

    try {
        if (USE_SHAREPOINT) {
            if (editIndex >= 0) {
                // Update existing item in SharePoint
                const existingItem = adminData.items[editIndex];
                await updateItem(existingItem.Id, itemData);
            } else {
                // Add new item to SharePoint
                const newId = await addItem(itemData);
                itemData.Id = newId; // Store SharePoint ID
            }
        }

        if (editIndex >= 0) {
            adminData.items[editIndex] = itemData;
        } else {
            adminData.items.push(itemData);
        }

        await saveAdminData();
        loadItems();
        populateDropdowns();
        closeModal('item-modal');
        document.getElementById('item-form').reset();
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    }
}

// ==================== CUSTOMERS MANAGEMENT ====================

function loadCustomers() {
    const tableBody = document.getElementById('customers-table-body');
    tableBody.innerHTML = '';

    if (adminData.customers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">No customers found. Add your first customer!</div>
                </td>
            </tr>
        `;
        return;
    }

    adminData.customers.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.region || '-'}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editCustomer(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteCustomer(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openCustomerModal(index = -1) {
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('customer-modal-title');
    const editIndex = document.getElementById('customer-edit-index');
    const customerCode = document.getElementById('customer-code');
    const customerName = document.getElementById('customer-name');
    const customerRegion = document.getElementById('customer-region');

    if (index >= 0) {
        const customer = adminData.customers[index];
        title.textContent = 'Edit Customer';
        editIndex.value = index;
        customerCode.value = customer.code;
        customerName.value = customer.name;
        customerRegion.value = customer.region || '';
        customerCode.disabled = true; // Don't allow editing customer code
    } else {
        title.textContent = 'Add New Customer';
        editIndex.value = -1;
        customerCode.value = '';
        customerName.value = '';
        customerRegion.value = '';
        customerCode.disabled = false;
    }

    modal.style.display = 'block';
}

function editCustomer(index) {
    openCustomerModal(index);
}

function deleteCustomer(index) {
    if (confirm('Are you sure you want to delete this customer?')) {
        adminData.customers.splice(index, 1);
        saveAdminData();
        loadCustomers();
        populateDropdowns();
    }
}

function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('customer-edit-index').value);
    const code = document.getElementById('customer-code').value.trim();
    const name = document.getElementById('customer-name').value.trim();
    const region = document.getElementById('customer-region').value;

    // Check for duplicate customer code
    if (editIndex === -1 && adminData.customers.some(customer => customer.code === code)) {
        alert('Customer code already exists!');
        return;
    }

    const customerData = { code, name, region };

    if (editIndex >= 0) {
        adminData.customers[editIndex] = customerData;
    } else {
        adminData.customers.push(customerData);
    }

    saveAdminData();
    loadCustomers();
    populateDropdowns();
    closeModal('customer-modal');
    document.getElementById('customer-form').reset();
}

// ==================== BOOKING DATA MANAGEMENT ====================

async function loadBookingData() {
    if (USE_SHAREPOINT) {
        try {
            adminData.bookingData = await getBookingData();
        } catch (error) {
            console.error('Error loading booking data from SharePoint:', error);
            alert('Error loading booking data. Using cached data.');
        }
    }
    
    const tableBody = document.getElementById('booking-table-body');
    tableBody.innerHTML = '';

    let hasData = false;

    Object.entries(adminData.bookingData).forEach(([customerCode, items]) => {
        const customer = adminData.customers.find(c => c.code === customerCode);
        const customerName = customer ? customer.name : customerCode;
        const customerRegion = customer ? customer.region : '-';
        
        Object.entries(items).forEach(([itemID, value]) => {
            hasData = true;
            const item = adminData.items.find(i => i.itemID === itemID);
            const itemDescription = item ? item.description : 'Unknown';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customerName} (${customerCode})</td>
                <td>${customerRegion}</td>
                <td>${itemID}</td>
                <td>${itemDescription}</td>
                <td>${value}</td>
                <td class="actions">
                    <button class="action-btn edit-btn" onclick="editBookingData('${customerCode}', '${itemID}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteBookingData('${customerCode}', '${itemID}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });

    if (!hasData) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">No booking data found. Add your first booking data!</div>
                </td>
            </tr>
        `;
    }
}

function openBookingModal(customerCode = '', itemID = '', value = 0) {
    const modal = document.getElementById('booking-modal');
    const title = document.getElementById('booking-modal-title');
    const customerSelect = document.getElementById('booking-customer');
    const itemSelect = document.getElementById('booking-item');
    const valueInput = document.getElementById('booking-value');

    // Populate customer dropdown
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    adminData.customers.forEach(customer => {
        customerSelect.innerHTML += `<option value="${customer.code}">${customer.code} - ${customer.name}</option>`;
    });

    // Populate item dropdown
    itemSelect.innerHTML = '<option value="">Select Item</option>';
    adminData.items.forEach(item => {
        itemSelect.innerHTML += `<option value="${item.itemID}">${item.itemID} - ${item.description}</option>`;
    });

    if (customerCode && itemID) {
        title.textContent = 'Edit Booking Data';
        customerSelect.value = customerCode;
        itemSelect.value = itemID;
        valueInput.value = value;
    } else {
        title.textContent = 'Add Booking Data';
        customerSelect.value = '';
        itemSelect.value = '';
        valueInput.value = '';
    }

    modal.style.display = 'block';
}

function editBookingData(customerCode, itemID) {
    const value = adminData.bookingData[customerCode][itemID];
    openBookingModal(customerCode, itemID, value);
}

async function deleteBookingData(customerCode, itemID) {
    if (confirm('Are you sure you want to delete this booking data?')) {
        try {
            if (USE_SHAREPOINT) {
                await deleteBookingDataFromSharePoint(customerCode, itemID);
            }
            delete adminData.bookingData[customerCode][itemID];
            await saveAdminData();
            loadBookingData();
        } catch (error) {
            console.error('Error deleting booking data:', error);
            alert('Error deleting booking data. Please try again.');
        }
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const customerCode = document.getElementById('booking-customer').value;
    const itemID = document.getElementById('booking-item').value;
    const value = parseInt(document.getElementById('booking-value').value);

    if (!customerCode || !itemID) {
        alert('Please select both customer and item');
        return;
    }

    try {
        if (USE_SHAREPOINT) {
            await updateBookingData(customerCode, itemID, value);
        }

        if (!adminData.bookingData[customerCode]) {
            adminData.bookingData[customerCode] = {};
        }

        adminData.bookingData[customerCode][itemID] = value;

        await saveAdminData();
        loadBookingData();
        closeModal('booking-modal');
        document.getElementById('booking-form').reset();
    } catch (error) {
        console.error('Error saving booking data:', error);
        alert('Error saving booking data. Please try again.');
    }
}

// ==================== SHIPPING DATA MANAGEMENT ====================

async function loadShippingData() {
    if (USE_SHAREPOINT) {
        try {
            adminData.shippingData = await getShippingData();
        } catch (error) {
            console.error('Error loading shipping data from SharePoint:', error);
            alert('Error loading shipping data. Using cached data.');
        }
    }
    
    const tableBody = document.getElementById('shipping-table-body');
    tableBody.innerHTML = '';

    let hasData = false;

    Object.entries(adminData.shippingData).forEach(([customerCode, items]) => {
        const customer = adminData.customers.find(c => c.code === customerCode);
        const customerName = customer ? customer.name : customerCode;
        const customerRegion = customer ? customer.region : '-';
        
        Object.entries(items).forEach(([itemID, value]) => {
            hasData = true;
            const item = adminData.items.find(i => i.itemID === itemID);
            const itemDescription = item ? item.description : 'Unknown';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customerName} (${customerCode})</td>
                <td>${customerRegion}</td>
                <td>${itemID}</td>
                <td>${itemDescription}</td>
                <td>${value}</td>
                <td class="actions">
                    <button class="action-btn edit-btn" onclick="editShippingData('${customerCode}', '${itemID}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteShippingData('${customerCode}', '${itemID}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });

    if (!hasData) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">No shipping data found. Add your first shipping data!</div>
                </td>
            </tr>
        `;
    }
}

function openShippingModal(customerCode = '', itemID = '', value = 0) {
    const modal = document.getElementById('shipping-modal');
    const title = document.getElementById('shipping-modal-title');
    const customerSelect = document.getElementById('shipping-customer');
    const itemSelect = document.getElementById('shipping-item');
    const valueInput = document.getElementById('shipping-value');

    // Populate customer dropdown
    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    adminData.customers.forEach(customer => {
        customerSelect.innerHTML += `<option value="${customer.code}">${customer.code} - ${customer.name}</option>`;
    });

    // Populate item dropdown
    itemSelect.innerHTML = '<option value="">Select Item</option>';
    adminData.items.forEach(item => {
        itemSelect.innerHTML += `<option value="${item.itemID}">${item.itemID} - ${item.description}</option>`;
    });

    if (customerCode && itemID) {
        title.textContent = 'Edit Shipping Data';
        customerSelect.value = customerCode;
        itemSelect.value = itemID;
        valueInput.value = value;
    } else {
        title.textContent = 'Add Shipping Data';
        customerSelect.value = '';
        itemSelect.value = '';
        valueInput.value = '';
    }

    modal.style.display = 'block';
}

function editShippingData(customerCode, itemID) {
    const value = adminData.shippingData[customerCode][itemID];
    openShippingModal(customerCode, itemID, value);
}

async function deleteShippingData(customerCode, itemID) {
    if (confirm('Are you sure you want to delete this shipping data?')) {
        try {
            if (USE_SHAREPOINT) {
                await deleteShippingDataFromSharePoint(customerCode, itemID);
            }
            delete adminData.shippingData[customerCode][itemID];
            await saveAdminData();
            loadShippingData();
        } catch (error) {
            console.error('Error deleting shipping data:', error);
            alert('Error deleting shipping data. Please try again.');
        }
    }
}

async function handleShippingSubmit(e) {
    e.preventDefault();
    
    const customerCode = document.getElementById('shipping-customer').value;
    const itemID = document.getElementById('shipping-item').value;
    const value = parseInt(document.getElementById('shipping-value').value);

    if (!customerCode || !itemID) {
        alert('Please select both customer and item');
        return;
    }

    try {
        if (USE_SHAREPOINT) {
            await updateShippingData(customerCode, itemID, value);
        }

        if (!adminData.shippingData[customerCode]) {
            adminData.shippingData[customerCode] = {};
        }

        adminData.shippingData[customerCode][itemID] = value;

        await saveAdminData();
        loadShippingData();
        closeModal('shipping-modal');
        document.getElementById('shipping-form').reset();
    } catch (error) {
        console.error('Error saving shipping data:', error);
        alert('Error saving shipping data. Please try again.');
    }
}

// ==================== CURRENT SPIKE DATA MANAGEMENT (READ-ONLY) ====================

function loadCurrentSpikeData() {
    const tableBody = document.getElementById('current-spike-table-body');
    const customerFilter = document.getElementById('current-spike-customer-filter').value;
    
    tableBody.innerHTML = '';

    let filteredData = adminData.currentSpikeData;
    if (customerFilter) {
        filteredData = adminData.currentSpikeData.filter(spike => spike.customer === customerFilter);
    }

    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-state">
                    <div class="empty-state-icon">📈</div>
                    <div class="empty-state-text">No current spike data found. Data is entered by users via the Entry Page.</div>
                </td>
            </tr>
        `;
        return;
    }

    filteredData.forEach((spike, index) => {
        const row = document.createElement('tr');
        const customer = adminData.customers.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : spike.customer;
        const customerRegion = customer ? customer.region : '-';
        const item = adminData.items.find(i => i.itemID === spike.itemID);
        const itemDescription = item ? item.description : 'Unknown';
        const itemGrade = item ? item.grade : '-';
        const totalSpike = (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0);
        
        row.innerHTML = `
            <td><input type="checkbox" class="spike-checkbox" data-index="${index}"></td>
            <td>${customerName} (${spike.customer})</td>
            <td>${customerRegion}</td>
            <td>${spike.itemID}</td>
            <td>${itemDescription}</td>
            <td>${itemGrade}</td>
            <td>${spike.month1 || 0}</td>
            <td>${spike.month2 || 0}</td>
            <td>${spike.month3 || 0}</td>
            <td>${totalSpike}</td>
            <td>${spike.submitDate || '-'}</td>
            <td>${spike.userName || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function refreshCurrentSpikeData() {
    console.log('=== REFRESHING CURRENT SPIKE DATA ===');
    loadAdminData();
    loadCurrentSpikeData();
    console.log('Current spike data refreshed. Total entries:', adminData.currentSpikeData.length);
    console.log('=== REFRESH COMPLETE ===');
}

function toggleAllCurrentSpike() {
    const selectAllCheckbox = document.getElementById('select-all-current-spike');
    const checkboxes = document.querySelectorAll('.spike-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function sendToPreviousSpikeData() {
    const selectedCheckboxes = document.querySelectorAll('.spike-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one spike data entry to move to previous data.');
        return;
    }
    
    if (!confirm(`Are you sure you want to move ${selectedCheckboxes.length} spike data entries to Previous Spike Data?`)) {
        return;
    }
    
    const movedDate = new Date().toISOString().split('T')[0];
    const movedEntries = [];
    
    selectedCheckboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        const spikeData = adminData.currentSpikeData[index];
        
        // Add moved date and move to previous
        spikeData.movedDate = movedDate;
        adminData.previousSpikeData.push(spikeData);
        movedEntries.push(spikeData);
    });
    
    // Remove moved entries from current data (in reverse order to maintain indices)
    const indicesToRemove = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
    indicesToRemove.forEach(index => {
        adminData.currentSpikeData.splice(index, 1);
    });
    
    saveAdminData();
    loadCurrentSpikeData();
    loadPreviousSpikeData();
    
    alert(`Successfully moved ${movedEntries.length} spike data entries to Previous Spike Data.`);
}

function exportCurrentSpikeDataToExcel() {
    if (adminData.currentSpikeData.length === 0) {
        alert('No current spike data available to export.');
        return;
    }

    let csvContent = 'Customer,Customer Name,Region,Item ID,Description,Grade,Month 1,Month 2,Month 3,Total Spike,Submit Date,User Name\n';

    adminData.currentSpikeData.forEach(spike => {
        const customer = adminData.customers.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : 'Unknown';
        const customerRegion = customer ? customer.region : 'Unknown';
        const item = adminData.items.find(i => i.itemID === spike.itemID);
        const itemDescription = item ? item.description : 'Unknown';
        const itemGrade = item ? item.grade : 'Unknown';
        const totalSpike = (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0);

        csvContent += `${spike.customer},"${customerName}","${customerRegion}",${spike.itemID},"${itemDescription}","${itemGrade}",${spike.month1 || 0},${spike.month2 || 0},${spike.month3 || 0},${totalSpike},${spike.submitDate || '-'},${spike.userName || '-'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `current_spike_data_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Current spike data exported successfully');
}

// ==================== PREVIOUS SPIKE DATA MANAGEMENT (READ-ONLY) ====================

function loadPreviousSpikeData() {
    const tableBody = document.getElementById('previous-spike-table-body');
    const customerFilter = document.getElementById('previous-spike-customer-filter').value;
    
    tableBody.innerHTML = '';

    let filteredData = adminData.previousSpikeData;
    if (customerFilter) {
        filteredData = adminData.previousSpikeData.filter(spike => spike.customer === customerFilter);
    }

    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No previous spike data found. Data is moved here from Current Spike Data.</div>
                </td>
            </tr>
        `;
        return;
    }

    filteredData.forEach((spike) => {
        const row = document.createElement('tr');
        const customer = adminData.customers.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : spike.customer;
        const customerRegion = customer ? customer.region : '-';
        const item = adminData.items.find(i => i.itemID === spike.itemID);
        const itemDescription = item ? item.description : 'Unknown';
        const itemGrade = item ? item.grade : '-';
        const totalSpike = (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0);
        
        row.innerHTML = `
            <td>${customerName} (${spike.customer})</td>
            <td>${customerRegion}</td>
            <td>${spike.itemID}</td>
            <td>${itemDescription}</td>
            <td>${itemGrade}</td>
            <td>${spike.month1 || 0}</td>
            <td>${spike.month2 || 0}</td>
            <td>${spike.month3 || 0}</td>
            <td>${totalSpike}</td>
            <td>${spike.submitDate || '-'}</td>
            <td>${spike.userName || '-'}</td>
            <td>${spike.movedDate || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function refreshPreviousSpikeData() {
    loadAdminData();
    loadPreviousSpikeData();
    console.log('Previous spike data refreshed. Total entries:', adminData.previousSpikeData.length);
}

function exportPreviousSpikeDataToExcel() {
    if (adminData.previousSpikeData.length === 0) {
        alert('No previous spike data available to export.');
        return;
    }

    let csvContent = 'Customer,Customer Name,Region,Item ID,Description,Grade,Month 1,Month 2,Month 3,Total Spike,Submit Date,User Name,Moved Date\n';

    adminData.previousSpikeData.forEach(spike => {
        const customer = adminData.customers.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : 'Unknown';
        const customerRegion = customer ? customer.region : 'Unknown';
        const item = adminData.items.find(i => i.itemID === spike.itemID);
        const itemDescription = item ? item.description : 'Unknown';
        const itemGrade = item ? item.grade : 'Unknown';
        const totalSpike = (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0);

        csvContent += `${spike.customer},"${customerName}","${customerRegion}",${spike.itemID},"${itemDescription}","${itemGrade}",${spike.month1 || 0},${spike.month2 || 0},${spike.month3 || 0},${totalSpike},${spike.submitDate || '-'},${spike.userName || '-'},${spike.movedDate || '-'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `previous_spike_data_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Previous spike data exported successfully');
}

function exportSpikeDataToExcel() {
    if (adminData.spikeData.length === 0) {
        alert('No spike data available to export.');
        return;
    }

    // Create CSV content with all columns
    let csvContent = 'Customer,Customer Name,Region,Item ID,Description,Grade,Month 1,Month 2,Month 3,Total Spike,Submit Date,User Name\n';

    adminData.spikeData.forEach(spike => {
        const customer = adminData.customers.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : 'Unknown';
        const customerRegion = customer ? customer.region : 'Unknown';
        const item = adminData.items.find(i => i.itemID === spike.itemID);
        const itemDescription = item ? item.description : 'Unknown';
        const itemGrade = item ? item.grade : 'Unknown';
        const totalSpike = (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0);

        csvContent += `${spike.customer},"${customerName}","${customerRegion}",${spike.itemID},"${itemDescription}","${itemGrade}",${spike.month1 || 0},${spike.month2 || 0},${spike.month3 || 0},${totalSpike},${spike.submitDate || '-'},${spike.userName || '-'}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `spike_data_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Spike data exported successfully');
}

// ==================== UTILITY FUNCTIONS ====================

function populateDropdowns() {
    // Populate current spike customer filter
    const currentSpikeCustomerFilter = document.getElementById('current-spike-customer-filter');
    if (currentSpikeCustomerFilter) {
        currentSpikeCustomerFilter.innerHTML = '<option value="">All Customers</option>';
        adminData.customers.forEach(customer => {
            currentSpikeCustomerFilter.innerHTML += `<option value="${customer.code}">${customer.code} - ${customer.name}</option>`;
        });
    }
    
    // Populate previous spike customer filter
    const previousSpikeCustomerFilter = document.getElementById('previous-spike-customer-filter');
    if (previousSpikeCustomerFilter) {
        previousSpikeCustomerFilter.innerHTML = '<option value="">All Customers</option>';
        adminData.customers.forEach(customer => {
            previousSpikeCustomerFilter.innerHTML += `<option value="${customer.code}">${customer.code} - ${customer.name}</option>`;
        });
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ==================== SUBMISSION CONTROL ====================

let autoCloseCheckInterval = null;

function loadSubmissionControl() {
    const statusIndicator = document.getElementById('submission-status');
    const openBtn = document.getElementById('open-submission-btn');
    const closeBtn = document.getElementById('close-submission-btn');
    const openTimestamp = document.getElementById('open-timestamp');
    const closeTimestamp = document.getElementById('close-timestamp');
    const scheduledInfo = document.getElementById('scheduled-close-info');
    
    if (adminData.submissionWindowOpen) {
        statusIndicator.className = 'status-indicator open';
        statusIndicator.querySelector('.status-text').textContent = 'Open - Users can submit data';
        openBtn.disabled = true;
        closeBtn.disabled = false;
    } else {
        statusIndicator.className = 'status-indicator closed';
        statusIndicator.querySelector('.status-text').textContent = 'Closed - Users cannot submit data';
        openBtn.disabled = false;
        closeBtn.disabled = true;
    }
    
    // Display timestamps
    if (adminData.submissionWindowOpenTime) {
        const openDate = new Date(adminData.submissionWindowOpenTime);
        openTimestamp.textContent = openDate.toLocaleString();
    } else {
        openTimestamp.textContent = 'Never';
    }
    
    if (adminData.submissionWindowCloseTime) {
        const closeDate = new Date(adminData.submissionWindowCloseTime);
        closeTimestamp.textContent = closeDate.toLocaleString();
    } else {
        closeTimestamp.textContent = 'Never';
    }
    
    // Display scheduled auto-close info
    if (adminData.scheduledAutoCloseTime) {
        const scheduledDate = new Date(adminData.scheduledAutoCloseTime);
        scheduledInfo.innerHTML = `
            <span class="scheduled-icon">📅</span>
            <span class="scheduled-text">Scheduled to auto-close: ${scheduledDate.toLocaleString()}</span>
        `;
        scheduledInfo.style.display = 'flex';
        
        // Start auto-close check timer
        startAutoCloseCheck();
    } else {
        scheduledInfo.innerHTML = `
            <span class="scheduled-icon">📅</span>
            <span class="scheduled-text">No auto-close scheduled</span>
        `;
        scheduledInfo.style.display = 'flex';
        
        // Stop auto-close check timer
        stopAutoCloseCheck();
    }
}

function openSubmissionWindow() {
    if (confirm('Are you sure you want to open the submission window? Users will be able to submit spike data.')) {
        adminData.submissionWindowOpen = true;
        adminData.submissionWindowOpenTime = new Date().toISOString();
        adminData.submissionWindowCloseTime = null; // Reset close time when opening
        saveAdminData();
        loadSubmissionControl();
        alert('Submission window is now OPEN. Users can submit spike data.');
    }
}

function closeSubmissionWindow() {
    if (confirm('Are you sure you want to close the submission window? Users will NOT be able to submit spike data until you open it again.')) {
        adminData.submissionWindowOpen = false;
        adminData.submissionWindowCloseTime = new Date().toISOString();
        adminData.scheduledAutoCloseTime = null; // Cancel any scheduled auto-close
        saveAdminData();
        loadSubmissionControl();
        alert('Submission window is now CLOSED. Users cannot submit spike data.');
    }
}

// ==================== CUSTOMERS MANAGEMENT ====================

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const editIndex = parseInt(document.getElementById('customer-edit-index').value);
    const customerCode = document.getElementById('customer-code').value.trim();
    const customerName = document.getElementById('customer-name').value.trim();
    const region = document.getElementById('customer-region').value;

    // Check for duplicate CustomerCode
    if (editIndex === -1 && adminData.customers.some(c => c.code === customerCode)) {
        alert('CustomerCode already exists!');
        return;
    }

    const customerData = { code: customerCode, name: customerName, region };

    try {
        if (USE_SHAREPOINT) {
            if (editIndex >= 0) {
                // Update existing customer in SharePoint
                const existingCustomer = adminData.customers[editIndex];
                await updateCustomer(existingCustomer.Id, customerData);
            } else {
                // Add new customer to SharePoint
                const newId = await addCustomer(customerData);
                customerData.Id = newId;
            }
        }

        if (editIndex >= 0) {
            adminData.customers[editIndex] = customerData;
        } else {
            adminData.customers.push(customerData);
        }

        await saveAdminData();
        loadCustomers();
        populateDropdowns();
        closeModal('customer-modal');
        document.getElementById('customer-form').reset();
    } catch (error) {
        console.error('Error saving customer:', error);
        alert('Error saving customer. Please try again.');
    }
}

async function deleteCustomer(index) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            if (USE_SHAREPOINT && adminData.customers[index].Id) {
                await deleteCustomerFromSharePoint(SHAREPOINT_LISTS.customers, adminData.customers[index].Id);
            }
            adminData.customers.splice(index, 1);
            await saveAdminData();
            loadCustomers();
            populateDropdowns();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error deleting customer. Please try again.');
        }
    }
}

function scheduleAutoClose() {
    const dateInput = document.getElementById('auto-close-date');
    const timeInput = document.getElementById('auto-close-time');
    
    if (!dateInput.value || !timeInput.value) {
        alert('Please select both date and time for auto-close.');
        return;
    }
    
    const scheduledDateTime = new Date(`${dateInput.value}T${timeInput.value}`);
    
    if (scheduledDateTime <= new Date()) {
        alert('Scheduled time must be in the future.');
        return;
    }
    
    if (!adminData.submissionWindowOpen) {
        alert('Please open the submission window first before scheduling auto-close.');
        return;
    }
    
    if (confirm(`Are you sure you want to schedule auto-close for ${scheduledDateTime.toLocaleString()}?`)) {
        adminData.scheduledAutoCloseTime = scheduledDateTime.toISOString();
        saveAdminData();
        loadSubmissionControl();
        alert(`Auto-close scheduled for ${scheduledDateTime.toLocaleString()}`);
    }
}

function cancelAutoClose() {
    if (!adminData.scheduledAutoCloseTime) {
        alert('No auto-close is currently scheduled.');
        return;
    }
    
    if (confirm('Are you sure you want to cancel the scheduled auto-close?')) {
        adminData.scheduledAutoCloseTime = null;
        saveAdminData();
        loadSubmissionControl();
        alert('Auto-close schedule cancelled.');
    }
}

function startAutoCloseCheck() {
    // Clear any existing interval
    stopAutoCloseCheck();
    
    // Check every 30 seconds
    autoCloseCheckInterval = setInterval(function() {
        checkAutoClose();
    }, 30000);
    
    // Check immediately
    checkAutoClose();
}

function stopAutoCloseCheck() {
    if (autoCloseCheckInterval) {
        clearInterval(autoCloseCheckInterval);
        autoCloseCheckInterval = null;
    }
}

function checkAutoClose() {
    if (!adminData.scheduledAutoCloseTime || !adminData.submissionWindowOpen) {
        return;
    }
    
    const scheduledTime = new Date(adminData.scheduledAutoCloseTime);
    const currentTime = new Date();
    
    if (currentTime >= scheduledTime) {
        // Time to auto-close
        console.log('Auto-closing submission window at scheduled time');
        adminData.submissionWindowOpen = false;
        adminData.submissionWindowCloseTime = new Date().toISOString();
        adminData.scheduledAutoCloseTime = null; // Clear scheduled time
        saveAdminData();
        loadSubmissionControl();
        stopAutoCloseCheck();
        
        // Show notification (in real implementation, you might want a more visible notification)
        alert('Submission window has been automatically closed (scheduled auto-close).');
    }
}

// ==================== BULK UPLOAD FUNCTIONALITY ====================

let currentBulkUploadType = '';

function openBulkUploadModal(type) {
    currentBulkUploadType = type;
    const modal = document.getElementById('bulk-upload-modal');
    const title = document.getElementById('bulk-upload-title');
    const formatExample = document.getElementById('csv-format-example');
    const results = document.getElementById('bulk-upload-results');
    
    results.className = 'upload-results';
    results.style.display = 'none';
    results.innerHTML = '';
    
    const formatInstructions = {
        items: {
            title: 'Bulk Upload Items',
            format: 'ItemID,Description,Grade\nITM001,Steel Sheet 5mm,A\nITM002,Steel Sheet 10mm,B'
        },
        customers: {
            title: 'Bulk Upload Customers',
            format: 'CustomerCode,CustomerName,Region\nCUST001,ABC Manufacturing,South West\nCUST002,XYZ Industries,North East'
        },
        booking: {
            title: 'Bulk Upload Booking Data',
            format: 'CustomerCode,ItemID,AverageBooking\nCUST001,ITM001,150\nCUST001,ITM002,200'
        },
        shipping: {
            title: 'Bulk Upload Shipping Data',
            format: 'CustomerCode,ItemID,AverageShipping\nCUST001,ITM001,140\nCUST001,ITM002,190'
        }
    };
    
    title.textContent = formatInstructions[type].title;
    formatExample.textContent = formatInstructions[type].format;
    
    modal.style.display = 'block';
}

function processBulkUpload() {
    const fileInput = document.getElementById('bulk-upload-file');
    const appendCheckbox = document.getElementById('bulk-upload-append');
    const results = document.getElementById('bulk-upload-results');
    
    if (!fileInput.files.length) {
        alert('Please select a CSV file');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            showUploadResults('error', 'CSV file must have at least a header and one data row');
            return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        try {
            switch(currentBulkUploadType) {
                case 'items':
                    processBulkItems(headers, dataRows, appendCheckbox.checked, (success, errs) => {
                        successCount = success;
                        errors.push(...errs);
                        errorCount = errs.length;
                    });
                    break;
                case 'customers':
                    processBulkCustomers(headers, dataRows, appendCheckbox.checked, (success, errs) => {
                        successCount = success;
                        errors.push(...errs);
                        errorCount = errs.length;
                    });
                    break;
                case 'booking':
                    processBulkBooking(headers, dataRows, appendCheckbox.checked, (success, errs) => {
                        successCount = success;
                        errors.push(...errs);
                        errorCount = errs.length;
                    });
                    break;
                case 'shipping':
                    processBulkShipping(headers, dataRows, appendCheckbox.checked, (success, errs) => {
                        successCount = success;
                        errors.push(...errs);
                        errorCount = errs.length;
                    });
                    break;
            }
            
            saveAdminData();
            loadAllData();
            
            if (errorCount === 0) {
                showUploadResults('success', `Successfully uploaded ${successCount} records`);
            } else {
                showUploadResults('error', `Uploaded ${successCount} records with ${errorCount} errors`, errors);
            }
            
        } catch (error) {
            showUploadResults('error', `Error processing file: ${error.message}`);
        }
        
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}

function processBulkItems(headers, dataRows, append, callback) {
    let successCount = 0;
    const errors = [];
    
    if (!append) {
        adminData.items = [];
    }
    
    dataRows.forEach((row, index) => {
        try {
            const values = row.split(',').map(v => v.trim());
            if (values.length < 3) {
                errors.push(`Row ${index + 2}: Invalid format - expected 3 columns`);
                return;
            }
            
            const [itemID, description, grade] = values;
            
            if (!itemID || !description || !grade) {
                errors.push(`Row ${index + 2}: Missing required fields`);
                return;
            }
            
            if (adminData.items.some(item => item.itemID === itemID)) {
                errors.push(`Row ${index + 2}: ItemID ${itemID} already exists`);
                return;
            }
            
            adminData.items.push({ itemID, description, grade });
            successCount++;
            
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });
    
    callback(successCount, errors);
}

function processBulkCustomers(headers, dataRows, append, callback) {
    let successCount = 0;
    const errors = [];
    
    if (!append) {
        adminData.customers = [];
    }
    
    dataRows.forEach((row, index) => {
        try {
            const values = row.split(',').map(v => v.trim());
            if (values.length < 3) {
                errors.push(`Row ${index + 2}: Invalid format - expected 3 columns`);
                return;
            }
            
            const [code, name, region] = values;
            
            if (!code || !name || !region) {
                errors.push(`Row ${index + 2}: Missing required fields`);
                return;
            }
            
            if (!adminData.regions.includes(region)) {
                errors.push(`Row ${index + 2}: Invalid region "${region}"`);
                return;
            }
            
            if (adminData.customers.some(customer => customer.code === code)) {
                errors.push(`Row ${index + 2}: Customer code ${code} already exists`);
                return;
            }
            
            adminData.customers.push({ code, name, region });
            successCount++;
            
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });
    
    callback(successCount, errors);
}

function processBulkBooking(headers, dataRows, append, callback) {
    let successCount = 0;
    const errors = [];
    
    if (!append) {
        adminData.bookingData = {};
    }
    
    dataRows.forEach((row, index) => {
        try {
            const values = row.split(',').map(v => v.trim());
            if (values.length < 3) {
                errors.push(`Row ${index + 2}: Invalid format - expected 3 columns`);
                return;
            }
            
            const [customerCode, itemID, value] = values;
            
            if (!customerCode || !itemID || !value) {
                errors.push(`Row ${index + 2}: Missing required fields`);
                return;
            }
            
            if (!adminData.customers.some(c => c.code === customerCode)) {
                errors.push(`Row ${index + 2}: Customer ${customerCode} does not exist`);
                return;
            }
            
            if (!adminData.items.some(item => item.itemID === itemID)) {
                errors.push(`Row ${index + 2}: Item ${itemID} does not exist`);
                return;
            }
            
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                errors.push(`Row ${index + 2}: Invalid value "${value}"`);
                return;
            }
            
            if (!adminData.bookingData[customerCode]) {
                adminData.bookingData[customerCode] = {};
            }
            
            adminData.bookingData[customerCode][itemID] = numValue;
            successCount++;
            
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });
    
    callback(successCount, errors);
}

function processBulkShipping(headers, dataRows, append, callback) {
    let successCount = 0;
    const errors = [];
    
    if (!append) {
        adminData.shippingData = {};
    }
    
    dataRows.forEach((row, index) => {
        try {
            const values = row.split(',').map(v => v.trim());
            if (values.length < 3) {
                errors.push(`Row ${index + 2}: Invalid format - expected 3 columns`);
                return;
            }
            
            const [customerCode, itemID, value] = values;
            
            if (!customerCode || !itemID || !value) {
                errors.push(`Row ${index + 2}: Missing required fields`);
                return;
            }
            
            if (!adminData.customers.some(c => c.code === customerCode)) {
                errors.push(`Row ${index + 2}: Customer ${customerCode} does not exist`);
                return;
            }
            
            if (!adminData.items.some(item => item.itemID === itemID)) {
                errors.push(`Row ${index + 2}: Item ${itemID} does not exist`);
                return;
            }
            
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
                errors.push(`Row ${index + 2}: Invalid value "${value}"`);
                return;
            }
            
            if (!adminData.shippingData[customerCode]) {
                adminData.shippingData[customerCode] = {};
            }
            
            adminData.shippingData[customerCode][itemID] = numValue;
            successCount++;
            
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });
    
    callback(successCount, errors);
}

function showUploadResults(type, message, errors = []) {
    const results = document.getElementById('bulk-upload-results');
    results.className = `upload-results ${type}`;
    results.style.display = 'block';
    
    let html = `<h4>${message}</h4>`;
    
    if (errors.length > 0) {
        html += '<ul>';
        errors.slice(0, 10).forEach(error => {
            html += `<li>${error}</li>`;
        });
        if (errors.length > 10) {
            html += `<li>... and ${errors.length - 10} more errors</li>`;
        }
        html += '</ul>';
    }
    
    results.innerHTML = html;
}

// ==================== CLEAR PAGE FUNCTIONALITY ====================

function confirmClearPage(section) {
    currentClearSection = section;
    const modal = document.getElementById('clear-modal');
    const passwordInput = document.getElementById('clear-password');
    passwordInput.value = '';
    modal.style.display = 'block';
}

function executeClearPage() {
    const password = document.getElementById('clear-password').value;
    
    if (password !== ADMIN_PASSWORD) {
        alert('Incorrect password. Clear operation cancelled.');
        return;
    }
    
    let success = false;
    let message = '';
    
    switch(currentClearSection) {
        case 'items':
            adminData.items = [];
            message = 'All items have been cleared.';
            success = true;
            break;
        case 'customers':
            adminData.customers = [];
            message = 'All customers have been cleared.';
            success = true;
            break;
        case 'booking':
            adminData.bookingData = {};
            message = 'All booking data has been cleared.';
            success = true;
            break;
        case 'shipping':
            adminData.shippingData = {};
            message = 'All shipping data has been cleared.';
            success = true;
            break;
        case 'current-spike':
            adminData.currentSpikeData = [];
            message = 'All current spike data has been cleared. This will remove all user-submitted spike data.';
            success = true;
            break;
        case 'previous-spike':
            adminData.previousSpikeData = [];
            message = 'All previous spike data has been cleared.';
            success = true;
            break;
        default:
            message = 'Invalid section.';
            success = false;
    }
    
    if (success) {
        saveAdminData();
        loadAllData();
        alert(message);
        closeModal('clear-modal');
    } else {
        alert(message);
    }
}

// ==================== LOGOUT FUNCTIONALITY ====================

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminAuthTime');
        window.location.href = 'login.html';
    }
}

// Export data function (for backup/migration)
function exportData() {
    const dataStr = JSON.stringify(adminData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-admin-data.json';
    link.click();
}

// Import data function
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                adminData = importedData;
                saveAdminData();
                loadAllData();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}
