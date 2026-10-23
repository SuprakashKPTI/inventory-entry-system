// Data storage configuration
const DATA_CONFIG = {
    // For GitHub Pages, you can use:
    // 1. Google Sheets API (recommended for this use case)
    // 2. GitHub API to store data in a repository
    // 3. LocalStorage for demo purposes
    
    // Replace with your actual configuration
    GOOGLE_SHEETS_API_KEY: 'YOUR_API_KEY',
    GOOGLE_SHEETS_SHEET_ID: 'YOUR_SHEET_ID',
    
    // SharePoint integration flag
    USE_SHAREPOINT: true
};
    
    // Or use GitHub API
    GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN',
    GITHUB_REPO: 'username/repo',
    GITHUB_DATA_FILE: 'data/inventory-data.json'
};

// Load data from admin storage
let ITEM_DATA = [];
let CUSTOMER_DATA = [];
let BOOKING_DATA = {};
let SHIPPING_DATA = {};
let SPIKE_DATA = [];
let PREVIOUS_SPIKE_DATA = [];
let REGIONS = ['South West', 'North East', 'North West', 'South East', 'Central'];
let SUBMISSION_WINDOW_OPEN = false;

// Function to load data from admin localStorage
async function loadAdminData() {
    if (DATA_CONFIG.USE_SHAREPOINT) {
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
        ITEM_DATA = items.map(item => ({
            itemID: item.ItemID,
            description: item.Description,
            grade: item.Grade
        }));
        
        CUSTOMER_DATA = customers.map(customer => ({
            code: customer.CustomerCode,
            name: customer.CustomerName,
            region: customer.Region
        }));
        
        BOOKING_DATA = bookingData;
        SHIPPING_DATA = shippingData;
        
        const formattedSpikeData = spikeItems.map(spike => ({
            customer: spike.CustomerCode,
            itemID: spike.ItemID,
            month1: spike.Month1,
            month2: spike.Month2,
            month3: spike.Month3,
            submitDate: spike.SubmitDate,
            userName: spike.UserName
        }));
        
        SPIKE_DATA = formattedSpikeData.filter(spike => !spike.movedDate);
        PREVIOUS_SPIKE_DATA = formattedSpikeData.filter(spike => spike.movedDate);
        
        // Load submission window control data from localStorage
        const localControlData = JSON.parse(localStorage.getItem('inventoryAdminData') || '{}');
        SUBMISSION_WINDOW_OPEN = localControlData.submissionWindowOpen || false;
        
        console.log('Data loaded from SharePoint successfully');
        console.log('Items:', ITEM_DATA.length);
        console.log('Customers:', CUSTOMER_DATA.length);
        console.log('Spike data:', SPIKE_DATA.length);
        
    } catch (error) {
        console.error('Error loading from SharePoint:', error);
        throw error;
    }
}

