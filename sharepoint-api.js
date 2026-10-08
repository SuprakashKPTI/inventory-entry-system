// Microsoft Graph API Service Layer
// Handles all Microsoft Graph API calls for SharePoint data persistence

const GRAPH_CONFIG = {
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
        clientSecret: '', // Will be set after Azure AD registration
        redirectUri: window.location.origin + '/index.html'
    },
    graphApiVersion: 'v1.0'
};

// Cache for site ID and list IDs
let siteId = null;
let listIds = {
    items: null,
    customers: null,
    bookingData: null,
    shippingData: null,
    spikeData: null
};

// Microsoft Graph API URLs
function getGraphUrl(endpoint) {
    return `https://graph.microsoft.com/${GRAPH_CONFIG.graphApiVersion}${endpoint}`;
}

// Get Azure AD token for Microsoft Graph
async function getAccessToken() {
    const tokenEndpoint = `https://login.microsoftonline.com/${GRAPH_CONFIG.azure.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', GRAPH_CONFIG.azure.clientId);
    params.append('client_secret', GRAPH_CONFIG.azure.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
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

// Generic Microsoft Graph API call
async function graphAPI(endpoint, method = 'GET', data = null) {
    try {
        const accessToken = await getAccessToken();
        
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        
        const options = {
            method: method,
            headers: headers
        };
        
        if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Microsoft Graph API error (${response.status}): ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Microsoft Graph API call failed:', error);
        throw error;
    }
}

// Get SharePoint site ID
async function getSiteId() {
    if (siteId) return siteId;
    
    try {
        // Parse hostname from site URL
        const url = new URL(GRAPH_CONFIG.siteUrl);
        const hostname = url.hostname;
        const sitePath = url.pathname.split('/sites/')[1];
        
        const endpoint = getGraphUrl(`/sites/${hostname}:/sites/${sitePath}?$select=id`);
        const result = await graphAPI(endpoint);
        siteId = result.id;
        console.log('Site ID:', siteId);
        return siteId;
    } catch (error) {
        console.error('Error getting site ID:', error);
        throw error;
    }
}

// Get SharePoint list ID by name
async function getListId(listName) {
    if (listIds[listName]) return listIds[listName];
    
    try {
        const currentSiteId = await getSiteId();
        const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listName}?$select=id`);
        const result = await graphAPI(endpoint);
        listIds[listName] = result.id;
        console.log(`List ID for ${listName}:`, listIds[listName]);
        return listIds[listName];
    } catch (error) {
        console.error(`Error getting list ID for ${listName}:`, error);
        throw error;
    }
}

// ==================== CRUD OPERATIONS ====================

// CREATE: Add item to list
async function addListItem(listName, itemData) {
    const listId = await getListId(listName);
    const currentSiteId = await getSiteId();
    const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listId}/items`);
    const result = await graphAPI(endpoint, 'POST', itemData);
    return result;
}

// READ: Get all items from list
async function getListItems(listName) {
    const listId = await getListId(listName);
    const currentSiteId = await getSiteId();
    const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listId}/items?$expand=fields`);
    const result = await graphAPI(endpoint);
    return result.value;
}

// READ: Get single item by ID
async function getListItem(listName, itemId) {
    const listId = await getListId(listName);
    const currentSiteId = await getSiteId();
    const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listId}/items/${itemId}?$expand=fields`);
    const result = await graphAPI(endpoint);
    return result;
}

// UPDATE: Update item
async function updateListItem(listName, itemId, itemData) {
    const listId = await getListId(listName);
    const currentSiteId = await getSiteId();
    const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listId}/items/${itemId}`);
    const result = await graphAPI(endpoint, 'PATCH', itemData);
    return result;
}

// DELETE: Delete item
async function deleteListItem(listName, itemId) {
    const listId = await getListId(listName);
    const currentSiteId = await getSiteId();
    const endpoint = getGraphUrl(`/sites/${currentSiteId}/lists/${listId}/items/${itemId}`);
    await graphAPI(endpoint, 'DELETE');
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
    const items = await getListItems(GRAPH_CONFIG.lists.bookingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(GRAPH_CONFIG.lists.bookingData, existingItem.id);
    }
}

// Helper function to delete shipping data from SharePoint
async function deleteShippingDataFromSharePoint(customerCode, itemID) {
    const items = await getListItems(GRAPH_CONFIG.lists.shippingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(GRAPH_CONFIG.lists.shippingData, existingItem.id);
    }
}

// ==================== SPECIFIC DATA OPERATIONS ====================

// Items
async function getItems() {
    const items = await getListItems(GRAPH_CONFIG.lists.items);
    // Microsoft Graph returns items with fields object
    return items.map(item => ({
        Id: item.id,
        itemID: item.fields.ItemID,
        description: item.fields.Description,
        grade: item.fields.Grade
    }));
}

async function addItem(item) {
    const result = await addListItem(GRAPH_CONFIG.lists.items, {
        fields: {
            ItemID: item.itemID,
            Description: item.description,
            Grade: item.grade
        }
    });
    return result.id;
}

async function updateItem(itemId, item) {
    await updateListItem(GRAPH_CONFIG.lists.items, itemId, {
        fields: {
            ItemID: item.itemID,
            Description: item.description,
            Grade: item.grade
        }
    });
}

async function deleteItem(itemId) {
    await deleteListItem(GRAPH_CONFIG.lists.items, itemId);
}

