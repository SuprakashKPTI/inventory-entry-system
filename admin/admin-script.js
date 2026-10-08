// Admin Data Management Script for Supabase

// Admin password (should match the one in login.html)
const ADMIN_PASSWORD = 'Admin@123';

// Flag to determine data source (Supabase or localStorage)
const USE_SUPABASE = true;

// Get Supabase client from parent config
const supabase = window.supabase;

// Initialize data from localStorage or use default data
let adminData = {
    items: [],
    customers: [],
    bookingData: {},
    shippingData: {},
    currentSpikeData: [],
    previousSpikeData: [],
    regions: ['South West', 'North East', 'North West', 'South East', 'Central'],
    submissionWindowOpen: false,
    submissionWindowOpenTime: null,
    submissionWindowCloseTime: null,
    scheduledAutoCloseTime: null
};

let currentClearSection = '';

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    initializeTabs();
    initializeForms();
    loadAllData();
    
    // Setup auto-close timer
    setupAutoCloseTimer();
});

// Load admin data from Supabase or localStorage
async function loadAdminData() {
    if (USE_SUPABASE) {
        try {
            console.log('Loading data from Supabase...');
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Supabase loading failed, falling back to localStorage:', error);
            alert('Could not connect to Supabase. Using local storage instead.');
            loadAdminDataFromLocalStorage();
        }
    } else {
        console.log('Using localStorage (Supabase disabled)');
        loadAdminDataFromLocalStorage();
    }
}

async function loadAdminDataFromSupabase() {
    try {
        // Load all data from Supabase
        const items = await getItems();
        const customers = await getCustomers();
        const bookingData = await getBookingData();
        const shippingData = await getShippingData();
        const spikeItems = await getSpikeData();
        const submissionControl = await getSubmissionControl();
        
        // Convert Supabase items to app format
        adminData.items = items.map(item => ({
            itemID: item.itemID,
            description: item.description,
            grade: item.grade
        }));
        
        adminData.customers = customers.map(customer => ({
            code: customer.code,
            name: customer.name,
            region: customer.region
        }));
        
        adminData.bookingData = bookingData;
        adminData.shippingData = shippingData;
        
        // Separate current and previous spike data
        adminData.currentSpikeData = spikeItems.filter(spike => !spike.movedDate);
        adminData.previousSpikeData = spikeItems.filter(spike => spike.movedDate);
        
        // Set submission window status
        if (submissionControl) {
            adminData.submissionWindowOpen = submissionControl.is_open;
            adminData.submissionWindowOpenTime = submissionControl.opened_at;
            adminData.submissionWindowCloseTime = submissionControl.closed_at;
            adminData.scheduledAutoCloseTime = submissionControl.scheduled_close;
        }
        
        console.log('Data loaded from Supabase successfully');
        console.log('Items:', adminData.items.length);
        console.log('Customers:', adminData.customers.length);
        console.log('Spike data:', adminData.currentSpikeData.length);
        
    } catch (error) {
        console.error('Error loading from Supabase:', error);
        throw error;
    }
}

function loadAdminDataFromLocalStorage() {
    const storedData = localStorage.getItem('inventoryAdminData');
    
    if (storedData) {
        adminData = JSON.parse(storedData);
        
        // Ensure regions array exists
        if (!adminData.regions) {
            adminData.regions = ['South West', 'North East', 'North West', 'South East', 'Central'];
        }
        
        console.log('Data loaded from localStorage');
    } else {
        console.log('No data found, using empty structure');
    }
}

// Save admin data to localStorage (for fallback)
function saveAdminDataToLocalStorage() {
    localStorage.setItem('inventoryAdminData', JSON.stringify(adminData));
    console.log('Admin data saved to localStorage');
}

// Initialize tabs
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialize forms
function initializeForms() {
    // Item form
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addItemFromForm();
        });
    }
    
    // Customer form
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCustomerFromForm();
        });
    }
    
    // Booking data form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addBookingDataFromForm();
        });
    }
    
    // Shipping data form
    const shippingForm = document.getElementById('shippingForm');
    if (shippingForm) {
        shippingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addShippingDataFromForm();
        });
    }
}

// Load all data into tables
function loadAllData() {
    loadItemsTable();
    loadCustomersTable();
    loadBookingDataTable();
    loadShippingDataTable();
    loadCurrentSpikeDataTable();
    loadPreviousSpikeDataTable();
    updateSubmissionWindowStatus();
}