function loadAdminDataFromLocalStorage() {
    const storedData = localStorage.getItem('inventoryAdminData');
    console.log('Loading admin data from localStorage...');
    console.log('Stored data exists:', !!storedData);
    
    if (storedData) {
        const adminData = JSON.parse(storedData);
        console.log('Parsed admin data:', adminData);
        
        ITEM_DATA = adminData.items || [];
        CUSTOMER_DATA = adminData.customers || [];
        BOOKING_DATA = adminData.bookingData || {};
        SHIPPING_DATA = adminData.shippingData || {};
        SPIKE_DATA = adminData.currentSpikeData || [];
        PREVIOUS_SPIKE_DATA = adminData.previousSpikeData || [];
        REGIONS = adminData.regions || REGIONS;
        SUBMISSION_WINDOW_OPEN = adminData.submissionWindowOpen || false;
        
        console.log('Data loaded from admin storage:');
        console.log('Items:', ITEM_DATA.length, ITEM_DATA);
        console.log('Customers:', CUSTOMER_DATA.length, CUSTOMER_DATA);
        console.log('Booking Data keys:', Object.keys(BOOKING_DATA));
        console.log('Booking Data:', BOOKING_DATA);
        console.log('Shipping Data keys:', Object.keys(SHIPPING_DATA));
        console.log('Shipping Data:', SHIPPING_DATA);
    } else {
        console.log('No admin data found, using sample data');
        // Use sample data if no admin data exists
        ITEM_DATA = [
            { itemID: 'ITM001', description: 'Steel Sheet 5mm', grade: 'A' },
            { itemID: 'ITM002', description: 'Steel Sheet 10mm', grade: 'B' },
            { itemID: 'ITM003', description: 'Aluminum Plate 3mm', grade: 'A' },
            { itemID: 'ITM004', description: 'Copper Wire 2mm', grade: 'C' },
            { itemID: 'ITM005', description: 'Steel Rod 20mm', grade: 'A' }
        ];

        CUSTOMER_DATA = [
            { code: 'CUST001', name: 'ABC Manufacturing', region: 'South West' },
            { code: 'CUST002', name: 'XYZ Industries', region: 'North East' },
            { code: 'CUST003', name: 'Global Corp', region: 'South West' },
            { code: 'CUST004', name: 'Local Metals Ltd', region: 'North East' }
        ];

        BOOKING_DATA = {
            'CUST001': { 'ITM001': 150, 'ITM002': 200, 'ITM003': 100, 'ITM004': 75, 'ITM005': 180 },
            'CUST002': { 'ITM001': 120, 'ITM002': 180, 'ITM003': 80, 'ITM004': 60, 'ITM005': 150 },
            'CUST003': { 'ITM001': 200, 'ITM002': 250, 'ITM003': 120, 'ITM004': 90, 'ITM005': 220 },
            'CUST004': { 'ITM001': 180, 'ITM002': 220, 'ITM003': 110, 'ITM004': 85, 'ITM005': 200 }
        };

        SHIPPING_DATA = {
            'CUST001': { 'ITM001': 140, 'ITM002': 190, 'ITM003': 95, 'ITM004': 70, 'ITM005': 170 },
            'CUST002': { 'ITM001': 115, 'ITM002': 175, 'ITM003': 75, 'ITM004': 55, 'ITM005': 145 },
            'CUST003': { 'ITM001': 190, 'ITM002': 240, 'ITM003': 115, 'ITM004': 85, 'ITM005': 210 },
            'CUST004': { 'ITM001': 170, 'ITM002': 210, 'ITM003': 100, 'ITM004': 80, 'ITM005': 190 }
        };
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('userAuthenticated') === 'true';
    const authTime = parseInt(sessionStorage.getItem('userAuthTime') || '0');
    const currentTime = Date.now();
    
    // Session expires after 8 hours
    if (!isAuthenticated || (currentTime - authTime >= 8 * 60 * 60 * 1000)) {
        sessionStorage.removeItem('userAuthenticated');
        sessionStorage.removeItem('userAuthTime');
        sessionStorage.removeItem('userName');
        window.location.href = 'entry-login.html';
        return;
    }
    
    // Get logged-in user name
    const userName = sessionStorage.getItem('userName') || '';
    
    loadAdminData();
    initializeCustomerDropdown();
    initializeRegionDropdown();
    initializeTable();
    setupEventListeners();
    
    // Auto-fill Submitted By field with logged-in user name
    const submittedByInput = document.getElementById('submittedBy');
    if (submittedByInput && userName) {
        submittedByInput.value = userName;
        submittedByInput.readOnly = true; // Make it read-only
        submittedByInput.style.backgroundColor = '#f5f5f5';
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('userAuthenticated');
                sessionStorage.removeItem('userAuthTime');
                sessionStorage.removeItem('userName');
                window.location.href = 'entry-login.html';
            }
        });
    }
    
    // Check submission window status and update UI
    updateSubmissionWindowStatus();
    
    // Debug: log loaded data
    console.log('Page initialized with data:');
    console.log('BOOKING_DATA:', BOOKING_DATA);
    console.log('SHIPPING_DATA:', SHIPPING_DATA);
    console.log('PREVIOUS_SPIKE_DATA:', PREVIOUS_SPIKE_DATA);
    console.log('Logged in user:', userName);
});

