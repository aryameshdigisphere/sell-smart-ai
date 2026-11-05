import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw,
  ArrowUpDown,
  Tag,
  DollarSign,
  PackageCheck,
  PackageX,
  RefreshCw,
  X
} from 'lucide-react';
import { Product, Order, OrderStatus, Currency } from '../types';
import { formatCurrency } from '../utils/currencies';
import { exportProductsToCSV, exportOrdersToCSV } from '../utils/csvExport';

interface OrdersInventoryTabProps {
  products: Product[];
  orders: Order[];
  currency: Currency;
  onAddProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (productId: string, productData: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onRecordOrder: (orderData: Omit<Order, 'id' | 'date'>) => { success: boolean; error?: string };
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => { success: boolean; error?: string };
  onDeleteOrder: (orderId: string) => void;
}

export const OrdersInventoryTab: React.FC<OrdersInventoryTabProps> = ({
  products,
  orders,
  currency,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRecordOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  // Sub-tab: 'inventory' | 'orders'
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders'>('inventory');

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [productSortBy, setProductSortBy] = useState<string>('default');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRecordOrderOpen, setIsRecordOrderOpen] = useState(false);
  const [orderActionError, setOrderActionError] = useState<string | null>(null);

  // Form states - Add/Edit Product
  const [prodForm, setProdForm] = useState({
    sku: '',
    name: '',
    category: '',
    stock: 20,
    lowStockThreshold: 5,
    costPrice: 10.0,
    sellingPrice: 30.0,
    notes: '',
  });

  // Form states - Record Order
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    channel: 'Shopify' as Order['channel'],
    productId: '',
    quantity: 1,
    unitPrice: 0,
    status: 'Confirmed' as OrderStatus,
  });

  // Categories list with dynamic product counts
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map((p) => p.category))).filter(Boolean)];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const query = productSearch.trim().toLowerCase();
      const matchesSearch = 
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query));
      
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      let matchesStock = true;
      if (stockStatusFilter === 'low') {
        matchesStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
      } else if (stockStatusFilter === 'out') {
        matchesStock = p.stock === 0;
      } else if (stockStatusFilter === 'in') {
        matchesStock = p.stock > p.lowStockThreshold;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Apply sorting
    if (productSortBy === 'name-asc') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (productSortBy === 'sku-asc') {
      list = [...list].sort((a, b) => a.sku.localeCompare(b.sku));
    } else if (productSortBy === 'stock-asc') {
      list = [...list].sort((a, b) => a.stock - b.stock);
    } else if (productSortBy === 'stock-desc') {
      list = [...list].sort((a, b) => b.stock - a.stock);
    } else if (productSortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (productSortBy === 'asset-desc') {
      list = [...list].sort((a, b) => (b.stock * b.sellingPrice) - (a.stock * a.sellingPrice));
    }

    return list;
  }, [products, productSearch, categoryFilter, stockStatusFilter, productSortBy]);

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.sku.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      stock: prod.stock,
      lowStockThreshold: prod.lowStockThreshold,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      notes: prod.notes || '',
    });
    setIsAddProductOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.sku.trim() || !prodForm.name.trim()) return;

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, {
        sku: prodForm.sku.trim().toUpperCase(),
        name: prodForm.name.trim(),
        category: prodForm.category.trim() || 'General',
        stock: Math.max(0, prodForm.stock),
        lowStockThreshold: Math.max(0, prodForm.lowStockThreshold),
        costPrice: Math.max(0, prodForm.costPrice),
        sellingPrice: Math.max(0, prodForm.sellingPrice),
        notes: prodForm.notes.trim(),
      });
    } else {
      onAddProduct({
        sku: prodForm.sku.trim().toUpperCase(),
        name: prodForm.name.trim(),
        category: prodForm.category.trim() || 'General',
        stock: Math.max(0, prodForm.stock),
        lowStockThreshold: Math.max(0, prodForm.lowStockThreshold),
        costPrice: Math.max(0, prodForm.costPrice),
        sellingPrice: Math.max(0, prodForm.sellingPrice),
        notes: prodForm.notes.trim(),
      });
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
  };

  // Quick adjust product stock
  const handleQuickAdjustStock = (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    onUpdateProduct(prod.id, { stock: newStock });
  };

  // Open Record Order Modal
  const handleOpenRecordOrder = () => {
    const defaultProduct = products[0];
    setOrderForm({
      customerName: '',
      customerEmail: '',
      channel: 'Shopify',
      productId: defaultProduct ? defaultProduct.id : '',
      quantity: 1,
      unitPrice: defaultProduct ? defaultProduct.sellingPrice : 0,
      status: 'Paid',
    });
    setOrderActionError(null);
    setIsRecordOrderOpen(true);
  };

  // On Product select in Record Order
  const handleOrderProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setOrderForm((prev) => ({
      ...prev,
      productId,
      unitPrice: prod ? prod.sellingPrice : prev.unitPrice,
    }));
  };

  // Save Order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderActionError(null);

    const selectedProd = products.find((p) => p.id === orderForm.productId);
    if (!selectedProd) {
      setOrderActionError('Please select a valid product.');
      return;
    }

    if (!orderForm.customerName.trim()) {
      setOrderActionError('Customer name is required.');
      return;
    }

    if (orderForm.quantity <= 0) {
      setOrderActionError('Order quantity must be at least 1.');
      return;
    }

    const isDeductible = ['Paid', 'Complete', 'Shipped', 'Confirmed'].includes(orderForm.status);

    // Check inventory if deductible status
    if (isDeductible && selectedProd.stock < orderForm.quantity) {
      setOrderActionError(
        `Insufficient inventory! Only ${selectedProd.stock} unit(s) available for SKU ${selectedProd.sku}. Cannot exceed available stock.`
      );
      return;
    }

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = orderForm.quantity * orderForm.unitPrice;

    const res = onRecordOrder({
      orderNumber,
      customerName: orderForm.customerName.trim(),
      customerEmail: orderForm.customerEmail.trim() || 'customer@gmail.com',
      channel: orderForm.channel,
      productId: selectedProd.id,
      productName: selectedProd.name,
      sku: selectedProd.sku,
      quantity: orderForm.quantity,
      unitPrice: orderForm.unitPrice,
      totalAmount,
      status: orderForm.status,
      stockDeducted: isDeductible,
    });

    if (res.success) {
      setIsRecordOrderOpen(false);
    } else {
      setOrderActionError(res.error || 'Failed to record order.');
    }
  };

  // Change status of existing order
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const res = onUpdateOrderStatus(orderId, newStatus);
    if (!res.success && res.error) {
      alert(`Cannot update order status: ${res.error}`);
    }
  };

  // Low stock badge counts
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Boxes className="h-3.5 w-3.5" />
            Inventory & Fulfillment Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Catalog & Live Order Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Strict negative-inventory prevention, automatic stock deduction on order confirmation, and instant restocking when orders are cancelled.
          </p>
        </div>

        {/* Global Export & Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'inventory' ? (
            <>
              <button
                onClick={() => exportProductsToCSV(products)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                title="Download CSV spreadsheet of all inventory"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Products CSV</span>
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdForm({
                    sku: '',
                    name: '',
                    category: '',
                    stock: 25,
                    lowStockThreshold: 5,
                    costPrice: 10.0,
                    sellingPrice: 35.0,
                    notes: '',
                  });
                  setIsAddProductOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => exportOrdersToCSV(orders)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                title="Download CSV spreadsheet of orders"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Orders CSV</span>
              </button>
              <button
                onClick={handleOpenRecordOrder}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Record New Order</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeSubTab === 'inventory'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Boxes className="h-4 w-4 text-emerald-400" />
            <span>Products & Stock</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold">
              {products.length}
            </span>
            {(lowCount > 0 || outCount > 0) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {lowCount + outCount} alert
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeSubTab === 'orders'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShoppingCart className="h-4 w-4 text-indigo-400" />
            <span>Orders & Sales</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PRODUCTS INVENTORY */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Advanced Inventory Search & Category Filter Console */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Top Row: Search Input + Stock Status Filter + Sort By */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              
              {/* Prominent Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-emerald-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search inventory by SKU code or product title... (e.g. MUG-BLK-01, Earbuds, King)"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition shadow-inner"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition"
                    title="Clear search input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Controls: Category Dropdown (Compact), Stock Status & Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700/80 text-xs">
                  <Tag className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c === 'All' ? 'All Categories' : c} ({categoryCounts[c] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock status filter */}
                <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700/80 text-xs">
                  <Filter className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value as any)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">All Stock Levels</option>
                    <option value="in" className="bg-slate-900">In Stock (Healthy)</option>
                    <option value="low" className="bg-slate-900">Low Stock Only</option>
                    <option value="out" className="bg-slate-900">Out of Stock Only</option>
                  </select>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700/80 text-xs">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={productSortBy}
                    onChange={(e) => setProductSortBy(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="default" className="bg-slate-900">Sort: Default</option>
                    <option value="sku-asc" className="bg-slate-900">Sort: SKU (A-Z)</option>
                    <option value="name-asc" className="bg-slate-900">Sort: Name (A-Z)</option>
                    <option value="stock-desc" className="bg-slate-900">Sort: Stock (High-Low)</option>
                    <option value="stock-asc" className="bg-slate-900">Sort: Stock (Low-High)</option>
                    <option value="price-desc" className="bg-slate-900">Sort: Price (High-Low)</option>
                    <option value="asset-desc" className="bg-slate-900">Sort: Total Valuation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick-Click Category Filter Pills */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  Categories:
                </span>
                {categories.map((cat) => {
                  const isSelected = categoryFilter === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Match Counter & Reset Action */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-slate-400 text-[11px]">
                  Showing <strong className="text-white font-bold">{filteredProducts.length}</strong> of{' '}
                  <strong className="text-slate-300 font-bold">{products.length}</strong> products
                </span>

                {(productSearch || categoryFilter !== 'All' || stockStatusFilter !== 'all' || productSortBy !== 'default') && (
                  <button
                    onClick={() => {
                      setProductSearch('');
                      setCategoryFilter('All');
                      setStockStatusFilter('all');
                      setProductSortBy('default');
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 font-semibold">SKU & Item</th>
                    <th className="py-3.5 px-3 font-semibold">Category</th>
                    <th className="py-3.5 px-3 font-semibold">Stock Level</th>
                    <th className="py-3.5 px-3 font-semibold">Safety Alert</th>
                    <th className="py-3.5 px-3 font-semibold">Unit Cost</th>
                    <th className="py-3.5 px-3 font-semibold">Selling Price</th>
                    <th className="py-3.5 px-3 font-semibold">Total Asset Value</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Quick Adjust</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <Search className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-60" />
                        <p className="font-semibold text-slate-200 text-sm">No products match your search or filter</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {productSearch && (
                            <span className="block">Search query: &quot;<strong className="text-emerald-400">{productSearch}</strong>&quot;</span>
                          )}
                          {categoryFilter !== 'All' && (
                            <span className="block">Category filter: &quot;<strong className="text-indigo-400">{categoryFilter}</strong>&quot;</span>
                          )}
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              setProductSearch('');
                              setCategoryFilter('All');
                              setStockStatusFilter('all');
                              setProductSortBy('default');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                          >
                            Clear Search & Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isOut = p.stock === 0;
                      const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                      const assetCost = p.stock * p.costPrice;
                      const assetRetail = p.stock * p.sellingPrice;

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-emerald-400 block text-xs">
                              {p.sku}
                            </span>
                            <span className="font-semibold text-white text-xs block mt-0.5">
                              {p.name}
                            </span>
                            {p.notes && (
                              <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                                {p.notes}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/60">
                              {p.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-extrabold text-sm ${
                                isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-slate-100'
                              }`}>
                                {p.stock}
                              </span>
                              <span className="text-slate-400 text-[11px]">units</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <PackageX className="h-3 w-3" />
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="h-3 w-3" />
                                Low (≤ {p.lowStockThreshold})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <PackageCheck className="h-3 w-3" />
                                Healthy
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-slate-300 font-medium">
                            {formatCurrency(p.costPrice, currency)}
                          </td>

                          <td className="py-3.5 px-3 text-white font-bold">
                            {formatCurrency(p.sellingPrice, currency)}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="text-xs">
                              <span className="font-bold text-slate-200">{formatCurrency(assetCost, currency)}</span>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                ({formatCurrency(assetRetail, currency)} retail)
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                              <button
                                onClick={() => handleQuickAdjustStock(p, -1)}
                                disabled={p.stock <= 0}
                                className="px-2 py-0.5 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 rounded transition"
                                title="Deduct 1 unit (cannot go below 0)"
                              >
                                -1
                              </button>
                              <button
                                onClick={() => handleQuickAdjustStock(p, 1)}
                                className="px-2 py-0.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition"
                                title="Add 1 unit"
                              >
                                +1
                              </button>
                              <button
                                onClick={() => handleQuickAdjustStock(p, 10)}
                                className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition"
                                title="Restock +10 units"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                                title="Edit product parameters"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${p.sku} - ${p.name}?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                title="Delete product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
          </div>
        </div>
      )}

      {/* SUBTAB 2: ORDERS MANAGEMENT */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Order Filters */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-2 bg-slate-800/80 rounded-lg px-3 py-2 border border-slate-700/80">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search orders by Order #, Customer, or Product..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full text-xs font-medium placeholder-slate-500"
              />
              {orderSearch && (
                <button onClick={() => setOrderSearch('')} className="text-slate-400 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800/80 rounded-lg px-2.5 py-1.5 border border-slate-700/80">
                <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Order Statuses</option>
                  <option value="Paid" className="bg-slate-900">Paid</option>
                  <option value="Pending" className="bg-slate-900">Pending</option>
                  <option value="Shipped" className="bg-slate-900">Shipped</option>
                  <option value="Complete" className="bg-slate-900">Complete</option>
                  <option value="Cancelled" className="bg-slate-900">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 font-semibold">Order #</th>
                    <th className="py-3.5 px-3 font-semibold">Date</th>
                    <th className="py-3.5 px-3 font-semibold">Customer</th>
                    <th className="py-3.5 px-3 font-semibold">Channel</th>
                    <th className="py-3.5 px-3 font-semibold">Product & SKU</th>
                    <th className="py-3.5 px-3 font-semibold">Qty</th>
                    <th className="py-3.5 px-3 font-semibold">Total</th>
                    <th className="py-3.5 px-3 font-semibold">Inventory Effect</th>
                    <th className="py-3.5 px-3 font-semibold">Order Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <ShoppingCart className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                        <p className="font-semibold text-slate-300">No orders recorded yet</p>
                        <p className="text-xs text-slate-500 mt-1">Click &quot;Record New Order&quot; to log sales.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      return (
                        <tr key={o.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                            {o.orderNumber}
                          </td>

                          <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                            {new Date(o.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-white block">{o.customerName}</span>
                            <span className="text-[10px] text-slate-400">{o.customerEmail}</span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/60">
                              {o.channel}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 max-w-[180px]">
                            <span className="font-mono text-[10px] text-emerald-400 block font-semibold">
                              {o.sku}
                            </span>
                            <span className="text-slate-200 font-medium truncate block">
                              {o.productName}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-slate-200 font-bold">
                            {o.quantity}
                          </td>

                          <td className="py-3.5 px-3 font-extrabold text-white">
                            {formatCurrency(o.totalAmount, currency)}
                          </td>

                          <td className="py-3.5 px-3">
                            {o.stockDeducted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Stock Deducted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                <Clock className="h-3 w-3" />
                                Stock Preserved
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            {/* Status Selector dropdown */}
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                                o.status === 'Paid' || o.status === 'Complete' || o.status === 'Confirmed'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                  : o.status === 'Shipped'
                                  ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
                                  : o.status === 'Pending'
                                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                  : 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                              }`}
                            >
                              <option value="Paid" className="bg-slate-900 text-emerald-400">Paid</option>
                              <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                              <option value="Shipped" className="bg-slate-900 text-cyan-400">Shipped</option>
                              <option value="Complete" className="bg-slate-900 text-emerald-400">Complete</option>
                              <option value="Cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                              {o.status === 'Confirmed' && (
                                <option value="Confirmed" className="bg-slate-900 text-emerald-400">Confirmed</option>
                              )}
                              {o.status === 'Refunded' && (
                                <option value="Refunded" className="bg-slate-900 text-purple-400">Refunded</option>
                              )}
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete order ${o.orderNumber}? If confirmed, stock will be restored.`)) {
                                  onDeleteOrder(o.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Delete order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Boxes className="h-5 w-5 text-emerald-400" />
                <span>{editingProduct ? 'Edit Catalog Product' : 'Add New Inventory Product'}</span>
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MUG-BLK-01"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen & Drinkware"
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceramic Matte Travel Mug (16oz)"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Zero or higher (cannot be negative)</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Low-Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={prodForm.lowStockThreshold}
                    onChange={(e) => setProdForm({ ...prodForm, lowStockThreshold: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Alert triggered at or below this value</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit Cost Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={prodForm.costPrice}
                    onChange={(e) => setProdForm({ ...prodForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit Selling Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={prodForm.sellingPrice}
                    onChange={(e) => setProdForm({ ...prodForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Notes / Supplier Details</label>
                <textarea
                  rows={2}
                  placeholder="Optional supplier link, lead time, or variant details..."
                  value={prodForm.notes}
                  onChange={(e) => setProdForm({ ...prodForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD ORDER */}
      {isRecordOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-400" />
                <span>Record New Customer Order</span>
              </h3>
              <button
                onClick={() => setIsRecordOrderOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {orderActionError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{orderActionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Channel</label>
                  <select
                    value={orderForm.channel}
                    onChange={(e) => setOrderForm({ ...orderForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Shopify">Shopify Store</option>
                    <option value="Amazon">Amazon Marketplace</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                    <option value="Direct">Direct Invoice</option>
                    <option value="Manual">Manual Phone / Counter</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Initial Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Confirmed">Confirmed (Deduct Stock Now)</option>
                    <option value="Pending">Pending (Hold Stock)</option>
                    <option value="Cancelled">Cancelled (No Deduction)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Select Product *</label>
                <select
                  required
                  value={orderForm.productId}
                  onChange={(e) => handleOrderProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} - {p.stock} in stock ({formatCurrency(p.sellingPrice, currency)})
                    </option>
                  ))}
                </select>
                {(() => {
                  const selProd = products.find((p) => p.id === orderForm.productId);
                  if (selProd) {
                    return (
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Available in stock: <strong className="text-emerald-400">{selProd.stock} units</strong></span>
                        <span>Retail price: {formatCurrency(selProd.sellingPrice, currency)}</span>
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Unit Price ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={orderForm.unitPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Order Status selector */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Order Status</label>
                <select
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as OrderStatus })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Paid">Paid (Deducts stock immediately)</option>
                  <option value="Pending">Pending (Preserves stock until paid)</option>
                  <option value="Shipped">Shipped (Deducts stock)</option>
                  <option value="Complete">Complete (Deducts stock)</option>
                  <option value="Cancelled">Cancelled (Does not deduct stock)</option>
                </select>
              </div>

              {/* Order Total Preview */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Total Order Value:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(orderForm.quantity * orderForm.unitPrice, currency)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordOrderOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20"
                >
                  Save Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
