// Al Zaydan CRM - Dynamic Inventory & Product Storage Service
// Full support for: id, product_name, product_code, category_id, description, purchase_price, selling_price, quantity, unit
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const INVENTORY_STORAGE_KEY = 'alzaydan_inventory_products';
export const INVENTORY_CATEGORIES_KEY = 'alzaydan_inventory_categories';
export const INVENTORY_DELETED_KEY = 'alzaydan_deleted_inventory_ids';

// Track deleted inventory IDs so deletions persist across refresh and cloud sync
export function getDeletedInventoryIds() {
  try {
    const raw = localStorage.getItem(INVENTORY_DELETED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    }
  } catch {}
  return [];
}

export function saveDeletedInventoryIds(ids) {
  try {
    localStorage.setItem(INVENTORY_DELETED_KEY, JSON.stringify([...new Set(ids.map(String))]));
  } catch {}
}

export const DEFAULT_INVENTORY_CATEGORIES = [
  { id: 'general', name: 'General', code: 'GEN' },
  { id: 'vehicles', name: 'Vehicles / Automotive', code: 'VEH' },
  { id: 'spare_parts', name: 'Spare Parts & Accessories', code: 'SPR' },
  { id: 'electronics', name: 'Electronics & Equipment', code: 'ELE' }
];

export const INVENTORY_UNITS = [
  'PCS',
  'SET',
  'UNIT',
  'MTR',
  'BOX',
  'LOT',
  'ROLL',
  'KG'
];

export const INITIAL_INVENTORY_PRODUCTS = [
  {
    id: 1,
    product_name: 'Daikin VRV-IV X Heat Pump Outdoor Unit (16 HP / 45 kW)',
    product_code: 'VRV-IV-RXQ16AMY1',
    category_id: 'vrv_systems',
    description: 'High-efficiency variable refrigerant volume inverter heat pump outdoor unit, R-410A refrigerant, tropicalized for UAE GCC climate up to 52°C ambient.',
    purchase_price: 24500.0,
    selling_price: 32800.0,
    quantity: 8,
    unit: 'UNIT',
    min_stock: 3,
    created_at: '2026-01-15'
  },
  {
    id: 2,
    product_name: 'Carrier AquaForce 30XW Water-Cooled Screw Chiller (250 TR)',
    product_code: 'CAR-30XW-250TR',
    category_id: 'chillers',
    description: 'High-efficiency dual circuit screw compressor water-cooled chiller with Touch Pilot controls, zero-ozone depletion HFC-134a.',
    purchase_price: 145000.0,
    selling_price: 189000.0,
    quantity: 3,
    unit: 'SET',
    min_stock: 1,
    created_at: '2026-01-20'
  },
  {
    id: 3,
    product_name: 'O General Inverter Ducted Split AC Unit (5.0 TR / 60,000 BTU)',
    product_code: 'OG-ARG60EL-5TR',
    category_id: 'ducted_splits',
    description: 'Heavy duty tropicalized inverter concealed ceiling ducted unit with high static pressure motor and wireless remote sensor.',
    purchase_price: 8200.0,
    selling_price: 11500.0,
    quantity: 22,
    unit: 'SET',
    min_stock: 5,
    created_at: '2026-02-01'
  },
  {
    id: 4,
    product_name: 'Honeywell T6 Pro Commercial Programmable Thermostat (Digital)',
    product_code: 'TH-HON-T6PRO',
    category_id: 'controls',
    description: 'Multi-stage 24VAC 7-day programmable digital thermostat with backlit LCD display and Modbus / BACnet connectivity.',
    purchase_price: 380.0,
    selling_price: 620.0,
    quantity: 65,
    unit: 'PCS',
    min_stock: 15,
    created_at: '2026-02-10'
  },
  {
    id: 5,
    product_name: 'Mueller ASTM B280 Seamless Copper Tube Coil (5/8 inch x 50ft)',
    product_code: 'COP-MUE-058-50F',
    category_id: 'piping_valves',
    description: 'Deoxidized high copper alloy seamless refrigeration tubing, nitrogen pressurized and capped for high pressure R-410A VRF piping.',
    purchase_price: 245.0,
    selling_price: 395.0,
    quantity: 48,
    unit: 'ROLL',
    min_stock: 10,
    created_at: '2026-02-15'
  },
  {
    id: 6,
    product_name: 'Armacell Armaflex Class O Nitrile Rubber Insulation Sheet (19mm x 1.2m x 10m)',
    product_code: 'ARM-CLO-19MM',
    category_id: 'insulation',
    description: 'Flexible elastomeric nitrile foam thermal insulation sheet with built-in antimicrobial protection for chilled water ducting.',
    purchase_price: 310.0,
    selling_price: 485.0,
    quantity: 30,
    unit: 'ROLL',
    min_stock: 8,
    created_at: '2026-02-20'
  },
  {
    id: 7,
    product_name: 'Danfoss Performer Scroll Compressor SM161 (13.5 HP / R22/R407C)',
    product_code: 'CMP-DAN-SM161',
    category_id: 'spare_parts',
    description: 'Heavy commercial refrigeration scroll compressor with internal motor protection and rotolock service valves.',
    purchase_price: 4850.0,
    selling_price: 6950.0,
    quantity: 4,
    unit: 'UNIT',
    min_stock: 2,
    created_at: '2026-02-25'
  },
  {
    id: 8,
    product_name: 'Al Zaydan Premium Linear Slot Diffuser 4-Slot (1200mm Aluminium)',
    product_code: 'LSD-AZ-4SLOT-12',
    category_id: 'duct_accessories',
    description: 'Extruded aluminium architectural linear slot air diffuser with adjustable black pattern deflectors and powder-coated white finish.',
    purchase_price: 145.0,
    selling_price: 240.0,
    quantity: 120,
    unit: 'PCS',
    min_stock: 25,
    created_at: '2026-03-01'
  },
  {
    id: 9,
    product_name: 'Belimo Commercial Motorized Fire & Smoke Damper Actuator 24V (20 Nm)',
    product_code: 'FSD-BEL-FSNF24',
    category_id: 'controls',
    description: 'Spring-return fail-safe motorized fire & smoke damper actuator with mechanical position indicator and thermal sensor.',
    purchase_price: 1150.0,
    selling_price: 1680.0,
    quantity: 12,
    unit: 'PCS',
    min_stock: 5,
    created_at: '2026-03-05'
  },
  {
    id: 10,
    product_name: 'Greenheck Commercial Centrifugal Inline Exhaust Fan (3500 CFM)',
    product_code: 'FAN-GRN-SQ3500',
    category_id: 'ventilation',
    description: 'Direct drive backward inclined wheel centrifugal inline duct fan, UL-705 listed with variable speed controller.',
    purchase_price: 3400.0,
    selling_price: 5100.0,
    quantity: 6,
    unit: 'UNIT',
    min_stock: 2,
    created_at: '2026-03-10'
  }
];

