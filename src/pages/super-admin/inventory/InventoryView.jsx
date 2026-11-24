import React, { useState, useEffect, useMemo } from 'react';
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
  MinusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getStoredInventory,
  getStoredCategories,
  saveStoredInventory,
  addInventoryProduct,
  updateInventoryProduct,
  deleteInventoryProduct,
  adjustInventoryStock,
  INVENTORY_UNITS,
  syncCloudInventory
} from '../../../utils/inventoryStorage';

export default function InventoryView() {
  const [products, setProducts] = useState(() => getStoredInventory());
  const [categories, setCategories] = useState(() => getStoredCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-asc'); // 'name-asc' | 'price-desc' | 'qty-asc' | 'qty-desc'

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add, obj = Edit
  const [adjustModalProduct, setAdjustModalProduct] = useState(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'deduct'
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form State
  const initialFormState = {
    product_name: '',
    product_code: '',
    category_id: categories[0]?.id || 'vrv_systems',
    description: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    unit: 'PCS',
    min_stock: '5'
  };
  const [formData, setFormData] = useState(initialFormState);

  // Pull cloud inventory in background on mount
  useEffect(() => {
    syncCloudInventory().then((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setProducts(cloudItems);
        saveStoredInventory(cloudItems);
      }
    });
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredInventory());
    };
    window.addEventListener('alzaydan_inventory_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('alzaydan_inventory_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      product_code: `PRD-2026-${String(products.length + 1).padStart(4, '0')}`
    });
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_code: product.product_code,
      category_id: product.category_id,
      description: product.description || '',
      purchase_price: String(product.purchase_price),
      selling_price: String(product.selling_price),
      quantity: String(product.quantity),
      unit: product.unit || 'PCS',
      min_stock: String(product.min_stock || 5)
    });
    setIsFormModalOpen(true);
  };

  // Save / Update submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      toast.error('Please enter product name');
      return;
    }
    if (!formData.product_code.trim()) {
      toast.error('Please enter product code');
      return;
    }
    const purchasePrice = parseFloat(formData.purchase_price);
    const sellingPrice = parseFloat(formData.selling_price);
    const qty = parseInt(formData.quantity, 10);

    if (isNaN(purchasePrice) || purchasePrice < 0) {
      toast.error('Please enter a valid purchase price');
      return;
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      toast.error('Please enter a valid selling price');
      return;
    }
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    const payload = {
      product_name: formData.product_name.trim(),
      product_code: formData.product_code.trim().toUpperCase(),
      category_id: formData.category_id,
      description: formData.description.trim(),
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      quantity: qty,
      unit: formData.unit,
      min_stock: parseInt(formData.min_stock, 10) || 5
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

    setIsFormModalOpen(false);
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
        `Stock for "${adjustModalProduct.product_code}" ${adjustType === 'add' ? 'increased' : 'decreased'} by ${amount} ${adjustModalProduct.unit}`
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
      'Selling Price (AED)',
      'Quantity',
      'Unit',
      'Stock Status',
      'Inventory Valuation (AED)'
    ];
    const rows = filteredProducts.map((p) => {
      const categoryName = categories.find((c) => c.id === p.category_id)?.name || p.category_id;
      const valuation = (p.purchase_price * p.quantity).toFixed(2);
      return [
        p.id,
        `"${p.product_code}"`,
        `"${p.product_name.replace(/"/g, '""')}"`,
        `"${categoryName}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.purchase_price.toFixed(2),
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

  // Live profit calculation for modal
  const modalPurchase = parseFloat(formData.purchase_price) || 0;
  const modalSelling = parseFloat(formData.selling_price) || 0;
  const modalProfit = modalSelling - modalPurchase;
  const modalMarginPct = modalSelling > 0 ? ((modalProfit / modalSelling) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & ACTIONS                                        */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#011635] to-[#04336e] text-white flex items-center justify-center shadow-md shadow-[#011635]/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Inventory &amp; Stock Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage products, product codes, categories, selling prices, and live warehouse inventory.
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
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-[#011635] hover:bg-[#03234d] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:shadow"
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
            <thead className="bg-slate-50 border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">#</th>
                <th className="py-3 px-3.5">Product Code</th>
                <th className="py-3 px-3.5 min-w-[240px]">Product Name &amp; Description</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5 text-right">Selling Price</th>
                <th className="py-3 px-3.5 text-center">Margin</th>
                <th className="py-3 px-3.5 text-center">Stock / Unit</th>
                <th className="py-3 px-3.5 text-center min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <div className="font-bold text-slate-700 text-sm">No products found</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? 'Try clearing your search or filters' : 'Click "Add Product" to create your first inventory item'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const categoryObj = categories.find((c) => c.id === p.category_id);
                  const marginAmount = p.selling_price - p.purchase_price;
                  const marginPct =
                    p.selling_price > 0 ? ((marginAmount / p.selling_price) * 100).toFixed(1) : '0.0';

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
                      {/* ID */}
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-400 text-[11px]">
                        #{String(p.id).padStart(2, '0')}
                      </td>

                      {/* Product Code */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200/60">
                          {p.product_code}
                        </span>
                      </td>

                      {/* Product Name & Description */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {p.product_name}
                        </div>
                        {p.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {categoryObj?.name || p.category_id}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        AED {p.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            marginAmount >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {marginAmount >= 0 ? `+${marginPct}%` : `${marginPct}%`}
                        </span>
                      </td>

                      {/* Quantity & Unit */}
                      <td className="py-3 px-3.5 text-center">
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
                      <td className="py-3 px-3.5 text-center">
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

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
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
      {/* 4. MODAL: ADD / EDIT PRODUCT                                   */}
      {/* ============================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Sticky Header with Closing Arrow on Top Right */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingProduct ? 'Edit Inventory Product' : 'Add New Inventory Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingProduct ? `Updating SKU: ${editingProduct.product_code}` : 'Enter product details, pricing, and stock quantity'}
                  </p>
                </div>
              </div>

              {/* Closing Arrow & Close Button on Top Right */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="Close form"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-red-200/60 shadow-2xs"
                  title="Close"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Product Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daikin VRV-IV X Heat Pump Outdoor Unit 16HP"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                {/* 2. Product Code (SKU) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Product Code / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VRV-IV-16HP"
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value.toUpperCase() })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-700 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                {/* 3. Category ID */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Purchase Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Purchase Price (AED) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      AED
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      className="w-full h-9 pl-12 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* 5. Selling Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Selling Price (AED) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      AED
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      className="w-full h-9 pl-12 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Live Margin Calculation Card */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Calculated Profit Per Unit:</span>
                    <span className={`font-mono font-extrabold ${modalProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      AED {modalProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Gross Margin:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                        modalProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {modalMarginPct}%
                    </span>
                  </div>
                </div>

                {/* 6. Quantity */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Initial Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                {/* 7. Measurement Unit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Measurement Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
                  >
                    {INVENTORY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 8. Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">
                    Product Description &amp; Technical Specifications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed technical specifications, dimensions, refrigerant type, power rating, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons Aligned to Right */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#011635] hover:bg-[#03234d] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: QUICK STOCK IN / OUT ADJUSTMENT                      */}
      {/* ============================================================== */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#011635] text-white flex items-center justify-between">
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
      {/* 6. MODAL: DELETE CONFIRMATION                                  */}
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