// Initialize customer dropdown
function initializeCustomerDropdown() {
    const customerSelect = document.getElementById('customerCode');
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
    CUSTOMER_DATA.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.code;
        option.textContent = `${customer.code} - ${customer.name}`;
        customerSelect.appendChild(option);
    });
}

// Initialize region dropdown
function initializeRegionDropdown() {
    const regionSelect = document.getElementById('region');
    regionSelect.innerHTML = '<option value="">-- Auto-set from Customer --</option>';
    REGIONS.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

// Initialize the table with item data
function initializeTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    ITEM_DATA.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.item = item.itemID;
        
        // ItemID (readonly)
        row.innerHTML += `<td class="readonly-cell">${item.itemID}</td>`;
        
        // Description (readonly)
        row.innerHTML += `<td class="readonly-cell">${item.description}</td>`;
        
        // Grade (readonly)
        row.innerHTML += `<td class="readonly-cell">${item.grade}</td>`;
        
        // Last 4 months Average Booking - Customer (lookup)
        row.innerHTML += `<td class="readonly-cell booking-customer" data-item="${item.itemID}">-</td>`;
        
        // Last 4 months Average Booking - Region (lookup)
        row.innerHTML += `<td class="readonly-cell booking-region" data-item="${item.itemID}">-</td>`;
        
        // Last 4 months Average Shipping - Customer (lookup)
        row.innerHTML += `<td class="readonly-cell shipping-customer" data-item="${item.itemID}">-</td>`;
        
        // Previous Spike data (Month 1-3) - Customer (lookup)
        row.innerHTML += `<td class="readonly-cell spike-m1-customer" data-item="${item.itemID}">-</td>`;
        row.innerHTML += `<td class="readonly-cell spike-m2-customer" data-item="${item.itemID}">-</td>`;
        row.innerHTML += `<td class="readonly-cell spike-m3-customer" data-item="${item.itemID}">-</td>`;
        
        // Month 1 Spike (editable)
        row.innerHTML += `<td class="editable-cell"><input type="number" class="spike-input" data-month="1" data-item="${item.itemID}" min="0" step="1"></td>`;
        
        // Month 2 Spike (editable)
        row.innerHTML += `<td class="editable-cell"><input type="number" class="spike-input" data-month="2" data-item="${item.itemID}" min="0" step="1"></td>`;
        
        // Month 3 Spike (editable)
        row.innerHTML += `<td class="editable-cell"><input type="number" class="spike-input" data-month="3" data-item="${item.itemID}" min="0" step="1"></td>`;
        
        // Type (set based on ItemID)
        const typeValue = item.itemID.endsWith('D') ? 'Domestic' : 'Trade';
        row.innerHTML += `<td class="readonly-cell type-cell">${typeValue}</td>`;
        
        // Customer (readonly - from selection)
        row.innerHTML += `<td class="readonly-cell customer-cell">-</td>`;
        
        // Submitted By (readonly - from input)
        row.innerHTML += `<td class="readonly-cell submitted-cell">-</td>`;
        
        // Region (readonly - from selection)
        row.innerHTML += `<td class="readonly-cell region-cell">-</td>`;
        
        // Total Spike (calculated)
        row.innerHTML += `<td class="readonly-cell total-spike" data-item="${item.itemID}">0</td>`;
        
        // Submit Date (auto-filled on submit)
        row.innerHTML += `<td class="readonly-cell submit-date">-</td>`;
        
        tableBody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    const customerSelect = document.getElementById('customerCode');
    const regionSelect = document.getElementById('region');
    const submitBtn = document.getElementById('submitBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Auto-set region when customer is selected
    customerSelect.addEventListener('change', function() {
        const customerCode = this.value;
        console.log('Customer selected:', customerCode);
        const customer = CUSTOMER_DATA.find(c => c.code === customerCode);
        console.log('Customer found:', customer);
        if (customer && customer.region) {
            regionSelect.value = customer.region;
            regionSelect.disabled = false;
            updateLookupData();
        }
    });
    
    // Update lookup data when region changes manually
    regionSelect.addEventListener('change', updateLookupData);
    
    // Calculate total spike when spike inputs change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('spike-input')) {
            calculateTotalSpike(e.target);
        }
    });
    
    // Submit button
    submitBtn.addEventListener('click', submitData);
    
    // Refresh button - reload data from admin storage
    refreshBtn.addEventListener('click', function() {
        console.log('Manual refresh triggered');
        loadAdminData();
        initializeCustomerDropdown();
        initializeRegionDropdown();
        initializeTable();
        updateSubmissionWindowStatus();
        // Reset customer and region selection
        customerSelect.value = '';
        regionSelect.value = '';
        regionSelect.disabled = true;
        alert('Data refreshed from admin storage. Please select a customer again.');
    });
    
    // Download button - download current spike data for logged-in user
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadUserSpikeData);
    }
}

