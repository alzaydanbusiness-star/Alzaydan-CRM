import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PackageCheck,
  ArrowLeft,
  X,
  FileSpreadsheet,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  Upload,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Truck,
  Check,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredInventory,
  getStoredCategories,
  addInventoryCategory,
  saveStoredInventory,
  addInventoryProduct,
  updateInventoryProduct,
  deleteInventoryProduct,
  adjustInventoryStock,
  INVENTORY_UNITS,
  syncCloudInventory
} from '../../../utils/inventoryStorage';
import { fetchInventoryFromApi } from '../../../api/crmApi';

export default function InventoryView() {
  const [products, setProducts] = useState(() => getStoredInventory());
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-asc'); // 'name-asc' | 'price-desc' | 'qty-asc' | 'qty-desc'

  // View Mode: 'list' (inventory table) | 'form' (full-page Add/Edit view)
  const [viewMode, setViewMode] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, obj = Edit

  // Quick Adjust & Delete Modals (these remain quick modals)
  const [adjustModalProduct, setAdjustModalProduct] = useState(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'deduct'
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Dynamic Category Creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const initialFormState = {
    product_name: '',
    product_code: '', // Empty by default as requested (no PRD-2026-0001 prefill)
    category_id: categories[0]?.id || 'general',
    description: '',
    purchase_price: '',
    shipping_cost: '', // Shipping cost field requested
    selling_price: '',
    quantity: '',
    unit: 'PCS',
    min_stock: '5',
    product_image: '', // Primary image
    product_image2: '' // Secondary / detail image
  };
  const [formData, setFormData] = useState(initialFormState);

  // Hidden file input refs for 2 image uploads
  const imageInputRef1 = useRef(null);
  const imageInputRef2 = useRef(null);

  // Pull cloud inventory in background on mount (Firestore + Cloudflare D1)
  useEffect(() => {
    syncCloudInventory().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setProducts(cloudItems);
        saveStoredInventory(cloudItems);
      }
    });

    fetchInventoryFromApi()
      .then((apiItems) => {
        if (Array.isArray(apiItems) && apiItems.length > 0) {
          setProducts((prev) => {
            const map = new Map();
            prev.forEach((p) => map.set(p.product_code || p.id, p));
            apiItems.forEach((p) => {
              map.set(p.code || p.id, {
                id: p.id,
                product_name: p.name,
                product_code: p.code,
                category_id: p.category,
                selling_price: p.sellingPrice,
                purchase_price: p.purchasePrice,
                quantity: p.stock,
                unit: p.unit || 'PCS',
                min_stock: p.lowStockAlert || 5,
                product_image: p.image1 || '',
                product_image2: p.image2 || '',
                description: p.description || ''
              });
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredInventory());
      setCategories(getStoredCategories());
    };
    window.addEventListener('alzaydan_inventory_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('alzaydan_inventory_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Open Full-Page Create Form
  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      category_id: categories[0]?.id || 'general',
      product_code: '' // Blank SKU as requested
    });
    setIsAddingCategory(false);
    setNewCategoryName('');
    setViewMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Full-Page Edit Form
  const handleOpenEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name || '',
      product_code: product.product_code || '',
      category_id: product.category_id || categories[0]?.id || 'general',
      description: product.description || '',
      purchase_price: product.purchase_price !== undefined ? String(product.purchase_price) : '',
      shipping_cost: product.shipping_cost !== undefined ? String(product.shipping_cost) : '',
      selling_price: product.selling_price !== undefined ? String(product.selling_price) : '',
      quantity: product.quantity !== undefined ? String(product.quantity) : '',
      unit: product.unit || 'PCS',
      min_stock: String(product.min_stock || 5),
      product_image: product.product_image || '',
      product_image2: product.product_image2 || ''
    });
    setIsAddingCategory(false);
    setNewCategoryName('');
    setViewMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle dynamic category addition
  const handleCreateCategory = (e) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }
    const created = addInventoryCategory(trimmed);
    if (created) {
      const updatedCats = getStoredCategories();
      setCategories(updatedCats);
      setFormData((prev) => ({ ...prev, category_id: created.id }));
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast.success(`Category "${created.name}" created and selected!`);
    }
  };

  // Handle image upload with Base64 encoding
  const handleImageFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result }));
      toast.success(
        field === 'product_image' ? 'Primary product image loaded' : 'Detail/secondary image loaded'
      );
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleRemoveImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  // Save / Update submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      toast.error('Please enter product name');
      return;
    }

    const purchasePrice = parseFloat(formData.purchase_price) || 0;
    const shippingCost = parseFloat(formData.shipping_cost) || 0;
    const sellingPrice = parseFloat(formData.selling_price);
    const qty = parseInt(formData.quantity, 10);

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      toast.error('Please enter a valid selling price');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // If user provided a code, use it. If left blank, generate clean SKU
    let productCode = formData.product_code.trim().toUpperCase();
    if (!productCode) {
      productCode = `PRD-${Date.now().toString().slice(-6)}`;
    }

    const payload = {
      product_name: formData.product_name.trim(),
      product_code: productCode,
      category_id: formData.category_id,
      description: formData.description.trim(),
      purchase_price: purchasePrice,
      shipping_cost: shippingCost,
      selling_price: sellingPrice,
      quantity: qty,
      unit: formData.unit,
      min_stock: parseInt(formData.min_stock, 10) || 5,
      product_image: formData.product_image || '',
      product_image2: formData.product_image2 || ''
    };

    if (editingProduct) {
      const updated = updateInventoryProduct(editingProduct.id, payload);
      if (updated) {
        setProducts(getStoredInventory());
        toast.success(`Product "${updated.product_name}" updated successfully!`);
      }
    } else {
      const created = addInventoryProduct(payload);
      setProducts(getStoredInventory());
      toast.success(`Product "${created.product_name}" added to inventory!`);
    }

    setViewMode('list');
  };

  // Quick Stock Adjustment submission
  const handleConfirmStockAdjust = (e) => {
    e.preventDefault();
    const amount = parseInt(adjustQtyInput, 10);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid quantity change');
      return;
    }
    const delta = adjustType === 'add' ? amount : -amount;
    const updated = adjustInventoryStock(adjustModalProduct.id, delta);
    if (updated) {
      setProducts(getStoredInventory());
      toast.success(
        `Stock for "${adjustModalProduct.product_code}" ${
          adjustType === 'add' ? 'increased' : 'decreased'
        } by ${amount} ${adjustModalProduct.unit}`
      );
    }
    setAdjustModalProduct(null);
    setAdjustQtyInput('');
  };

  // Delete product
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    deleteInventoryProduct(deleteCandidate.id);
    setProducts(getStoredInventory());
    toast.success(`Product "${deleteCandidate.product_name}" removed from inventory`);
    setDeleteCandidate(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error('No inventory products to export');
      return;
    }
    const headers = [
      'ID',
      'Product Code',
      'Product Name',
      'Category',
      'Description',
      'Purchase Price (AED)',
      'Shipping Cost (AED)',
      'Selling Price (AED)',
      'Quantity',
      'Unit',
      'Stock Status',
      'Inventory Valuation (AED)'
    ];
    const rows = filteredProducts.map((p) => {
      const categoryName = categories.find((c) => c.id === p.category_id)?.name || p.category_id;
      const valuation = ((p.purchase_price + (p.shipping_cost || 0)) * p.quantity).toFixed(2);
      return [
        p.id,
        `"${p.product_code}"`,
        `"${p.product_name.replace(/"/g, '""')}"`,
        `"${categoryName}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        (p.purchase_price || 0).toFixed(2),
        (p.shipping_cost || 0).toFixed(2),
        p.selling_price.toFixed(2),
        p.quantity,
        p.unit,
        p.status,
        valuation
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Al_Zaydan_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory report exported as CSV!');
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (p.product_name || '').toLowerCase().includes(q);
          const matchCode = (p.product_code || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCat = (p.category_id || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchDesc && !matchCat) return false;
        }
        // Category
        if (selectedCategory !== 'ALL' && p.category_id !== selectedCategory) {
          return false;
        }
        // Status
        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'IN_STOCK' && p.status !== 'In Stock') return false;
          if (selectedStatus === 'LOW_STOCK' && p.status !== 'Low Stock') return false;
          if (selectedStatus === 'OUT_OF_STOCK' && p.status !== 'Out of Stock') return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.product_name.localeCompare(b.product_name);
        if (sortBy === 'price-desc') return b.selling_price - a.selling_price;
        if (sortBy === 'price-asc') return a.selling_price - b.selling_price;
        if (sortBy === 'qty-desc') return b.quantity - a.quantity;
        if (sortBy === 'qty-asc') return a.quantity - b.quantity;
        return a.id - b.id;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // =========================================================================
  // VIEW MODE: FULL-PAGE FORM (Add or Edit Product)
  // =========================================================================
  if (viewMode === 'form') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Top Header & Breadcrumb Bar */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                title="Back to Inventory"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-blue-700">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#002B66] tracking-tight mt-0.5">
                  {editingProduct ? `Edit Product: ${editingProduct.product_name}` : 'Add New Inventory Product'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter product specifications, custom SKU, pricing structure, shipping costs, and product photos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#003579] hover:bg-[#002B66] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Check className="w-4 h-4" />
                <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Full-Page Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Product Details & Description */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Core Product Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>General Information</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">Required fields marked with *</span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Product Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Daikin VRV-IV X Heat Pump Outdoor Unit 16HP"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="w-full h-10 px-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      required
                    />
                  </div>

                  {/* SKU & Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Code / SKU (starts empty, user enters their own code) */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center justify-between">
                        <span>Product Code / SKU</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional custom code</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SKU-10024 or custom code"
                        value={formData.product_code}
                        onChange={(e) =>
                          setFormData({ ...formData, product_code: e.target.value.toUpperCase() })
                        }
                        className="w-full h-10 px-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    {/* Category with clean list + inline "+ New" Category Creator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 flex items-center gap-1">
                          <span>Category</span>
                          <span className="text-red-500">*</span>
                        </label>
                        {!isAddingCategory && (
                          <button
                            type="button"
                            onClick={() => setIsAddingCategory(true)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>+ New</span>
                          </button>
                        )}
                      </div>

                      {isAddingCategory ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                          <input
                            type="text"
                            placeholder="New category name..."
                            autoFocus
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateCategory();
                              }
                            }}
                            className="flex-1 h-10 px-3 bg-white border border-blue-400 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            className="h-10 px-3 bg-[#003579] hover:bg-[#002B66] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }}
                            className="h-10 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={formData.category_id}
                          onChange={(e) => {
                            if (e.target.value === '__NEW__') {
                              setIsAddingCategory(true);
                            } else {
                              setFormData({ ...formData, category_id: e.target.value });
                            }
                          }}
                          className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                          <option value="__NEW__" className="text-blue-600 font-bold">
                            + Add New Category...
                          </option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Stock Quantity, Unit, and Min Stock Alert */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <span>Initial Quantity</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full h-10 px-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    {/* Unit */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <span>Measurement Unit</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full h-10 px-3 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-600 cursor-pointer"
                      >
                        {INVENTORY_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Stock Alert */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">
                        <span>Low Stock Alert</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="5"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                        className="w-full h-10 px-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Technical Description */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Product Description &amp; Technical Specifications</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <textarea
                    rows={5}
                    placeholder="Enter detailed product description, specifications, dimensions, serial tags, warranty, origin, or customer guidance notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Pricing, Shipping Cost, Profit Breakdown, and 2 Image Uploads */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 3: Pricing & Shipping Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>Pricing &amp; Shipping (AED)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    AED Currency
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Purchase Price (Cost to Company) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Purchase Price (AED)</span>
                      <span className="text-[10px] font-semibold text-slate-400">Supplier / Cost</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                        AED
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        className="w-full h-10 pl-14 pr-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Selling Price (AED)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                        AED
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        className="w-full h-10 pl-14 pr-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Price / Cost Field */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Shipping Price / Cost (AED)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                        AED
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.shipping_cost}
                        onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                        className="w-full h-10 pl-14 pr-3.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Standard freight, local delivery, or handling cost associated with this item.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Two Product Image Uploads */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>Product Images (2 Upload Slots)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">PNG, JPG up to 5MB</span>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={imageInputRef1}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange('product_image', e)}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={imageInputRef2}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange('product_image2', e)}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Slot 1: Primary Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">1. Primary Photo</span>
                      {formData.product_image && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('product_image')}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {formData.product_image ? (
                      <div className="relative group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden h-36 flex items-center justify-center">
                        <img
                          src={formData.product_image}
                          alt="Primary Product"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => imageInputRef1.current?.click()}
                          className="absolute inset-0 bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-bold text-xs gap-1 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Change Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef1.current?.click()}
                        className="h-36 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center p-3 text-center transition cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shadow-2xs transition mb-1.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                          Upload Main Image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click or drag file</span>
                      </div>
                    )}
                  </div>

                  {/* Slot 2: Detail / Secondary Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">2. Detail / Spec Photo</span>
                      {formData.product_image2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('product_image2')}
                          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {formData.product_image2 ? (
                      <div className="relative group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden h-36 flex items-center justify-center">
                        <img
                          src={formData.product_image2}
                          alt="Detail Product"
                          className="w-full h-full object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => imageInputRef2.current?.click()}
                          className="absolute inset-0 bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-bold text-xs gap-1 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Change Photo</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef2.current?.click()}
                        className="h-36 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center p-3 text-center transition cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center shadow-2xs transition mb-1.5">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                          Upload Detail Image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Click or drag file</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Products List</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#003579] hover:bg-[#002B66] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Check className="w-4 h-4" />
                <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: INVENTORY PRODUCTS LIST / TABLE
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & ACTIONS                                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003579] border border-blue-100 flex items-center justify-center">
              <Boxes className="w-5 h-5 text-[#003579]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Inventory &amp; Stock Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage products, SKU codes, categories, pricing, purchase costs, and warehouse stock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="px-4 py-2.5 rounded-xl bg-[#003579] hover:bg-[#002B66] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FILTER & SEARCH BAR                                         */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, product code, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock (&gt; 5)</option>
            <option value="LOW_STOCK">Low Stock (1 - 5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="id-asc">Sort: Default ID</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="qty-desc">Sort: Stock Quantity (High to Low)</option>
            <option value="qty-asc">Sort: Stock Quantity (Low to High)</option>
          </select>

          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="h-9 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs font-semibold transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. INVENTORY PRODUCTS TABLE                                    */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-600 tracking-tight">
              <tr>
                <th className="py-3 px-4 text-center w-12 text-slate-500">#</th>
                <th className="py-3 px-4">Product Code</th>
                <th className="py-3 px-4 min-w-[240px]">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Purchase Price</th>
                <th className="py-3 px-4 text-center">Stock / Unit</th>
                <th className="py-3 px-4 text-center min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <div className="font-bold text-slate-700 text-sm">No products found</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {searchQuery
                        ? 'Try clearing your search or filters'
                        : 'Click "Add Product" to create your first inventory item'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const categoryObj = categories.find((c) => c.id === p.category_id);

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In Stock
                    </span>
                  );
                  if (p.status === 'Low Stock') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Low Stock
                      </span>
                    );
                  } else if (p.status === 'Out of Stock') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* # / Index */}
                      <td className="py-3 px-4 text-center font-medium text-slate-400 text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Product Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.product_code || '—'}
                        </span>
                      </td>

                      {/* Product Name, Thumbnail & Description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {p.product_image ? (
                            <img
                              src={p.product_image}
                              alt={p.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Boxes className="w-5 h-5 stroke-1" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-sm">
                              {p.product_name}
                            </div>
                            {p.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-sm">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {categoryObj?.name || p.category_id}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        AED{' '}
                        {(p.selling_price || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>

                      {/* Purchase Price (Hidden as simple '-') */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-400 text-sm">
                        -
                      </td>

                      {/* Quantity & Unit */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {p.quantity}{' '}
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                              {p.unit}
                            </span>
                          </span>
                          {statusBadge}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Adjust Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustModalProduct(p);
                              setAdjustQtyInput('');
                              setAdjustType('add');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition cursor-pointer shadow-2xs"
                            title="Quick Stock In / Out"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button -> Opens Full Page Form */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 transition-all font-semibold flex items-center gap-1 cursor-pointer shadow-2xs text-[11px]"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 transition-all font-semibold flex items-center gap-1 cursor-pointer shadow-2xs text-[11px]"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-700">{products.length}</strong> inventory products
          </span>
          <span className="font-medium text-[11px]">All values in UAE Dirham (AED)</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. MODAL: QUICK STOCK IN / OUT ADJUSTMENT                      */}
      {/* ============================================================== */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#003579] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Quick Stock Adjustment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalProduct(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Selected Product:</div>
                <div className="font-bold text-slate-900 text-sm">{adjustModalProduct.product_name}</div>
                <div className="font-mono text-xs font-semibold text-blue-700 mt-0.5">
                  Code: {adjustModalProduct.product_code}
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  Current Warehouse Stock:{' '}
                  <strong className="text-slate-900 text-sm">
                    {adjustModalProduct.quantity} {adjustModalProduct.unit}
                  </strong>
                </div>
              </div>

              {/* Adjust Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    adjustType === 'add'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Stock IN (Add)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('deduct')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    adjustType === 'deduct'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Stock OUT (Deduct)</span>
                </button>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Quantity to {adjustType === 'add' ? 'Add' : 'Deduct'} ({adjustModalProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  autoFocus
                  value={adjustQtyInput}
                  onChange={(e) => setAdjustQtyInput(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              {/* Action Buttons Aligned to Right */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-lg text-xs transition cursor-pointer ${
                    adjustType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {adjustType === 'add' ? 'Stock In' : 'Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: DELETE CONFIRMATION                                  */}
      {/* ============================================================== */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Product?</h3>
                <p className="text-slate-500 text-[11px]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">"{deleteCandidate.product_name}"</strong> (Code:{' '}
              <span className="font-mono font-bold text-blue-700">{deleteCandidate.product_code}</span>)?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
