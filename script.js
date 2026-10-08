"use strict";

// This file expects the following to be loaded before it:
// 1. azure-config.js
// 2. MSAL browser library
// 3. sharepoint-service.js, defining:
//    getItems(), getCustomers(), getListItems(), addSpikeData()

const DATA_CONFIG = {
    USE_SHAREPOINT: true
};

let ITEM_DATA = [];
let CUSTOMER_DATA = [];
let BOOKING_DATA = {};
let SHIPPING_DATA = {};
let SPIKE_DATA = [];
let PREVIOUS_SPIKE_DATA = [];
let REGIONS = ["South West", "North East", "North West", "South East", "Central"];
let SUBMISSION_WINDOW_OPEN = false;

function hasFunction(name) {
    return typeof window[name] === "function";
}

function requireSharePointFunctions() {
    const required = ["getItems", "getCustomers", "getListItems", "addSpikeData"];
    const missing = required.filter(name => !hasFunction(name));
    if (missing.length) {
        throw new Error(`Missing SharePoint functions: ${missing.join(", ")}. Check sharepoint-service.js and script order.`);
    }
}

async function loadAdminData() {
    if (!DATA_CONFIG.USE_SHAREPOINT) {
        loadAdminDataFromLocalStorage();
        return "local";
    }

    try {
        requireSharePointFunctions();
        console.log("Loading data from SharePoint...");
        await loadAdminDataFromSharePoint();
        return "sharepoint";
    } catch (error) {
        console.error("SharePoint loading failed. Full error:", error);
        loadAdminDataFromLocalStorage();
        alert("Could not connect to SharePoint. This browser is displaying locally stored data.");
        return "local";
    }
}

async function loadAdminDataFromSharePoint() {
    const [items, customers, bookingItems, shippingItems, spikeItems] = await Promise.all([
        window.getItems(),
        window.getCustomers(),
        window.getListItems(SHAREPOINT_LISTS.bookingData),
        window.getListItems(SHAREPOINT_LISTS.shippingData),
        window.getListItems(SHAREPOINT_LISTS.spikeData)
    ]);

    const bookingData = {};
    bookingItems.forEach(item => {
        const customerCode = item.CustomerCode;
        const itemID = item.ItemID;
        if (!customerCode || !itemID) return;
        if (!bookingData[customerCode]) bookingData[customerCode] = {};
        bookingData[customerCode][itemID] = Number(item.AverageBooking) || 0;
    });

    const shippingData = {};
    shippingItems.forEach(item => {
        const customerCode = item.CustomerCode;
        const itemID = item.ItemID;
        if (!customerCode || !itemID) return;
        if (!shippingData[customerCode]) shippingData[customerCode] = {};
        shippingData[customerCode][itemID] = Number(item.AverageShipping) || 0;
    });

    ITEM_DATA = items.map(item => ({
        itemID: item.ItemID || "",
        description: item.Description || "",
        grade: item.Grade || ""
    })).filter(item => item.itemID);

    CUSTOMER_DATA = customers.map(customer => ({
        code: customer.CustomerCode || "",
        name: customer.CustomerName || "",
        region: customer.Region || ""
    })).filter(customer => customer.code);

    BOOKING_DATA = bookingData;
    SHIPPING_DATA = shippingData;

    const formattedSpikeData = spikeItems.map(spike => ({
        customer: spike.CustomerCode || "",
        itemID: spike.ItemID || "",
        month1: Number(spike.Month1) || 0,
        month2: Number(spike.Month2) || 0,
        month3: Number(spike.Month3) || 0,
        submitDate: spike.SubmitDate || "",
        userName: spike.UserName || "",
        region: spike.Region || "",
        movedDate: spike.MovedDate || ""
    }));

    SPIKE_DATA = formattedSpikeData.filter(spike => !spike.movedDate);
    PREVIOUS_SPIKE_DATA = formattedSpikeData.filter(spike => Boolean(spike.movedDate));

    const localControlData = JSON.parse(localStorage.getItem("inventoryAdminData") || "{}");
    SUBMISSION_WINDOW_OPEN = Boolean(localControlData.submissionWindowOpen);

    console.log("SharePoint data loaded successfully", {
        items: ITEM_DATA.length,
        customers: CUSTOMER_DATA.length,
        currentSpikeRows: SPIKE_DATA.length,
        previousSpikeRows: PREVIOUS_SPIKE_DATA.length
    });
}