// Update lookup data based on customer and region selection
function updateLookupData() {
    const customerCode = document.getElementById('customerCode').value;
    const region = document.getElementById('region').value;
    
    console.log('=== UPDATE LOOKUP DATA STARTED ===');
    console.log('Customer selected:', customerCode);
    console.log('Region selected:', region);
    console.log('BOOKING_DATA:', BOOKING_DATA);
    console.log('SHIPPING_DATA:', SHIPPING_DATA);
    console.log('ITEM_DATA:', ITEM_DATA);
    console.log('CUSTOMER_DATA:', CUSTOMER_DATA);
    
    if (!customerCode) {
        console.log('No customer selected, returning');
        return;
    }
    
    // Get customer's region if not manually selected
    const customer = CUSTOMER_DATA.find(c => c.code === customerCode);
    const customerRegion = customer ? customer.region : region;
    
    console.log('Customer found:', customer);
    console.log('Customer region:', customerRegion);
    
    // Update customer and region cells
    document.querySelectorAll('.customer-cell').forEach(cell => {
        cell.textContent = customer ? customer.name : '-';
    });
    
    document.querySelectorAll('.region-cell').forEach(cell => {
        cell.textContent = customerRegion || '-';
    });
    
    // Calculate region aggregates based on all customers in the same region
    const regionBookingData = calculateRegionAggregate(customerRegion, 'booking');
    const regionShippingData = calculateRegionAggregate(customerRegion, 'shipping');
    
    console.log('Region booking data:', regionBookingData);
    console.log('Region shipping data:', regionShippingData);
    
    // Update lookup data for each row
    ITEM_DATA.forEach(item => {
        const row = document.querySelector(`tr[data-item="${item.itemID}"]`);
        console.log(`Processing item: ${item.itemID}, row found:`, !!row);
        
        if (!row) {
            console.log(`❌ Row not found for item ${item.itemID}`);
            return;
        }
        
        // Booking - Customer (direct lookup from admin booking data)
        const bookingCustomer = row.querySelector('.booking-customer');
        console.log(`Booking cell element:`, bookingCustomer);
        
        // Check if booking data exists for this customer
        if (BOOKING_DATA && BOOKING_DATA[customerCode]) {
            console.log(`Booking data exists for customer ${customerCode}:`, BOOKING_DATA[customerCode]);
            if (BOOKING_DATA[customerCode][item.itemID]) {
                const bookingValue = BOOKING_DATA[customerCode][item.itemID];
                bookingCustomer.textContent = bookingValue;
                console.log(`✅ Set booking value: ${bookingValue}`);
            } else {
                bookingCustomer.textContent = '-';
                console.log(`❌ No booking data for item ${item.itemID}`);
                console.log(`Available items:`, Object.keys(BOOKING_DATA[customerCode]));
            }
        } else {
            bookingCustomer.textContent = '-';
            console.log(`❌ No booking data for customer ${customerCode}`);
        }
        
        // Booking - Region (calculated aggregate)
        const bookingRegion = row.querySelector('.booking-region');
        if (regionBookingData && regionBookingData[item.itemID]) {
            bookingRegion.textContent = regionBookingData[item.itemID];
        } else {
            bookingRegion.textContent = '-';
        }
        
        // Shipping - Customer
        const shippingCustomer = row.querySelector('.shipping-customer');
        console.log(`Shipping cell element:`, shippingCustomer);
        
        // Check if shipping data exists for this customer
        if (SHIPPING_DATA && SHIPPING_DATA[customerCode]) {
            console.log(`Shipping data exists for customer ${customerCode}:`, SHIPPING_DATA[customerCode]);
            if (SHIPPING_DATA[customerCode][item.itemID]) {
                const shippingValue = SHIPPING_DATA[customerCode][item.itemID];
                shippingCustomer.textContent = shippingValue;
                console.log(`✅ Set shipping value: ${shippingValue}`);
            } else {
                shippingCustomer.textContent = '-';
                console.log(`❌ No shipping data for item ${item.itemID}`);
                console.log(`Available items:`, Object.keys(SHIPPING_DATA[customerCode]));
            }
        } else {
            shippingCustomer.textContent = '-';
            console.log(`❌ No shipping data for customer ${customerCode}`);
        }
        
        // Previous spike data (from admin storage)
        const spikeM1 = row.querySelector('.spike-m1-customer');
        const spikeM2 = row.querySelector('.spike-m2-customer');
        const spikeM3 = row.querySelector('.spike-m3-customer');
        
        // Get spike data for this customer and item from previous spike data
        const spikeRecord = PREVIOUS_SPIKE_DATA.find(s => s.customer === customerCode && s.itemID === item.itemID);
        if (spikeRecord) {
            spikeM1.textContent = spikeRecord.month1 || '-';
            spikeM2.textContent = spikeRecord.month2 || '-';
            spikeM3.textContent = spikeRecord.month3 || '-';
        } else {
            spikeM1.textContent = '-';
            spikeM2.textContent = '-';
            spikeM3.textContent = '-';
        }
    });
    
    console.log('=== UPDATE LOOKUP DATA COMPLETED ===');
}