// Customers
async function getCustomers() {
    const customers = await getListItems(GRAPH_CONFIG.lists.customers);
    return customers.map(customer => ({
        Id: customer.id,
        code: customer.fields.CustomerCode,
        name: customer.fields.CustomerName,
        region: customer.fields.Region
    }));
}

async function addCustomer(customer) {
    const result = await addListItem(GRAPH_CONFIG.lists.customers, {
        fields: {
            CustomerCode: customer.code,
            CustomerName: customer.name,
            Region: customer.region
        }
    });
    return result.id;
}

async function updateCustomer(customerId, customer) {
    await updateListItem(GRAPH_CONFIG.lists.customers, customerId, {
        fields: {
            CustomerCode: customer.code,
            CustomerName: customer.name,
            Region: customer.region
        }
    });
}

async function deleteCustomer(customerId) {
    await deleteListItem(GRAPH_CONFIG.lists.customers, customerId);
}

// Booking Data
async function getBookingData() {
    const items = await getListItems(GRAPH_CONFIG.lists.bookingData);
    // Convert to nested object structure
    const bookingData = {};
    items.forEach(item => {
        if (!bookingData[item.fields.CustomerCode]) {
            bookingData[item.fields.CustomerCode] = {};
        }
        bookingData[item.fields.CustomerCode][item.fields.ItemID] = item.fields.AverageBooking;
    });
    return bookingData;
}

async function addBookingData(customerCode, itemID, value) {
    await addListItem(GRAPH_CONFIG.lists.bookingData, {
        fields: {
            CustomerCode: customerCode,
            ItemID: itemID,
            AverageBooking: value
        }
    });
}

async function updateBookingData(customerCode, itemID, value) {
    // Find existing item
    const items = await getListItems(GRAPH_CONFIG.lists.bookingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await updateListItem(GRAPH_CONFIG.lists.bookingData, existingItem.id, {
            fields: {
                CustomerCode: customerCode,
                ItemID: itemID,
                AverageBooking: value
            }
        });
    }
}

async function deleteBookingData(customerCode, itemID) {
    const items = await getListItems(GRAPH_CONFIG.lists.bookingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(GRAPH_CONFIG.lists.bookingData, existingItem.id);
    }
}

// Shipping Data
async function getShippingData() {
    const items = await getListItems(GRAPH_CONFIG.lists.shippingData);
    // Convert to nested object structure
    const shippingData = {};
    items.forEach(item => {
        if (!shippingData[item.fields.CustomerCode]) {
            shippingData[item.fields.CustomerCode] = {};
        }
        shippingData[item.fields.CustomerCode][item.fields.ItemID] = item.fields.AverageShipping;
    });
    return shippingData;
}

async function addShippingData(customerCode, itemID, value) {
    await addListItem(GRAPH_CONFIG.lists.shippingData, {
        fields: {
            CustomerCode: customerCode,
            ItemID: itemID,
            AverageShipping: value
        }
    });
}

async function updateShippingData(customerCode, itemID, value) {
    const items = await getListItems(GRAPH_CONFIG.lists.shippingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await updateListItem(GRAPH_CONFIG.lists.shippingData, existingItem.id, {
            fields: {
                CustomerCode: customerCode,
                ItemID: itemID,
                AverageShipping: value
            }
        });
    }
}

async function deleteShippingData(customerCode, itemID) {
    const items = await getListItems(GRAPH_CONFIG.lists.shippingData);
    const existingItem = items.find(item => item.fields.CustomerCode === customerCode && item.fields.ItemID === itemID);
    
    if (existingItem) {
        await deleteListItem(GRAPH_CONFIG.lists.shippingData, existingItem.id);
    }
}

// Spike Data
async function getSpikeData() {
    const items = await getListItems(GRAPH_CONFIG.lists.spikeData);
    return items.map(item => ({
        Id: item.id,
        customer: item.fields.CustomerCode,
        itemID: item.fields.ItemID,
        month1: item.fields.Month1,
        month2: item.fields.Month2,
        month3: item.fields.Month3,
        submitDate: item.fields.SubmitDate,
        userName: item.fields.UserName,
        region: item.fields.Region
    }));
}

async function addSpikeData(spike) {
    const result = await addListItem(GRAPH_CONFIG.lists.spikeData, {
        fields: {
            CustomerCode: spike.customer,
            ItemID: spike.itemID,
            Month1: spike.month1,
            Month2: spike.month2,
            Month3: spike.month3,
            TotalSpike: (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0),
            SubmitDate: spike.submitDate,
            UserName: spike.userName,
            Region: spike.region
        }
    });
    return result.id;
}

async function getSpikeDataByUser(userName) {
    const allSpikeData = await getSpikeData();
    return allSpikeData.filter(spike => spike.userName === userName);
}

async function getSpikeDataByCustomer(customerCode) {
    const allSpikeData = await getSpikeData();
    return allSpikeData.filter(spike => spike.customer === customerCode);
}

// ==================== CONFIGURATION ====================

function setAzureCredentials(clientId, tenantId, clientSecret) {
    GRAPH_CONFIG.azure.clientId = clientId;
    GRAPH_CONFIG.azure.tenantId = tenantId;
    GRAPH_CONFIG.azure.clientSecret = clientSecret;
    console.log('Azure credentials configured');
}

function setSharePointSiteUrl(siteUrl) {
    GRAPH_CONFIG.siteUrl = siteUrl;
    // Reset cached IDs when site URL changes
    siteId = null;
    listIds = {
        items: null,
        customers: null,
        bookingData: null,
        shippingData: null,
        spikeData: null
    };
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