function loadAdminDataFromLocalStorage() {
    const storedData = localStorage.getItem("inventoryAdminData");

    if (storedData) {
        try {
            const adminData = JSON.parse(storedData);
            ITEM_DATA = adminData.items || [];
            CUSTOMER_DATA = adminData.customers || [];
            BOOKING_DATA = adminData.bookingData || {};
            SHIPPING_DATA = adminData.shippingData || {};
            SPIKE_DATA = adminData.currentSpikeData || adminData.spikeData || [];
            PREVIOUS_SPIKE_DATA = adminData.previousSpikeData || [];
            REGIONS = adminData.regions || REGIONS;
            SUBMISSION_WINDOW_OPEN = Boolean(adminData.submissionWindowOpen);
            return;
        } catch (error) {
            console.error("Invalid inventoryAdminData in localStorage:", error);
        }
    }

    ITEM_DATA = [
        { itemID: "ITM001", description: "Steel Sheet 5mm", grade: "A" },
        { itemID: "ITM002", description: "Steel Sheet 10mm", grade: "B" },
        { itemID: "ITM003", description: "Aluminum Plate 3mm", grade: "A" },
        { itemID: "ITM004", description: "Copper Wire 2mm", grade: "C" },
        { itemID: "ITM005", description: "Steel Rod 20mm", grade: "A" }
    ];

    CUSTOMER_DATA = [
        { code: "CUST001", name: "ABC Manufacturing", region: "South West" },
        { code: "CUST002", name: "XYZ Industries", region: "North East" },
        { code: "CUST003", name: "Global Corp", region: "South West" },
        { code: "CUST004", name: "Local Metals Ltd", region: "North East" }
    ];

    BOOKING_DATA = {
        CUST001: { ITM001: 150, ITM002: 200, ITM003: 100, ITM004: 75, ITM005: 180 },
        CUST002: { ITM001: 120, ITM002: 180, ITM003: 80, ITM004: 60, ITM005: 150 },
        CUST003: { ITM001: 200, ITM002: 250, ITM003: 120, ITM004: 90, ITM005: 220 },
        CUST004: { ITM001: 180, ITM002: 220, ITM003: 110, ITM004: 85, ITM005: 200 }
    };

    SHIPPING_DATA = {
        CUST001: { ITM001: 140, ITM002: 190, ITM003: 95, ITM004: 70, ITM005: 170 },
        CUST002: { ITM001: 115, ITM002: 175, ITM003: 75, ITM004: 55, ITM005: 145 },
        CUST003: { ITM001: 190, ITM002: 240, ITM003: 115, ITM004: 85, ITM005: 210 },
        CUST004: { ITM001: 170, ITM002: 210, ITM003: 100, ITM004: 80, ITM005: 190 }
    };
}

document.addEventListener("DOMContentLoaded", async function () {
    const isAuthenticated = sessionStorage.getItem("userAuthenticated") === "true";
    const authTime = Number.parseInt(sessionStorage.getItem("userAuthTime") || "0", 10);
    const expired = Date.now() - authTime >= 8 * 60 * 60 * 1000;

    if (!isAuthenticated || expired) {
        clearLocalSession();
        window.location.href = "entry-login.html";
        return;
    }

    const userName = sessionStorage.getItem("userName") || "";

    await loadAdminData();
    initializeCustomerDropdown();
    initializeRegionDropdown();
    initializeTable();
    setupEventListeners();
    updateSubmissionWindowStatus();

    const submittedByInput = document.getElementById("submittedBy");
    if (submittedByInput && userName) {
        submittedByInput.value = userName;
        submittedByInput.readOnly = true;
        submittedByInput.style.backgroundColor = "#f5f5f5";
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to logout?")) {
                clearLocalSession();
                window.location.href = "entry-login.html";
            }
        });
    }
});

function clearLocalSession() {
    sessionStorage.removeItem("userAuthenticated");
    sessionStorage.removeItem("userAuthTime");
    sessionStorage.removeItem("userName");
}

