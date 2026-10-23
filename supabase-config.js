// Supabase Client Configuration
const SUPABASE_CONFIG = {
    // Get these from your Supabase project settings: https://supabase.com/dashboard/project/_/settings/api
    url: 'https://gvlhqjzlxdftiquhqtws.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bGhxanpseGRmdGlxdWhxdHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTcwNjYsImV4cCI6MjEwMzIzMzA2Nn0.d_X7jctOrVsXKE4w5XvHaY14eA79ejXvxZ1GR0CBMR4'
    
    // Tables in your Supabase database
    tables: {
        items: 'items',
        customers: 'customers',
        bookingData: 'booking_data',
        shippingData: 'shipping_data',
        spikeData: 'spike_data',
        submissionControl: 'submission_control'
    }
};

// Initialize Supabase client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Sign in with Microsoft OAuth
async function signInWithMicrosoft() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'microsoft',
        options: {
            redirectTo: window.location.origin + '/index.html'
        }
    });
    
    if (error) {
        console.error('Microsoft sign-in error:', error);
        throw error;
    }
    
    return data;
}

// Sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Get user error:', error);
        return null;
    }
    
    return user;
}

// Check if user is authenticated
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

// Get user session
async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Get session error:', error);
        return null;
    }
    
    return session;
}

// ============================================
// DATA RETRIEVAL FUNCTIONS
// ============================================

// Get all items
async function getItems() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.items)
        .select('*')
        .order('item_id');
    
    if (error) {
        console.error('Error fetching items:', error);
        throw error;
    }
    
    return data.map(item => ({
        Id: item.id,
        itemID: item.item_id,
        description: item.description,
        grade: item.grade
    }));
}

// Get all customers
async function getCustomers() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.customers)
        .select('*')
        .order('customer_code');
    
    if (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
    
    return data.map(customer => ({
        Id: customer.id,
        code: customer.customer_code,
        name: customer.customer_name,
        region: customer.region
    }));
}

// Get booking data
async function getBookingData() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.bookingData)
        .select('*');
    
    if (error) {
        console.error('Error fetching booking data:', error);
        throw error;
    }
    
    // Convert to nested object structure
    const bookingData = {};
    data.forEach(item => {
        if (!bookingData[item.customer_code]) {
            bookingData[item.customer_code] = {};
        }
        bookingData[item.customer_code][item.item_id] = item.average_booking;
    });
    
    return bookingData;
}

// Get shipping data
async function getShippingData() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.shippingData)
        .select('*');
    
    if (error) {
        console.error('Error fetching shipping data:', error);
        throw error;
    }
    
    // Convert to nested object structure
    const shippingData = {};
    data.forEach(item => {
        if (!shippingData[item.customer_code]) {
            shippingData[item.customer_code] = {};
        }
        shippingData[item.customer_code][item.item_id] = item.average_shipping;
    });
    
    return shippingData;
}

// Get spike data
async function getSpikeData() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.spikeData)
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching spike data:', error);
        throw error;
    }
    
    return data.map(spike => ({
        Id: spike.id,
        customer: spike.customer_code,
        itemID: spike.item_id,
        month1: spike.month1,
        month2: spike.month2,
        month3: spike.month3,
        submitDate: spike.submit_date,
        userName: spike.user_name,
        region: spike.region,
        movedDate: spike.moved_date
    }));
}

// Get submission control status
async function getSubmissionControl() {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.submissionControl)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error) {
        console.error('Error fetching submission control:', error);
        throw error;
    }
    
    return data;
}

// ============================================
// DATA INSERTION FUNCTIONS
// ============================================

// Add spike data
async function addSpikeData(spike) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.spikeData)
        .insert({
            customer_code: spike.customer,
            item_id: spike.itemID,
            month1: spike.month1,
            month2: spike.month2,
            month3: spike.month3,
            submit_date: spike.submitDate,
            user_name: spike.userName,
            user_email: spike.userEmail,
            region: spike.region
        });
    
    if (error) {
        console.error('Error adding spike data:', error);
        throw error;
    }
}

