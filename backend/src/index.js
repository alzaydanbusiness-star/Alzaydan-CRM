/**
 * Al Zaydan International FZE CRM - Cloudflare D1 Backend Worker
 * Database: al-zaydan-crm-db (d4a568fa-8a32-4253-905e-6b2524c503bb)
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable Cross-Origin Resource Sharing (CORS)
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Al Zaydan CRM Cloudflare D1 API',
    database: 'al-zaydan-crm-db',
    timestamp: new Date().toISOString()
  });
});

// ==============================================================
// 1. USERS & DIRECTORY ENDPOINTS
// ==============================================================
app.get('/api/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM users ORDER BY name ASC').all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/users', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `usr-${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO users (id, name, email, role, designation, mobile, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      b.name || 'New Employee',
      b.email || `${id}@alzaydanfze.com`,
      b.role || 'sales_executive',
      b.designation || 'Sales Executive',
      b.mobile || '+971 50 000 0000',
      b.status || 'Active'
    ).run();
    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 2. OPPORTUNITIES PIPELINE ENDPOINTS
// ==============================================================
app.get('/api/opportunities', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM opportunities ORDER BY created_at DESC').all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/opportunities', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `opp-${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO opportunities (id, code, title, customer, owner, stage, win_probability, amount, close_date, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      b.code || `CTEQ#${Date.now()}`,
      b.title || 'Product Inquiry',
      b.customer || 'Commercial Client',
      b.owner || 'MUHAMMED RISWAN',
      b.stage || 'Enquiry',
      Number(b.win_probability || b.winProbability || 10),
      Number(b.amount || 0),
      b.close_date || b.closeDate || '28-11-2026',
      b.date || '16-11-2026',
      b.status || 'Open'
    ).run();
    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/opportunities/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM opportunities WHERE id = ? OR code = ?').bind(id, id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 3. PAYMENT RECEIPTS ENDPOINTS
// ==============================================================
app.get('/api/receipts', async (c) => {
  try {
    const { results: receipts } = await c.env.DB.prepare('SELECT * FROM receipts ORDER BY created_at DESC').all();
    const { results: items } = await c.env.DB.prepare('SELECT * FROM document_items WHERE document_type = "RECEIPT"').all();

    const itemsMap = {};
    (items || []).forEach((it) => {
      if (!itemsMap[it.document_id]) itemsMap[it.document_id] = [];
      itemsMap[it.document_id].push({
        id: it.id,
        itemName: it.item_name,
        itemCode: it.item_code,
        brand: it.brand,
        quantity: it.quantity,
        price: it.price,
        total: it.total
      });
    });

    const enriched = (receipts || []).map((r) => ({
      ...r,
      receiptNo: r.receipt_no,
      type: r.payment_type,
      bankName: r.bank_name,
      refNo: r.ref_no,
      invoiceRef: r.invoice_ref,
      createdBy: r.created_by,
      shippingCost: r.shipping_cost,
      rawAmount: r.amount,
      amount: `AED ${Number(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      products: itemsMap[r.receipt_no] || itemsMap[r.id] || []
    }));

    return c.json(enriched);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/receipts', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `rec-${Date.now()}`;
    const receiptNo = b.receiptNo || b.receipt_no || `CTRV#${Date.now()}`;

    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO receipts (id, receipt_no, customer, payment_type, bank_name, ref_no, invoice_ref, amount, shipping_cost, status, created_by, tags, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      receiptNo,
      b.customer || 'Commercial Client',
      b.type || b.payment_type || 'Cash',
      b.bankName || b.bank_name || 'Cash Counter',
      b.refNo || b.ref_no || `CASH-REC-${Date.now()}`,
      b.invoiceRef || b.invoice_ref || '',
      parseFloat(String(b.rawAmount || b.amount || '0').replace(/[^0-9.]/g, '')) || 0,
      parseFloat(String(b.shippingCost || '0').replace(/[^0-9.]/g, '')) || 0,
      b.status || 'Cleared',
      b.createdBy || b.created_by || 'MUHAMMED RISWAN',
      b.tags || '',
      b.notes || '',
      b.date || '16-11-2026'
    ).run();

    if (b.products && Array.isArray(b.products)) {
      await c.env.DB.prepare('DELETE FROM document_items WHERE document_id = ? AND document_type = "RECEIPT"').bind(receiptNo).run();
      for (const item of b.products) {
        await c.env.DB.prepare(
          'INSERT INTO document_items (id, document_id, document_type, item_name, item_code, brand, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          receiptNo,
          'RECEIPT',
          item.itemName || item.item_name || 'Product',
          item.itemCode || item.item_code || '',
          item.brand || '',
          Number(item.quantity || 1),
          Number(item.price || 0),
          Number(item.total || 0)
        ).run();
      }
    }

    return c.json({ success: true, id, receiptNo });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/receipts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM receipts WHERE id = ? OR receipt_no = ?').bind(id, id).run();
    await c.env.DB.prepare('DELETE FROM document_items WHERE document_id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 4. INVENTORY & STOCK ENDPOINTS
// ==============================================================
app.get('/api/inventory', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM inventory_products ORDER BY product_name ASC').all();
    const formatted = (results || []).map((p) => ({
      id: p.id,
      name: p.product_name,
      code: p.product_code,
      category: p.category,
      sellingPrice: p.selling_price,
      purchasePrice: p.purchase_price,
      stock: p.stock_quantity,
      unit: p.unit || 'PCS',
      lowStockAlert: p.low_stock_alert || 5,
      image1: p.primary_image,
      image2: p.spec_image,
      description: p.description
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/inventory', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `prod-${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO inventory_products (id, product_name, product_code, category, selling_price, purchase_price, stock_quantity, unit, low_stock_alert, primary_image, spec_image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      b.name || b.product_name,
      b.code || b.product_code,
      b.category || 'General',
      Number(b.sellingPrice || b.selling_price || 0),
      b.purchasePrice !== undefined ? Number(b.purchasePrice) : null,
      Number(b.stock || b.stock_quantity || 0),
      b.unit || 'PCS',
      Number(b.lowStockAlert || b.low_stock_alert || 5),
      b.image1 || b.primary_image || null,
      b.image2 || b.spec_image || null,
      b.description || ''
    ).run();
    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM inventory_products WHERE id = ? OR product_code = ?').bind(id, id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 5. TAX INVOICES ENDPOINTS
// ==============================================================
app.get('/api/invoices', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    const formatted = (results || []).map((inv) => ({
      ...inv,
      invoiceNo: inv.invoice_no,
      orderRef: inv.order_ref,
      advancePaid: inv.advance_paid,
      rawAmount: inv.amount,
      amount: `AED ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      paid: `AED ${Number(inv.advance_paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      balance: `AED ${Number(inv.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/invoices', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `inv-${Date.now()}`;
    const invoiceNo = b.invoiceNo || b.invoice_no || `CTINV#${Date.now()}`;
    const amt = parseFloat(String(b.rawAmount || b.amount || 0).replace(/[^0-9.]/g, '')) || 0;
    const adv = parseFloat(String(b.advancePaid || b.advance_paid || 0).replace(/[^0-9.]/g, '')) || 0;
    const bal = Math.max(0, amt - adv);

    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO invoices (id, invoice_no, order_ref, customer, owner, amount, advance_paid, balance, status, trn, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      invoiceNo,
      b.orderRef || b.order_ref || '',
      b.customer || 'Commercial Client',
      b.owner || 'MUHAMMED RISWAN',
      amt,
      adv,
      bal,
      b.status || 'Pending',
      b.trn || '100 234 567 800 003',
      b.date || '16-11-2026'
    ).run();

    return c.json({ success: true, id, invoiceNo });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 6. QUOTATIONS / COMMERCIAL OFFERS ENDPOINTS
// ==============================================================
app.get('/api/quotations', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM quotations ORDER BY created_at DESC').all();
    const formatted = (results || []).map((q) => ({
      ...q,
      quotationNo: q.quotation_no,
      opportunityRef: q.opportunity_ref
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/quotations', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `quot-${Date.now()}`;
    const quotNo = b.quotationNo || b.quotation_no || `CTQUOT#${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO quotations (id, quotation_no, opportunity_ref, customer, owner, subtotal, vat, total, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      quotNo,
      b.opportunityRef || b.opportunity_ref || '',
      b.customer || 'Commercial Client',
      b.owner || 'MUHAMMED RISWAN',
      Number(b.subtotal || 0),
      Number(b.vat || 0),
      Number(b.total || 0),
      b.status || 'Draft',
      b.date || '16-11-2026'
    ).run();
    return c.json({ success: true, id, quotationNo: quotNo });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/quotations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM quotations WHERE id = ? OR quotation_no = ?').bind(id, id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 7. SALES ORDERS ENDPOINTS
// ==============================================================
app.get('/api/orders', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM sales_orders ORDER BY created_at DESC').all();
    const formatted = (results || []).map((o) => ({
      ...o,
      orderNo: o.order_no,
      quotationRef: o.quotation_ref
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `ord-${Date.now()}`;
    const ordNo = b.orderNo || b.order_no || `CTSO#${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO sales_orders (id, order_no, quotation_ref, customer, owner, total, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      ordNo,
      b.quotationRef || b.quotation_ref || '',
      b.customer || 'Commercial Client',
      b.owner || 'MUHAMMED RISWAN',
      Number(b.total || 0),
      b.status || 'Pending',
      b.date || '16-11-2026'
    ).run();
    return c.json({ success: true, id, orderNo: ordNo });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM sales_orders WHERE id = ? OR order_no = ?').bind(id, id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 8. LEADS ENDPOINTS
// ==============================================================
app.get('/api/leads', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const formatted = (results || []).map((l) => ({
      ...l,
      name: l.lead_name,
      company: l.company_name,
      email: l.contact_email,
      phone: l.contact_phone,
      assignedTo: l.assigned_to
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/leads', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `lead-${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO leads (id, lead_name, company_name, contact_email, contact_phone, source, assigned_to, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      b.name || b.lead_name || 'New Inbound Lead',
      b.company || b.company_name || '',
      b.email || b.contact_email || '',
      b.phone || b.contact_phone || '',
      b.source || 'Inbound Direct',
      b.assignedTo || b.assigned_to || 'MUHAMMED RISWAN',
      b.status || 'Pending',
      b.notes || ''
    ).run();
    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/leads/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 9. TASKS ENDPOINTS
// ==============================================================
app.get('/api/tasks', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    const formatted = (results || []).map((t) => ({
      ...t,
      assignedTo: t.assigned_to,
      dueDate: t.due_date
    }));
    return c.json(formatted);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/tasks', async (c) => {
  try {
    const b = await c.req.json();
    const id = b.id || `task-${Date.now()}`;
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO tasks (id, title, customer, assigned_to, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      b.title || 'Follow up task',
      b.customer || '',
      b.assignedTo || b.assigned_to || 'MUHAMMED RISWAN',
      b.priority || 'Medium',
      b.dueDate || b.due_date || '28-11-2026',
      b.status || 'Pending'
    ).run();
    return c.json({ success: true, id });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ==============================================================
// 10. CUSTOMERS ENDPOINTS
// ==============================================================
app.get('/api/customers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM customers ORDER BY name ASC').all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