// Helper to get categories
export function getStoredCategories() {
  try {
    const raw = localStorage.getItem(INVENTORY_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If it still contains legacy HVAC categories, replace with clean categories
        const isLegacy = parsed.some(c => c.id === 'vrv_systems' || c.id === 'chillers');
        if (!isLegacy) return parsed;
      }
    }
  } catch {}
  saveStoredCategories(DEFAULT_INVENTORY_CATEGORIES);
  return DEFAULT_INVENTORY_CATEGORIES;
}

export function saveStoredCategories(categories) {
  try {
    localStorage.setItem(INVENTORY_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {}
}

// Add a new custom category dynamically
export function addInventoryCategory(name) {
  const categories = getStoredCategories();
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const existing = categories.find(c => c.id === id || c.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;
  const newCat = {
    id,
    name: cleanName,
    code: cleanName.slice(0, 3).toUpperCase()
  };
  const updated = [...categories, newCat];
  saveStoredCategories(updated);
  return newCat;
}

// Retrieve active inventory products
export function getStoredInventory() {
  const deletedIds = getDeletedInventoryIds();
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(p => !deletedIds.includes(String(p.id)) && !deletedIds.includes(String(p.product_code)))
          .map(sanitizeProduct);
      }
    }
  } catch {}
  
  // Initialize with initial products (filtering out any deleted ones)
  const initial = INITIAL_INVENTORY_PRODUCTS
    .filter(p => !deletedIds.includes(String(p.id)) && !deletedIds.includes(String(p.product_code)))
    .map(sanitizeProduct);
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

// Ensure product has all required fields with proper types
export function sanitizeProduct(p) {
  const purchasePrice = parseFloat(p.purchase_price) || 0;
  const sellingPrice = parseFloat(p.selling_price) || 0;
  const shippingCost = parseFloat(p.shipping_cost) || 0;
  const qty = parseInt(p.quantity, 10) || 0;
  const minStock = parseInt(p.min_stock, 10) || 5;

  let status = 'In Stock';
  if (qty <= 0) {
    status = 'Out of Stock';
  } else if (qty <= minStock) {
    status = 'Low Stock';
  }

  return {
    id: p.id !== undefined && p.id !== null ? p.id : Date.now(),
    product_name: String(p.product_name || p.name || 'Untitled Product').trim(),
    product_code: String(p.product_code || p.code || `PRD-${Date.now().toString().slice(-4)}`).trim(),
    category_id: String(p.category_id || p.category || 'general').trim(),
    description: String(p.description || '').trim(),
    purchase_price: purchasePrice,
    selling_price: sellingPrice,
    shipping_cost: shippingCost,
    quantity: qty,
    unit: String(p.unit || 'PCS').toUpperCase().trim(),
    min_stock: minStock,
    product_image: p.product_image || '',
    product_image2: p.product_image2 || '',
    status,
    created_at: p.created_at || new Date().toISOString().split('T')[0],
    updated_at: p.updated_at || new Date().toISOString().split('T')[0]
  };
}

// Save products to localStorage and background sync to Firestore
export function saveStoredInventory(products) {
  try {
    const sanitized = products.map(sanitizeProduct);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('alzaydan_inventory_updated'));

    // Non-blocking Firestore sync
    syncToFirestore(sanitized).catch(() => {});
  } catch (err) {
    console.error('Failed to save inventory to localStorage', err);
  }
}