// Calculate region aggregate data by summing all customer data in that region
function calculateRegionAggregate(region, dataType) {
    const regionCustomers = CUSTOMER_DATA.filter(c => c.region === region);
    const aggregateData = {};
    
    regionCustomers.forEach(customer => {
        const customerData = dataType === 'booking' ? BOOKING_DATA : SHIPPING_DATA;
        if (customerData[customer.code]) {
            Object.entries(customerData[customer.code]).forEach(([itemID, value]) => {
                if (!aggregateData[itemID]) {
                    aggregateData[itemID] = 0;
                }
                aggregateData[itemID] += value;
            });
        }
    });
    
    return aggregateData;
}

// Calculate total spike for a row
function calculateTotalSpike(input) {
    const row = input.closest('tr');
    const inputs = row.querySelectorAll('.spike-input');
    let total = 0;
    
    inputs.forEach(inp => {
        total += parseInt(inp.value) || 0;
    });
    
    const totalCell = row.querySelector('.total-spike');
    totalCell.textContent = total;
}

// Update submission window status UI
function updateSubmissionWindowStatus() {
    const spikeInputs = document.querySelectorAll('.spike-input');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!SUBMISSION_WINDOW_OPEN) {
        // Disable spike inputs
        spikeInputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#e9ecef';
        });
        
        // Disable submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#6c757d';
            submitBtn.textContent = '🔒 Submission Closed';
        }
        
        // Show status message
        showSubmissionStatusMessage('closed');
    } else {
        // Enable spike inputs
        spikeInputs.forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = '';
        });
        
        // Enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
            submitBtn.textContent = 'Submit Data';
        }
        
        // Hide status message
        hideSubmissionStatusMessage();
    }
}

// Show submission status message
function showSubmissionStatusMessage(status) {
    let messageDiv = document.getElementById('submission-status-message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'submission-status-message';
        messageDiv.className = 'submission-status-message';
        document.querySelector('.input-section').appendChild(messageDiv);
    }
    
    if (status === 'closed') {
        messageDiv.innerHTML = `
            <div class="status-alert closed">
                <span class="status-icon">🔒</span>
                <span class="status-text">Submission window is currently CLOSED. Please contact your administrator to open the submission window.</span>
            </div>
        `;
    }
}

// Hide submission status message
function hideSubmissionStatusMessage() {
    const messageDiv = document.getElementById('submission-status-message');
    if (messageDiv) {
        messageDiv.remove();
    }
}

