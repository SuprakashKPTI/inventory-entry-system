// Microsoft Entra ID / SharePoint Configuration

const AZURE_CONFIG = {

    // Microsoft Entra App Registration
    clientId: 'b6917ef0-faf0-44de-8a30-1e5e61f69cd8',

    // Microsoft Entra Tenant
    tenantId: '60c08935-b337-4e0c-9db7-aa58ecf356cd',

    // GitHub Pages URL registered as SPA Redirect URI
    redirectUri: 'https://suprakashkpti.github.io/inventory-entry-system/',

    // SharePoint Site
    siteUrl: 'https://kcptco.sharepoint.com/sites/YGSpikeplanning'
};


// SharePoint List Names
const SHAREPOINT_LISTS = {
    items: 'InventoryItems',
    customers: 'Customers',
    bookingData: 'BookingData',
    shippingData: 'ShippingData',
    spikeData: 'SpikeData'
};