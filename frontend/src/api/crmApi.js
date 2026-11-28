/**
 * Al Zaydan CRM - Central Cloudflare D1 API Client
 * Seamlessly connects UI modules to the Cloudflare backend with resilient fallback.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Generic Fetch Wrapper with Timeout
async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ==============================================================
// 1. OPPORTUNITIES API
// ==============================================================
export async function fetchOpportunitiesFromApi() {
  return await apiFetch('/api/opportunities');
}

export async function saveOpportunityToApi(opp) {
  return await apiFetch('/api/opportunities', {
    method: 'POST',
    body: JSON.stringify(opp)
  });
}

export async function deleteOpportunityFromApi(id) {
  return await apiFetch(`/api/opportunities/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 2. RECEIPTS API
// ==============================================================
export async function fetchReceiptsFromApi() {
  return await apiFetch('/api/receipts');
}

export async function saveReceiptToApi(receipt) {
  return await apiFetch('/api/receipts', {
    method: 'POST',
    body: JSON.stringify(receipt)
  });
}

export async function deleteReceiptFromApi(id) {
  return await apiFetch(`/api/receipts/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 3. INVENTORY API
// ==============================================================
export async function fetchInventoryFromApi() {
  return await apiFetch('/api/inventory');
}

export async function saveInventoryProductToApi(product) {
  return await apiFetch('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(product)
  });
}

export async function deleteInventoryProductFromApi(id) {
  return await apiFetch(`/api/inventory/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 4. TAX INVOICES API
// ==============================================================
export async function fetchInvoicesFromApi() {
  return await apiFetch('/api/invoices');
}

export async function saveInvoiceToApi(invoice) {
  return await apiFetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice)
  });
}

// ==============================================================
// 5. USERS DIRECTORY API
// ==============================================================
export async function fetchUsersFromApi() {
  return await apiFetch('/api/users');
}

export async function saveUserToApi(user) {
  return await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });
}

// ==============================================================
// 6. QUOTATIONS / COMMERCIAL OFFERS API
// ==============================================================
export async function fetchQuotationsFromApi() {
  return await apiFetch('/api/quotations');
}

export async function saveQuotationToApi(quotation) {
  return await apiFetch('/api/quotations', {
    method: 'POST',
    body: JSON.stringify(quotation)
  });
}

export async function deleteQuotationFromApi(id) {
  return await apiFetch(`/api/quotations/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 7. SALES ORDERS API
// ==============================================================
export async function fetchOrdersFromApi() {
  return await apiFetch('/api/orders');
}

export async function saveOrderToApi(order) {
  return await apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order)
  });
}

export async function deleteOrderFromApi(id) {
  return await apiFetch(`/api/orders/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 8. LEADS API
// ==============================================================
export async function fetchLeadsFromApi() {
  return await apiFetch('/api/leads');
}

export async function saveLeadToApi(lead) {
  return await apiFetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(lead)
  });
}

export async function deleteLeadFromApi(id) {
  return await apiFetch(`/api/leads/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 9. TASKS API
// ==============================================================
export async function fetchTasksFromApi() {
  return await apiFetch('/api/tasks');
}

export async function saveTaskToApi(task) {
  return await apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task)
  });
}

export async function deleteTaskFromApi(id) {
  return await apiFetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
}

// ==============================================================
// 10. HEALTH CHECK
// ==============================================================
export async function checkBackendHealth() {
  try {
    const data = await apiFetch('/api/health');
    return data && data.status === 'ok';
  } catch {
    return false;
  }
}