// ============================================
// ADMIN DATA FUNCTIONS
// ============================================

// Add item
async function addItem(item) {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.items)
        .insert({
            item_id: item.itemID,
            description: item.description,
            grade: item.grade
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding item:', error);
        throw error;
    }
    
    return data.id;
}

// Add customer
async function addCustomer(customer) {
    const { data, error } = await supabase
        .from(SUPABASE_CONFIG.tables.customers)
        .insert({
            customer_code: customer.code,
            customer_name: customer.name,
            region: customer.region
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
    
    return data.id;
}

// Add booking data
async function addBookingData(customerCode, itemID, value) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.bookingData)
        .insert({
            customer_code: customerCode,
            item_id: itemID,
            average_booking: value
        });
    
    if (error) {
        console.error('Error adding booking data:', error);
        throw error;
    }
}

// Add shipping data
async function addShippingData(customerCode, itemID, value) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.shippingData)
        .insert({
            customer_code: customerCode,
            item_id: itemID,
            average_shipping: value
        });
    
    if (error) {
        console.error('Error adding shipping data:', error);
        throw error;
    }
}

// Update item
async function updateItem(itemId, item) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.items)
        .update({
            item_id: item.itemID,
            description: item.description,
            grade: item.grade
        })
        .eq('id', itemId);
    
    if (error) {
        console.error('Error updating item:', error);
        throw error;
    }
}

// Update customer
async function updateCustomer(customerId, customer) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.customers)
        .update({
            customer_code: customer.code,
            customer_name: customer.name,
            region: customer.region
        })
        .eq('id', customerId);
    
    if (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
}

// Update booking data
async function updateBookingData(customerCode, itemID, value) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.bookingData)
        .update({
            average_booking: value
        })
        .eq('customer_code', customerCode)
        .eq('item_id', itemID);
    
    if (error) {
        console.error('Error updating booking data:', error);
        throw error;
    }
}

// Update shipping data
async function updateShippingData(customerCode, itemID, value) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.shippingData)
        .update({
            average_shipping: value
        })
        .eq('customer_code', customerCode)
        .eq('item_id', itemID);
    
    if (error) {
        console.error('Error updating shipping data:', error);
        throw error;
    }
}

// Update submission control
async function updateSubmissionControl(isOpen, scheduledClose = null) {
    const now = new Date().toISOString();
    
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.submissionControl)
        .update({
            is_open: isOpen,
            opened_at: isOpen ? now : null,
            closed_at: !isOpen ? now : null,
            scheduled_close: scheduledClose
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) {
        console.error('Error updating submission control:', error);
        throw error;
    }
}

// Delete item
async function deleteItem(itemId) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.items)
        .delete()
        .eq('id', itemId);
    
    if (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
}

// Delete customer
async function deleteCustomer(customerId) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.customers)
        .delete()
        .eq('id', customerId);
    
    if (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
}

// Delete booking data
async function deleteBookingData(customerCode, itemID) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.bookingData)
        .delete()
        .eq('customer_code', customerCode)
        .eq('item_id', itemID);
    
    if (error) {
        console.error('Error deleting booking data:', error);
        throw error;
    }
}

// Delete shipping data
async function deleteShippingData(customerCode, itemID) {
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.shippingData)
        .delete()
        .eq('customer_code', customerCode)
        .eq('item_id', itemID);
    
    if (error) {
        console.error('Error deleting shipping data:', error);
        throw error;
    }
}

// Move current spike data to previous
async function moveSpikeDataToPrevious() {
    const now = new Date().toISOString();
    
    const { error } = await supabase
        .from(SUPABASE_CONFIG.tables.spikeData)
        .update({
            moved_date: now
        })
        .is('moved_date', null);
    
    if (error) {
        console.error('Error moving spike data:', error);
        throw error;
    }
}