function initializeCustomerDropdown() {
    const customerSelect = document.getElementById("customerCode");
    if (!customerSelect) return;
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
    CUSTOMER_DATA.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.code;
        option.textContent = `${customer.code} - ${customer.name}`;
        customerSelect.appendChild(option);
    });
}

function initializeRegionDropdown() {
    const regionSelect = document.getElementById("region");
    if (!regionSelect) return;
    regionSelect.innerHTML = '<option value="">-- Auto-set from Customer --</option>';
    REGIONS.forEach(region => {
        const option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

function initializeTable() {
    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    ITEM_DATA.forEach(item => {
        const row = document.createElement("tr");
        row.dataset.item = item.itemID;
        const typeValue = item.itemID.endsWith("D") ? "Domestic" : "Trade";

        row.innerHTML = `
            <td class="readonly-cell">${escapeHtml(item.itemID)}</td>
            <td class="readonly-cell">${escapeHtml(item.description)}</td>
            <td class="readonly-cell">${escapeHtml(item.grade)}</td>
            <td class="readonly-cell booking-customer">-</td>
            <td class="readonly-cell booking-region">-</td>
            <td class="readonly-cell shipping-customer">-</td>
            <td class="readonly-cell spike-m1-customer">-</td>
            <td class="readonly-cell spike-m2-customer">-</td>
            <td class="readonly-cell spike-m3-customer">-</td>
            <td class="editable-cell"><input type="number" class="spike-input" data-month="1" min="0" step="1"></td>
            <td class="editable-cell"><input type="number" class="spike-input" data-month="2" min="0" step="1"></td>
            <td class="editable-cell"><input type="number" class="spike-input" data-month="3" min="0" step="1"></td>
            <td class="readonly-cell type-cell">${typeValue}</td>
            <td class="readonly-cell customer-cell">-</td>
            <td class="readonly-cell submitted-cell">-</td>
            <td class="readonly-cell region-cell">-</td>
            <td class="readonly-cell total-spike">0</td>
            <td class="readonly-cell submit-date">-</td>`;

        tableBody.appendChild(row);
    });
}

function setupEventListeners() {
    const customerSelect = document.getElementById("customerCode");
    const regionSelect = document.getElementById("region");
    const submitBtn = document.getElementById("submitBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    customerSelect?.addEventListener("change", function () {
        const customer = CUSTOMER_DATA.find(c => c.code === this.value);
        if (customer?.region && regionSelect) {
            regionSelect.value = customer.region;
            regionSelect.disabled = false;
        }
        updateLookupData();
    });

    regionSelect?.addEventListener("change", updateLookupData);

    document.addEventListener("input", function (event) {
        if (event.target.classList?.contains("spike-input")) calculateTotalSpike(event.target);
    });

    submitBtn?.addEventListener("click", submitData);
    downloadBtn?.addEventListener("click", downloadUserSpikeData);

    refreshBtn?.addEventListener("click", async function () {
        refreshBtn.disabled = true;
        try {
            await loadAdminData();
            initializeCustomerDropdown();
            initializeRegionDropdown();
            initializeTable();
            updateSubmissionWindowStatus();
            alert("Data refreshed. Please select a customer again.");
        } finally {
            refreshBtn.disabled = false;
        }
    });
}

function updateLookupData() {
    const customerCode = document.getElementById("customerCode")?.value || "";
    const selectedRegion = document.getElementById("region")?.value || "";
    if (!customerCode) return;

    const customer = CUSTOMER_DATA.find(c => c.code === customerCode);
    const customerRegion = customer?.region || selectedRegion;
    const regionBookingData = calculateRegionAggregate(customerRegion, "booking");

    document.querySelectorAll(".customer-cell").forEach(cell => {
        cell.textContent = customer?.name || "-";
    });
    document.querySelectorAll(".region-cell").forEach(cell => {
        cell.textContent = customerRegion || "-";
    });

    ITEM_DATA.forEach(item => {
        const row = document.querySelector(`tr[data-item="${cssEscape(item.itemID)}"]`);
        if (!row) return;

        setCellValue(row.querySelector(".booking-customer"), BOOKING_DATA?.[customerCode]?.[item.itemID]);
        setCellValue(row.querySelector(".booking-region"), regionBookingData?.[item.itemID]);
        setCellValue(row.querySelector(".shipping-customer"), SHIPPING_DATA?.[customerCode]?.[item.itemID]);

        const previous = PREVIOUS_SPIKE_DATA.find(
            spike => spike.customer === customerCode && spike.itemID === item.itemID
        );
        setCellValue(row.querySelector(".spike-m1-customer"), previous?.month1);
        setCellValue(row.querySelector(".spike-m2-customer"), previous?.month2);
        setCellValue(row.querySelector(".spike-m3-customer"), previous?.month3);
    });
}

function setCellValue(cell, value) {
    if (!cell) return;
    cell.textContent = value !== undefined && value !== null && value !== "" ? value : "-";
}

function calculateRegionAggregate(region, dataType) {
    const source = dataType === "booking" ? BOOKING_DATA : SHIPPING_DATA;
    const result = {};

    CUSTOMER_DATA.filter(customer => customer.region === region).forEach(customer => {
        Object.entries(source[customer.code] || {}).forEach(([itemID, value]) => {
            result[itemID] = (result[itemID] || 0) + (Number(value) || 0);
        });
    });
    return result;
}

function calculateTotalSpike(input) {
    const row = input.closest("tr");
    if (!row) return;
    const total = [...row.querySelectorAll(".spike-input")]
        .reduce((sum, element) => sum + (Number.parseInt(element.value || "0", 10) || 0), 0);
    const totalCell = row.querySelector(".total-spike");
    if (totalCell) totalCell.textContent = String(total);
}

function updateSubmissionWindowStatus() {
    const inputs = document.querySelectorAll(".spike-input");
    const submitBtn = document.getElementById("submitBtn");

    inputs.forEach(input => {
        input.disabled = !SUBMISSION_WINDOW_OPEN;
        input.style.backgroundColor = SUBMISSION_WINDOW_OPEN ? "" : "#e9ecef";
    });

    if (submitBtn) {
        submitBtn.disabled = !SUBMISSION_WINDOW_OPEN;
        submitBtn.style.backgroundColor = SUBMISSION_WINDOW_OPEN ? "" : "#6c757d";
        submitBtn.textContent = SUBMISSION_WINDOW_OPEN ? "Submit Data" : "Submission Closed";
    }

    if (SUBMISSION_WINDOW_OPEN) hideSubmissionStatusMessage();
    else showSubmissionStatusMessage();
}

function showSubmissionStatusMessage() {
    let messageDiv = document.getElementById("submission-status-message");
    if (!messageDiv) {
        messageDiv = document.createElement("div");
        messageDiv.id = "submission-status-message";
        messageDiv.className = "submission-status-message";
        document.querySelector(".input-section")?.appendChild(messageDiv);
    }
    messageDiv.innerHTML = `
        <div class="status-alert closed">
            <span class="status-icon">&#128274;</span>
            <span class="status-text">Submission window is currently CLOSED. Please contact your administrator.</span>
        </div>`;
}

function hideSubmissionStatusMessage() {
    document.getElementById("submission-status-message")?.remove();
}

function downloadUserSpikeData() {
    const userName = sessionStorage.getItem("userName");
    if (!userName) {
        alert("User not logged in.");
        return;
    }

    const userSpikeData = SPIKE_DATA.filter(spike => spike.userName === userName);
    if (!userSpikeData.length) {
        alert("No spike data found for your submissions.");
        return;
    }

    const rows = [[
        "Customer", "Customer Name", "Region", "Item ID", "Description", "Grade",
        "Month 1", "Month 2", "Month 3", "Total Spike", "Submit Date", "User Name"
    ]];

    userSpikeData.forEach(spike => {
        const customer = CUSTOMER_DATA.find(c => c.code === spike.customer) || {};
        const item = ITEM_DATA.find(i => i.itemID === spike.itemID) || {};
        rows.push([
            spike.customer, customer.name || "Unknown", customer.region || "Unknown",
            spike.itemID, item.description || "Unknown", item.grade || "Unknown",
            spike.month1 || 0, spike.month2 || 0, spike.month3 || 0,
            (spike.month1 || 0) + (spike.month2 || 0) + (spike.month3 || 0),
            spike.submitDate || "-", spike.userName || "-"
        ]);
    });

    const csv = rows.map(row => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my_spike_data_${safeFileName(userName)}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

async function submitData() {
    if (!SUBMISSION_WINDOW_OPEN) {
        alert("Submission window is currently CLOSED.");
        return;
    }

    const customerCode = document.getElementById("customerCode")?.value || "";
    const region = document.getElementById("region")?.value || "";
    const submittedBy = document.getElementById("submittedBy")?.value.trim() || "";

    if (!customerCode || !region || !submittedBy) {
        alert("Please fill in Customer Code, Region, and Submitted By.");
        return;
    }

    const submitDate = new Date().toISOString().slice(0, 10);
    const masterData = [];

    document.querySelectorAll("#tableBody tr").forEach(row => {
        const itemID = row.dataset.item;
        const item = ITEM_DATA.find(record => record.itemID === itemID);
        if (!item) return;

        const month1Spike = Number.parseInt(row.querySelector('[data-month="1"]')?.value || "0", 10) || 0;
        const month2Spike = Number.parseInt(row.querySelector('[data-month="2"]')?.value || "0", 10) || 0;
        const month3Spike = Number.parseInt(row.querySelector('[data-month="3"]')?.value || "0", 10) || 0;

        if (month1Spike > 0 || month2Spike > 0 || month3Spike > 0) {
            masterData.push({
                itemID,
                description: item.description,
                grade: item.grade,
                month1Spike,
                month2Spike,
                month3Spike,
                userName: submittedBy,
                customer: customerCode,
                region,
                submitDate
            });
        }
    });

    if (!masterData.length) {
        alert("Please enter at least one spike value.");
        return;
    }

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = true;

    try {
        const destination = await saveData(masterData);
        alert(destination === "sharepoint"
            ? "Data submitted successfully to SharePoint."
            : "SharePoint submission failed. A local browser copy was saved instead.");

        document.querySelectorAll(".spike-input").forEach(input => { input.value = ""; });
        document.querySelectorAll(".total-spike").forEach(cell => { cell.textContent = "0"; });
    } catch (error) {
        console.error("Submission failed:", error);
        alert(`Error submitting data: ${error.message}`);
    } finally {
        if (submitBtn) submitBtn.disabled = !SUBMISSION_WINDOW_OPEN;
    }
}

async function saveData(data) {
    if (!DATA_CONFIG.USE_SHAREPOINT) {
        await saveDataToLocalStorage(data);
        return "local";
    }

    try {
        await saveDataToSharePoint(data);
        return "sharepoint";
    } catch (error) {
        console.error("SharePoint save failed:", error);
        await saveDataToLocalStorage(data);
        return "local";
    }
}

async function saveDataToSharePoint(data) {
    requireSharePointFunctions();
    let completed = 0;

    for (const entry of data) {
        const spike = {
            customer: entry.customer,
            itemID: entry.itemID,
            month1: entry.month1Spike,
            month2: entry.month2Spike,
            month3: entry.month3Spike,
            submitDate: entry.submitDate,
            userName: entry.userName,
            region: entry.region
        };

        try {
            await window.addSpikeData(spike);
            completed += 1;
        } catch (error) {
            console.error("Failed SharePoint record:", spike, error);
            throw new Error(`SharePoint saved ${completed} of ${data.length} records. Failed on item ${entry.itemID}.`);
        }
    }
}

async function saveDataToLocalStorage(data) {
    const adminData = JSON.parse(localStorage.getItem("inventoryAdminData") || "{}");
    adminData.currentSpikeData = adminData.currentSpikeData || adminData.spikeData || [];
    adminData.previousSpikeData = adminData.previousSpikeData || [];
    delete adminData.spikeData;

    data.forEach(entry => {
        adminData.currentSpikeData.push({
            customer: entry.customer,
            itemID: entry.itemID,
            month1: entry.month1Spike,
            month2: entry.month2Spike,
            month3: entry.month3Spike,
            submitDate: entry.submitDate,
            userName: entry.userName,
            region: entry.region
        });
    });

    localStorage.setItem("inventoryAdminData", JSON.stringify(adminData));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(String(value)) : String(value).replace(/["\\]/g, "\\$&");
}

function csvValue(value) {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function safeFileName(value) {
    return String(value).replace(/[^a-z0-9._-]+/gi, "_");
}