// Download user's spike data to Excel
function downloadUserSpikeData() {
    const userName = sessionStorage.getItem('userName');
    
    if (!userName) {
        alert('User not logged in. Please login to download your data.');
        return;
    }
    
    // Filter spike data for this user
    const userSpikeData = SPIKE_DATA.filter(spike => spike.userName === userName);
    
    if (userSpikeData.length === 0) {
        alert('No spike data found for your submissions.');
        return;
    }
    
    // Create CSV content (same format as Current Spike Data export)
    let csvContent = 'Customer,Customer Name,Region,Item ID,Description,Grade,Month 1,Month 2,Month 3,Total Spike,Submit Date,User Name\n';
    
    userSpikeData.forEach(spike => {
        const customer = CUSTOMER_DATA.find(c => c.code === spike.customer);
        const customerName = customer ? customer.name : 'Unknown';
        const customerRegion = customer ? customer.region : 'Unknown';
        const item = ITEM_DATA.find(i => i.itemID === spike.itemID);
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
    link.setAttribute('download', `my_spike_data_${userName}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('User spike data downloaded successfully');
}

// Submit data
async function submitData() {
    // Check if submission window is open
    if (!SUBMISSION_WINDOW_OPEN) {
        alert('Submission window is currently CLOSED. Please contact your administrator to open the submission window.');
        return;
    }
    
    const customerCode = document.getElementById('customerCode').value;
    const region = document.getElementById('region').value;
    const submittedBy = document.getElementById('submittedBy').value;
    
    if (!customerCode || !region || !submittedBy) {
        alert('Please fill in all required fields (Customer Code, Region, and Submitted By)');
        return;
    }
    
    // Update submitted by cells
    document.querySelectorAll('.submitted-cell').forEach(cell => {
        cell.textContent = submittedBy;
    });
    
    // Update submit date
    const submitDate = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.submit-date').forEach(cell => {
        cell.textContent = submitDate;
    });
    
    // Collect data for master table
    const masterData = [];
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const itemId = row.dataset.item;
        const item = ITEM_DATA.find(i => i.itemID === itemId);
        
        const spike1 = row.querySelector('.spike-input[data-month="1"]').value || 0;
        const spike2 = row.querySelector('.spike-input[data-month="2"]').value || 0;
        const spike3 = row.querySelector('.spike-input[data-month="3"]').value || 0;
        
        // Only include rows with spike data
        if (spike1 > 0 || spike2 > 0 || spike3 > 0) {
            masterData.push({
                itemID: itemId,
                description: item.description,
                grade: item.grade,
                month1Spike: parseInt(spike1),
                month2Spike: parseInt(spike2),
                month3Spike: parseInt(spike3),
                userName: submittedBy,
                customer: customerCode,
                region: region,
                submitDate: submitDate
            });
        }
    });
    
    if (masterData.length === 0) {
        alert('Please enter at least one spike value before submitting');
        return;
    }
    
    try {
        // Save data (implementation depends on chosen storage method)
        await saveData(masterData);
        alert('Data submitted successfully!');
        
        // Clear spike inputs for next entry
        document.querySelectorAll('.spike-input').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.total-spike').forEach(cell => {
            cell.textContent = '0';
        });
        
    } catch (error) {
        console.error('Error submitting data:', error);
        alert('Error submitting data. Please try again.');
    }
}

// Save data to storage (implementation depends on your choice)
async function saveData(data) {
    console.log('=== SAVE DATA STARTED ===');
    console.log('Data to save:', data);
    
    if (DATA_CONFIG.USE_SHAREPOINT) {
        try {
            await saveDataToSharePoint(data);
        } catch (error) {
            console.error('SharePoint save failed, using localStorage fallback:', error);
            alert('Could not save to SharePoint. Data saved locally instead.');
            await saveDataToLocalStorage(data);
        }
    } else {
        await saveDataToLocalStorage(data);
    }
}

async function saveDataToSharePoint(data) {
    const submitDate = new Date().toISOString().split('T')[0];
    
    // Add each entry to SharePoint
    for (const entry of data) {
        const spike = {
            customer: entry.customer,
            itemID: entry.itemID,
            month1: entry.month1Spike,
            month2: entry.month2Spike,
            month3: entry.month3Spike,
            submitDate: submitDate,
            userName: entry.userName,
            region: entry.region
        };
        
        await addSpikeData(spike);
        console.log('Added entry to SharePoint:', spike);
    }
    
    console.log('All entries saved to SharePoint successfully');
}

async function saveDataToLocalStorage(data) {
    // Get existing admin data to preserve structure
    const existingAdminData = JSON.parse(localStorage.getItem('inventoryAdminData') || '{}');
    console.log('Existing admin data:', existingAdminData);
    console.log('Keys in existingAdminData:', Object.keys(existingAdminData));
    
    // Migrate old spikeData to currentSpikeData if needed
    if (existingAdminData.spikeData && !existingAdminData.currentSpikeData) {
        console.log('Migrating old spikeData to currentSpikeData');
        existingAdminData.currentSpikeData = existingAdminData.spikeData;
        delete existingAdminData.spikeData;
    }
    
    // Ensure adminData has proper structure
    if (!existingAdminData.currentSpikeData) {
        existingAdminData.currentSpikeData = [];
        console.log('Initialized currentSpikeData array');
    }
    
    if (!existingAdminData.previousSpikeData) {
        existingAdminData.previousSpikeData = [];
        console.log('Initialized previousSpikeData array');
    }
    
    // Add new spike data entries with submit date
    const submitDate = new Date().toISOString().split('T')[0];
    data.forEach(entry => {
        const newEntry = {
            customer: entry.customer,
            itemID: entry.itemID,
            month1: entry.month1Spike,
            month2: entry.month2Spike,
            month3: entry.month3Spike,
            submitDate: submitDate,
            userName: entry.userName
        };
        existingAdminData.currentSpikeData.push(newEntry);
        console.log('Added entry:', newEntry);
    });
    
    // Save updated admin data
    localStorage.setItem('inventoryAdminData', JSON.stringify(existingAdminData));
    console.log('Saved to localStorage. Total currentSpikeData entries:', existingAdminData.currentSpikeData.length);
    
    // Option 1: Save to localStorage (for demo/testing)
    localStorage.setItem('inventoryData', JSON.stringify(data));
    
    console.log('=== SAVE DATA COMPLETED ===');
}

// Google Sheets integration (to be implemented with actual API credentials)
async function saveToGoogleSheets(data) {
    // This would use the Google Sheets API
    // You'll need to set up API credentials and a Google Sheet
    // Reference: https://developers.google.com/sheets/api
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${DATA_CONFIG.GOOGLE_SHEETS_SHEET_ID}/values/Sheet1:append?valueInputOption=USER_ENTERED`;
    
    const values = data.map(row => [
        row.itemID,
        row.description,
        row.grade,
        row.month1Spike,
        row.month2Spike,
        row.month3Spike,
        row.userName,
        row.customer,
        row.region,
        row.submitDate
    ]);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DATA_CONFIG.GOOGLE_SHEETS_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
    });
    
    return response.json();
}

// GitHub API integration (alternative storage method)
async function saveToGitHub(data) {
    // This would use the GitHub API to store data in a repository
    // You'll need to set up a personal access token
    
    const url = `https://api.github.com/repos/${DATA_CONFIG.GITHUB_REPO}/contents/${DATA_CONFIG.GITHUB_DATA_FILE}`;
    
    // Get existing data first
    const existingResponse = await fetch(url, {
        headers: {
            'Authorization': `token ${DATA_CONFIG.GITHUB_TOKEN}`
        }
    });
    
    let existingData = [];
    let sha = null;
    
    if (existingResponse.ok) {
        const existing = await existingResponse.json();
        sha = existing.sha;
        existingData = JSON.parse(atob(existing.content));
    }
    
    // Append new data
    const updatedData = [...existingData, ...data];
    
    // Commit updated data
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${DATA_CONFIG.GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update inventory data',
            content: btoa(JSON.stringify(updatedData, null, 2)),
            sha: sha
        })
    });
    
    return response.json();
}
