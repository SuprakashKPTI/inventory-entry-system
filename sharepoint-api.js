// SharePoint API Service Layer
// Handles all SharePoint REST API calls for data persistence

const SHAREPOINT_CONFIG = {
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning',
    lists: {
        items: 'InventoryItems',
        customers: 'Customers',
        bookingData: 'BookingData',
        shippingData: 'ShippingData',
        spikeData: 'SpikeData'
    },
    azure: {
        clientId: '', // Will be set after Azure AD registration
        tenantId: '', // Will be set after Azure AD registration
        redirectUri: window.location.origin + '/index.html'
    }
};

// SharePoint REST API URLs
function getSharePointUrl(listName, itemId = null) {
    const apiPath = itemId 
        ? `/_api/web/lists/getbytitle('${listName}')/items(${itemId})`
        : `/_api/web/lists/getbytitle('${listName}')/items`;
    return `${SHAREPOINT_CONFIG.siteUrl}${apiPath}`;
}

// Get Azure AD token
async function getAccessToken() {
    const tokenEndpoint = `https://login.microsoftonline.com/${SHAREPOINT_CONFIG.azure.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', SHAREPOINT_CONFIG.azure.clientId);
    params.append('client_secret', SHAREPOINT_CONFIG.azure.clientSecret);
    params.append('scope', `${SHAREPOINT_CONFIG.azure.clientId}/.default`);
    params.append('grant_type', 'client_credentials');
    
    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        const data = await response.json();
        if (data.error) {
            throw new Error(`Azure AD error: ${data.error_description}`);
        }
        
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Generic SharePoint API call
async function sharePointAPI(endpoint, method = 'GET', data = null) {
    try {
        const accessToken = await getAccessToken();
        
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose'
        };
        
        const options = {
            method: method,
            headers: headers
        };
        
        if (data && (method === 'POST' || method === 'PATCH' || method === 'MERGE')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SharePoint API error (${response.status}): ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('SharePoint API call failed:', error);
        throw error;
    }
}

// ==================== CRUD OPERATIONS ====================

// CREATE: Add item to list
async function addListItem(listName, itemData) {
    const endpoint = getSharePointUrl(listName);
    const result = await sharePointAPI(endpoint, 'POST', itemData);
    return result.d;
}

// READ: Get all items from list
async function getListItems(listName) {
    const endpoint = getSharePointUrl(listName);
    const result = await sharePointAPI(endpoint, 'GET');
    return result.d.results;
}

// READ: Get single item by ID
async function getListItem(listName, itemId) {
    const endpoint = getSharePointUrl(listName, itemId);
    const result = await sharePointAPI(endpoint, 'GET');
    return result.d;
}

// UPDATE: Update item
async function updateListItem(listName, itemId, itemData) {
    const endpoint = getSharePointUrl(listName, itemId);
    const result = await sharePointAPI(endpoint, 'PATCH', itemData);
    return result.d;
}

// DELETE: Delete item
async function deleteListItem(listName, itemId) {
    const endpoint = getSharePointUrl(listName, itemId);
    await sharePointAPI(endpoint, 'DELETE');
}

// Helper function to delete item from SharePoint
async function deleteItemFromSharePoint(listName, itemId) {
    await deleteListItem(listName, itemId);
}

// Helper function to delete customer from SharePoint
async function deleteCustomerFromSharePoint(listName, customerId) {
    await deleteListItem(listName, customerId);
}

// Helper function to delete booking data from SharePoint
async function deleteBookingDataFromSharePoint(customerCode, itemID) {
    const items = await getListItems(SHAREPOINT_LISTS.bookingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(SHAREPOINT_LISTS.bookingData, existingItem.Id);
    }
}

// Helper function to delete shipping data from SharePoint
async function deleteShippingDataFromSharePoint(customerCode, itemID) {
    const items = await getListItems(SHAREPOINT_LISTS.shippingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(SHAREPOINT_LISTS.shippingData, existingItem.Id);
    }
}

// ==================== SPECIFIC DATA OPERATIONS ====================

// Items
async function getItems() {
    return await getListItems(SHAREPOINT_CONFIG.lists.items);
}

async function addItem(item) {
    return await addListItem(SHAREPOINT_CONFIG.lists.items, {
        ItemID: item.itemID,
        Description: item.description,
        Grade: item.grade
    });
}

async function updateItem(itemId, item) {
    return await updateListItem(SHAREPOINT_CONFIG.lists.items, itemId, {
        ItemID: item.itemID,
        Description: item.description,
        Grade: item.grade
    });
}

async function deleteItem(itemId) {
    await deleteListItem(SHAREPOINT_CONFIG.lists.items, itemId);
}

// Customers
async function getCustomers() {
    return await getListItems(SHAREPOINT_CONFIG.lists.customers);
}

async function addCustomer(customer) {
    return await addListItem(SHAREPOINT_CONFIG.lists.customers, {
        CustomerCode: customer.code,
        CustomerName: customer.name,
        Region: customer.region
    });
}

async function updateCustomer(customerId, customer) {
    return await updateListItem(SHAREPOINT_CONFIG.lists.customers, customerId, {
        CustomerCode: customer.code,
        CustomerName: customer.name,
        Region: customer.region
    });
}

async function deleteCustomer(customerId) {
    await deleteListItem(SHAREPOINT_CONFIG.lists.customers, customerId);
}

// Booking Data
async function getBookingData() {
    const items = await getListItems(SHAREPOINT_CONFIG.lists.bookingData);
    // Convert to nested object structure
    const bookingData = {};
    items.forEach(item => {
        if (!bookingData[item.CustomerCode]) {
            bookingData[item.CustomerCode] = {};
        }
        bookingData[item.CustomerCode][item.ItemID] = item.AverageBooking;
    });
    return bookingData;
}

async function addBookingData(customerCode, itemID, value) {
    await addListItem(SHAREPOINT_CONFIG.lists.bookingData, {
        CustomerCode: customerCode,
        ItemID: itemID,
        AverageBooking: value
    });
}

async function updateBookingData(customerCode, itemID, value) {
    // Find existing item
    const items = await getListItems(SHAREPOINT_CONFIG.lists.bookingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await updateListItem(SHAREPOINT_CONFIG.lists.bookingData, existingItem.Id, {
            CustomerCode: customerCode,
            ItemID: itemID,
            AverageBooking: value
        });
    }
}

async function deleteBookingData(customerCode, itemID) {
    const items = await getListItems(SHAREPOINT_CONFIG.lists.bookingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(SHAREPOINT_CONFIG.lists.bookingData, existingItem.Id);
    }
}

// Shipping Data
async function getShippingData() {
    const items = await getListItems(SHAREPOINT_CONFIG.lists.shippingData);
    // Convert to nested object structure
    const shippingData = {};
    items.forEach(item => {
        if (!shippingData[item.CustomerCode]) {
            shippingData[item.CustomerCode] = {};
        }
        shippingData[item.CustomerCode][item.ItemID] = item.AverageShipping;
    });
    return shippingData;
}

async function addShippingData(customerCode, itemID, value) {
    await addListItem(SHAREPOINT_CONFIG.lists.shippingData, {
        CustomerCode: customerCode,
        ItemID: itemID,
        AverageShipping: value
    });
}

async function updateShippingData(customerCode, itemID, value) {
    const items = await getListItems(SHAREPOINT_CONFIG.lists.shippingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await updateListItem(SHAREPOINT_CONFIG.lists.shippingData, existingItem.Id, {
            CustomerCode: customerCode,
            ItemID: itemID,
            AverageShipping: value
        });
    }
}

async function deleteShippingData(customerCode, itemID) {
    const items = await getListItems(SHAREPOINT_CONFIG.lists.shippingData);
    const existingItem = items.find(item => item.CustomerCode === customerCode && item.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(SHAREPOINT_CONFIG.lists.shippingData, existingItem.Id);
    }
}

// Spike Data
async function getSpikeData() {
    return await getListItems(SHAREPOINT_CONFIG.lists.spikeData);
}

async function addSpikeData(spike) {
    return await addListItem(SHAREPOINT_CONFIG.lists.spikeData, {
        CustomerCode: spike.customer,
        ItemID: spike.itemID,
        Month1: spike.month1,
        Month2: spike.month2,
        Month3: spike.month3,
        TotalSpike: (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0),
        SubmitDate: spike.submitDate,
        UserName: spike.userName,
        Region: spike.region
    });
}

async function getSpikeDataByUser(userName) {
    const allSpikeData = await getSpikeData();
    return allSpikeData.filter(spike => spike.UserName === userName);
}

async function getSpikeDataByCustomer(customerCode) {
    const allSpikeData = await getSpikeData();
    return allSpikeData.filter(spike => spike.CustomerCode === customerCode);
}

// ==================== CONFIGURATION ====================

function setAzureCredentials(clientId, tenantId, clientSecret) {
    SHAREPOINT_CONFIG.azure.clientId = clientId;
    SHAREPOINT_CONFIG.azure.tenantId = tenantId;
    SHAREPOINT_CONFIG.azure.clientSecret = clientSecret;
    console.log('Azure credentials configured');
}

function setSharePointSiteUrl(siteUrl) {
    SHAREPOINT_CONFIG.siteUrl = siteUrl;
    console.log('SharePoint site URL configured:', siteUrl);
}

// ==================== ERROR HANDLING ====================

function handleSharePointError(error, fallbackCallback) {
    console.error('SharePoint API error:', error);
    
    // Show user-friendly error message
    alert('Error communicating with SharePoint. Please check your connection and try again.');
    
    // Optionally execute fallback (e.g., use localStorage)
    if (fallbackCallback) {
        fallbackCallback();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setAzureCredentials,
        setSharePointSiteUrl,
        getItems,
        addCustomer,
        getCustomers,
        getBookingData,
        getShippingData,
        getSpikeData,
        addSpikeData,
        getSpikeDataByUser,
        getSpikeDataByCustomer
    };
}
