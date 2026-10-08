// Supabase Client Configuration Template
// Copy this file to supabase-config.js and fill in your actual credentials

const SUPABASE_CONFIG = {
    // Get these from your Supabase project settings: https://supabase.com/dashboard/project/_/settings/api
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxxxxxxxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    
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