// Load items table
function loadItemsTable() {
    const tableBody = document.getElementById('itemsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    adminData.items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.itemID}</td>
            <td>${item.description}</td>
            <td>${item.grade}</td>
            <td>
                <button onclick="editItem(${index})">Edit</button>
                <button onclick="deleteItem(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load customers table
function loadCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    adminData.customers.forEach((customer, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.code}</td>
            <td>${customer.name}</td>
            <td>${customer.region}</td>
            <td>
                <button onclick="editCustomer(${index})">Edit</button>
                <button onclick="deleteCustomer(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load booking data table
function loadBookingDataTable() {
    const tableBody = document.getElementById('bookingTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    Object.entries(adminData.bookingData).forEach(([customerCode, items]) => {
        Object.entries(items).forEach(([itemID, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customerCode}</td>
                <td>${itemID}</td>
                <td>${value}</td>
                <td>
                    <button onclick="editBookingData('${customerCode}', '${itemID}')">Edit</button>
                    <button onclick="deleteBookingData('${customerCode}', '${itemID}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

// Load shipping data table
function loadShippingDataTable() {
    const tableBody = document.getElementById('shippingTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    Object.entries(adminData.shippingData).forEach(([customerCode, items]) => {
        Object.entries(items).forEach(([itemID, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customerCode}</td>
                <td>${itemID}</td>
                <td>${value}</td>
                <td>
                    <button onclick="editShippingData('${customerCode}', '${itemID}')">Edit</button>
                    <button onclick="deleteShippingData('${customerCode}', '${itemID}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
}

// Load current spike data table
function loadCurrentSpikeDataTable() {
    const tableBody = document.getElementById('currentSpikeTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const customerFilter = document.getElementById('currentSpikeCustomerFilter');
    const filterValue = customerFilter ? customerFilter.value : '';
    
    const filteredData = filterValue 
        ? adminData.currentSpikeData.filter(s => s.customer === filterValue)
        : adminData.currentSpikeData;
    
    filteredData.forEach((spike, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${spike.customer}</td>
            <td>${spike.itemID}</td>
            <td>${spike.month1 || 0}</td>
            <td>${spike.month2 || 0}</td>
            <td>${spike.month3 || 0}</td>
            <td>${(spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0)}</td>
            <td>${spike.submitDate}</td>
            <td>${spike.userName}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Load previous spike data table
function loadPreviousSpikeDataTable() {
    const tableBody = document.getElementById('previousSpikeTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const customerFilter = document.getElementById('previousSpikeCustomerFilter');
    const filterValue = customerFilter ? customerFilter.value : '';
    
    const filteredData = filterValue 
        ? adminData.previousSpikeData.filter(s => s.customer === filterValue)
        : adminData.previousSpikeData;
    
    filteredData.forEach((spike, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${spike.customer}</td>
            <td>${spike.itemID}</td>
            <td>${spike.month1 || 0}</td>
            <td>${spike.month2 || 0}</td>
            <td>${spike.month3 || 0}</td>
            <td>${(spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0)}</td>
            <td>${spike.submitDate}</td>
            <td>${spike.userName}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Add item from form
async function addItemFromForm() {
    const itemID = document.getElementById('itemID').value;
    const description = document.getElementById('itemDescription').value;
    const grade = document.getElementById('itemGrade').value;
    
    if (!itemID || !description || !grade) {
        alert('Please fill in all fields');
        return;
    }
    
    const newItem = { itemID, description, grade };
    
    if (USE_SUPABASE) {
        try {
            await addItem(newItem);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error adding item to Supabase:', error);
            alert('Error adding item. Please try again.');
            return;
        }
    } else {
        adminData.items.push(newItem);
        saveAdminDataToLocalStorage();
    }
    
    loadItemsTable();
    document.getElementById('itemForm').reset();
}

// Add customer from form
async function addCustomerFromForm() {
    const code = document.getElementById('customerCode').value;
    const name = document.getElementById('customerName').value;
    const region = document.getElementById('customerRegion').value;
    
    if (!code || !name || !region) {
        alert('Please fill in all fields');
        return;
    }
    
    const newCustomer = { code, name, region };
    
    if (USE_SUPABASE) {
        try {
            await addCustomer(newCustomer);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error adding customer to Supabase:', error);
            alert('Error adding customer. Please try again.');
            return;
        }
    } else {
        adminData.customers.push(newCustomer);
        saveAdminDataToLocalStorage();
    }
    
    loadCustomersTable();
    document.getElementById('customerForm').reset();
}

// Add booking data from form
async function addBookingDataFromForm() {
    const customerCode = document.getElementById('bookingCustomerCode').value;
    const itemID = document.getElementById('bookingItemID').value;
    const value = parseFloat(document.getElementById('bookingValue').value);
    
    if (!customerCode || !itemID || isNaN(value)) {
        alert('Please fill in all fields');
        return;
    }
    
    if (USE_SUPABASE) {
        try {
            await addBookingData(customerCode, itemID, value);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error adding booking data to Supabase:', error);
            alert('Error adding booking data. Please try again.');
            return;
        }
    } else {
        if (!adminData.bookingData[customerCode]) {
            adminData.bookingData[customerCode] = {};
        }
        adminData.bookingData[customerCode][itemID] = value;
        saveAdminDataToLocalStorage();
    }
    
    loadBookingDataTable();
    document.getElementById('bookingForm').reset();
}

// Add shipping data from form
async function addShippingDataFromForm() {
    const customerCode = document.getElementById('shippingCustomerCode').value;
    const itemID = document.getElementById('shippingItemID').value;
    const value = parseFloat(document.getElementById('shippingValue').value);
    
    if (!customerCode || !itemID || isNaN(value)) {
        alert('Please fill in all fields');
        return;
    }
    
    if (USE_SUPABASE) {
        try {
            await addShippingData(customerCode, itemID, value);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error adding shipping data to Supabase:', error);
            alert('Error adding shipping data. Please try again.');
            return;
        }
    } else {
        if (!adminData.shippingData[customerCode]) {
            adminData.shippingData[customerCode] = {};
        }
        adminData.shippingData[customerCode][itemID] = value;
        saveAdminDataToLocalStorage();
    }
    
    loadShippingDataTable();
    document.getElementById('shippingForm').reset();
}

// Edit item
function editItem(index) {
    const item = adminData.items[index];
    document.getElementById('itemID').value = item.itemID;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemGrade').value = item.grade;
    
    // Remove the item so it can be re-added
    adminData.items.splice(index, 1);
    loadItemsTable();
}

// Edit customer
function editCustomer(index) {
    const customer = adminData.customers[index];
    document.getElementById('customerCode').value = customer.code;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerRegion').value = customer.region;
    
    adminData.customers.splice(index, 1);
    loadCustomersTable();
}

// Edit booking data
function editBookingData(customerCode, itemID) {
    document.getElementById('bookingCustomerCode').value = customerCode;
    document.getElementById('bookingItemID').value = itemID;
    document.getElementById('bookingValue').value = adminData.bookingData[customerCode][itemID];
    
    delete adminData.bookingData[customerCode][itemID];
    loadBookingDataTable();
}

// Edit shipping data
function editShippingData(customerCode, itemID) {
    document.getElementById('shippingCustomerCode').value = customerCode;
    document.getElementById('shippingItemID').value = itemID;
    document.getElementById('shippingValue').value = adminData.shippingData[customerCode][itemID];
    
    delete adminData.shippingData[customerCode][itemID];
    loadShippingDataTable();
}

// Delete item
async function deleteItem(index) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const item = adminData.items[index];
    
    if (USE_SUPABASE) {
        try {
            // Find the item ID from Supabase
            const items = await getItems();
            const supabaseItem = items.find(i => i.itemID === item.itemID);
            if (supabaseItem) {
                await deleteItem(supabaseItem.Id);
                await loadAdminDataFromSupabase();
            }
        } catch (error) {
            console.error('Error deleting item from Supabase:', error);
            alert('Error deleting item. Please try again.');
            return;
        }
    } else {
        adminData.items.splice(index, 1);
        saveAdminDataToLocalStorage();
    }
    
    loadItemsTable();
}

// Delete customer
async function deleteCustomer(index) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    const customer = adminData.customers[index];
    
    if (USE_SUPABASE) {
        try {
            const customers = await getCustomers();
            const supabaseCustomer = customers.find(c => c.code === customer.code);
            if (supabaseCustomer) {
                await deleteCustomer(supabaseCustomer.Id);
                await loadAdminDataFromSupabase();
            }
        } catch (error) {
            console.error('Error deleting customer from Supabase:', error);
            alert('Error deleting customer. Please try again.');
            return;
        }
    } else {
        adminData.customers.splice(index, 1);
        saveAdminDataToLocalStorage();
    }
    
    loadCustomersTable();
}

// Delete booking data
async function deleteBookingData(customerCode, itemID) {
    if (!confirm('Are you sure you want to delete this booking data?')) return;
    
    if (USE_SUPABASE) {
        try {
            await deleteBookingData(customerCode, itemID);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error deleting booking data from Supabase:', error);
            alert('Error deleting booking data. Please try again.');
            return;
        }
    } else {
        delete adminData.bookingData[customerCode][itemID];
        saveAdminDataToLocalStorage();
    }
    
    loadBookingDataTable();
}

// Delete shipping data
async function deleteShippingData(customerCode, itemID) {
    if (!confirm('Are you sure you want to delete this shipping data?')) return;
    
    if (USE_SUPABASE) {
        try {
            await deleteShippingData(customerCode, itemID);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error deleting shipping data from Supabase:', error);
            alert('Error deleting shipping data. Please try again.');
            return;
        }
    } else {
        delete adminData.shippingData[customerCode][itemID];
        saveAdminDataToLocalStorage();
    }
    
    loadShippingDataTable();
}

// Submission window control
async function toggleSubmissionWindow() {
    const newState = !adminData.submissionWindowOpen;
    
    if (USE_SUPABASE) {
        try {
            await updateSubmissionControl(newState);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error updating submission control:', error);
            alert('Error updating submission window. Please try again.');
            return;
        }
    } else {
        adminData.submissionWindowOpen = newState;
        adminData.submissionWindowOpenTime = newState ? new Date().toISOString() : null;
        adminData.submissionWindowCloseTime = newState ? null : new Date().toISOString();
        saveAdminDataToLocalStorage();
    }
    
    updateSubmissionWindowStatus();
}

function updateSubmissionWindowStatus() {
    const statusDiv = document.getElementById('submissionWindowStatus');
    if (!statusDiv) return;
    
    if (adminData.submissionWindowOpen) {
        statusDiv.innerHTML = `
            <div class="status-open">
                <h3>🔓 Submission Window is OPEN</h3>
                <p>Opened at: ${adminData.submissionWindowOpenTime ? new Date(adminData.submissionWindowOpenTime).toLocaleString() : 'N/A'}</p>
                ${adminData.scheduledAutoCloseTime ? `<p>Scheduled to close at: ${new Date(adminData.scheduledAutoCloseTime).toLocaleString()}</p>` : ''}
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="status-closed">
                <h3>🔒 Submission Window is CLOSED</h3>
                <p>Closed at: ${adminData.submissionWindowCloseTime ? new Date(adminData.submissionWindowCloseTime).toLocaleString() : 'N/A'}</p>
            </div>
        `;
    }
}

// Schedule auto-close
async function scheduleAutoClose() {
    const closeTime = document.getElementById('scheduledCloseTime').value;
    
    if (!closeTime) {
        alert('Please select a date and time');
        return;
    }
    
    const scheduledTime = new Date(closeTime).toISOString();
    
    if (USE_SUPABASE) {
        try {
            await updateSubmissionControl(true, scheduledTime);
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error scheduling auto-close:', error);
            alert('Error scheduling auto-close. Please try again.');
            return;
        }
    } else {
        adminData.scheduledAutoCloseTime = scheduledTime;
        adminData.submissionWindowOpen = true;
        adminData.submissionWindowOpenTime = new Date().toISOString();
        saveAdminDataToLocalStorage();
    }
    
    updateSubmissionWindowStatus();
    alert(`Submission window will automatically close at ${new Date(scheduledTime).toLocaleString()}`);
}

// Setup auto-close timer
function setupAutoCloseTimer() {
    setInterval(async () => {
        if (adminData.scheduledAutoCloseTime && adminData.submissionWindowOpen) {
            const now = new Date();
            const closeTime = new Date(adminData.scheduledAutoCloseTime);
            
            if (now >= closeTime) {
                console.log('Auto-closing submission window');
                
                if (USE_SUPABASE) {
                    try {
                        await updateSubmissionControl(false);
                        await loadAdminDataFromSupabase();
                    } catch (error) {
                        console.error('Error auto-closing window:', error);
                    }
                } else {
                    adminData.submissionWindowOpen = false;
                    adminData.submissionWindowCloseTime = new Date().toISOString();
                    adminData.scheduledAutoCloseTime = null;
                    saveAdminDataToLocalStorage();
                }
                
                updateSubmissionWindowStatus();
            }
        }
    }, 30000); // Check every 30 seconds
}

// Move current spike data to previous
async function moveSpikeDataToPrevious() {
    if (!confirm('Are you sure you want to move all current spike data to previous? This cannot be undone.')) return;
    
    if (USE_SUPABASE) {
        try {
            await moveSpikeDataToPreviousSupabase();
            await loadAdminDataFromSupabase();
        } catch (error) {
            console.error('Error moving spike data:', error);
            alert('Error moving spike data. Please try again.');
            return;
        }
    } else {
        // Move all current spike data to previous
        const now = new Date().toISOString();
        adminData.currentSpikeData.forEach(spike => {
            spike.movedDate = now;
        });
        adminData.previousSpikeData = [...adminData.previousSpikeData, ...adminData.currentSpikeData];
        adminData.currentSpikeData = [];
        saveAdminDataToLocalStorage();
    }
    
    loadCurrentSpikeDataTable();
    loadPreviousSpikeDataTable();
}

// Clear page functionality
function confirmClearPage(section) {
    currentClearSection = section;
    document.getElementById('clearModal').style.display = 'block';
}

function performClearPage() {
    const password = document.getElementById('clearPassword').value;
    
    if (password !== ADMIN_PASSWORD) {
        alert('Incorrect password');
        return;
    }
    
    switch (currentClearSection) {
        case 'items':
            adminData.items = [];
            break;
        case 'customers':
            adminData.customers = [];
            break;
        case 'bookingData':
            adminData.bookingData = {};
            break;
        case 'shippingData':
            adminData.shippingData = {};
            break;
        case 'currentSpikeData':
            adminData.currentSpikeData = [];
            break;
        case 'previousSpikeData':
            adminData.previousSpikeData = [];
            break;
    }
    
    saveAdminDataToLocalStorage();
    loadAllData();
    
    document.getElementById('clearModal').style.display = 'none';
    document.getElementById('clearPassword').value = '';
    
    alert('Page cleared successfully');
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export current spike data
function exportCurrentSpikeData() {
    const customerFilter = document.getElementById('currentSpikeCustomerFilter');
    const filterValue = customerFilter ? customerFilter.value : '';
    
    const filteredData = filterValue 
        ? adminData.currentSpikeData.filter(s => s.customer === filterValue)
        : adminData.currentSpikeData;
    
    const exportData = filteredData.map(spike => ({
        Customer: spike.customer,
        ItemID: spike.itemID,
        Month1: spike.month1 || 0,
        Month2: spike.month2 || 0,
        Month3: spike.month3 || 0,
        TotalSpike: (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0),
        SubmitDate: spike.submitDate,
        UserName: spike.userName
    }));
    
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `current_spike_data_${timestamp}.csv`);
}

// Export previous spike data
function exportPreviousSpikeData() {
    const customerFilter = document.getElementById('previousSpikeCustomerFilter');
    const filterValue = customerFilter ? customerFilter.value : '';
    
    const filteredData = filterValue 
        ? adminData.previousSpikeData.filter(s => s.customer === filterValue)
        : adminData.previousSpikeData;
    
    const exportData = filteredData.map(spike => ({
        Customer: spike.customer,
        ItemID: spike.itemID,
        Month1: spike.month1 || 0,
        Month2: spike.month2 || 0,
        Month3: spike.month3 || 0,
        TotalSpike: (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0),
        SubmitDate: spike.submitDate,
        UserName: spike.userName
    }));
    
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `previous_spike_data_${timestamp}.csv`);
}

// Refresh data
async function refreshData() {
    if (USE_SUPABASE) {
        try {
            await loadAdminDataFromSupabase();
            loadAllData();
            alert('Data refreshed from Supabase');
        } catch (error) {
            console.error('Error refreshing data:', error);
            alert('Error refreshing data. Please try again.');
        }
    } else {
        loadAdminDataFromLocalStorage();
        loadAllData();
        alert('Data refreshed from localStorage');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'login.html';
    }
}

// Alias for Supabase move function (to avoid naming conflict)
async function moveSpikeDataToPreviousSupabase() {
    const now = new Date().toISOString();
    
    const { error } = await supabase
        .from('spike_data')
        .update({
            moved_date: now
        })
        .is('moved_date', null);
    
    if (error) {
        console.error('Error moving spike data:', error);
        throw error;
    }
}