// Add new product
export function addInventoryProduct(productData) {
  const products = getStoredInventory();
  const nextId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
  
  // Auto product code if not provided
  let code = productData.product_code?.trim();
  if (!code) {
    code = `PRD-2026-${String(nextId).padStart(4, '0')}`;
  }

  // Un-blacklist id / code if adding a new or re-added product
  const deletedIds = getDeletedInventoryIds();
  if (deletedIds.includes(String(nextId)) || deletedIds.includes(code)) {
    saveDeletedInventoryIds(deletedIds.filter(d => d !== String(nextId) && d !== code));
  }

  const newProduct = sanitizeProduct({
    ...productData,
    id: nextId,
    product_code: code,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  });

  const updated = [newProduct, ...products];
  saveStoredInventory(updated);
  return newProduct;
}

// Update existing product
export function updateInventoryProduct(id, updatedFields) {
  const products = getStoredInventory();
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;

  const existing = products[index];
  const updated = sanitizeProduct({
    ...existing,
    ...updatedFields,
    id: existing.id, // preserve ID
    updated_at: new Date().toISOString().split('T')[0]
  });

  products[index] = updated;
  saveStoredInventory(products);
  return updated;
}

// Delete product
export function deleteInventoryProduct(id) {
  const deletedIds = getDeletedInventoryIds();
  const products = getStoredInventory();
  const toDelete = products.find(p => String(p.id) === String(id));
  
  const updatedDeleted = [...deletedIds, String(id)];
  if (toDelete?.product_code) {
    updatedDeleted.push(String(toDelete.product_code));
  }
  saveDeletedInventoryIds(updatedDeleted);

  const filtered = products.filter(p => String(p.id) !== String(id));
  saveStoredInventory(filtered);

  // Background delete in Firestore
  try {
    const docRef = doc(db, 'inventory', String(id));
    deleteDoc(docRef).catch(() => {});
  } catch {}
  return true;
}

// Quick stock adjustment (+ or -)
export function adjustInventoryStock(id, changeAmount, reason = '') {
  const products = getStoredInventory();
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return null;

  const newQty = Math.max(0, product.quantity + Number(changeAmount));
  return updateInventoryProduct(id, { quantity: newQty });
}

// Non-blocking sync to Firestore
async function syncToFirestore(products) {
  try {
    for (const p of products) {
      const docRef = doc(db, 'inventory', String(p.id));
      await setDoc(docRef, p, { merge: true });
    }
  } catch (e) {
    // Silent fallback
  }
}

// Fast non-blocking pull from Firestore
export async function syncCloudInventory() {
  try {
    const deletedIds = getDeletedInventoryIds();
    const snap = await Promise.race([
      getDocs(collection(db, 'inventory')),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
    ]);

    if (snap && !snap.empty) {
      const cloudProducts = snap.docs
        .map(d => sanitizeProduct(d.data()))
        .filter(p => !deletedIds.includes(String(p.id)) && !deletedIds.includes(String(p.product_code)));
      if (cloudProducts.length > 0) {
        return cloudProducts;
      }
    }
  } catch {}
  return null;
}
