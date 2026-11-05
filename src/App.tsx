import React, { useState, useEffect } from 'react';
import { 
  Currency, 
  Product, 
  Order, 
  OrderStatus, 
  CalculatorInput, 
  CalculatorOutput, 
  SavedScenario, 
  SavedCopy 
} from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SCENARIOS } from './utils/demoData';
import { Navbar, AppTab } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { CalculatorTab } from './components/CalculatorTab';
import { OrdersInventoryTab } from './components/OrdersInventoryTab';
import { ContentStudioTab } from './components/ContentStudioTab';
import { SettingsTab } from './components/SettingsTab';
import { ResetConfirmModal } from './components/ResetConfirmModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('overview');

  // Currency State (default USD)
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('sell_smart_currency');
    return (saved as Currency) || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_currency', currency);
  }, [currency]);

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading products from localStorage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_products', JSON.stringify(products));
  }, [products]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading orders from localStorage:', e);
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_orders', JSON.stringify(orders));
  }, [orders]);

  // Saved Calculator Scenarios
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_scenarios');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading scenarios from localStorage:', e);
    }
    return INITIAL_SCENARIOS;
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_scenarios', JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  // Saved Copy Library
  const [savedCopyList, setSavedCopyList] = useState<SavedCopy[]>(() => {
    try {
      const saved = localStorage.getItem('sell_smart_copy');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading copy library from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sell_smart_copy', JSON.stringify(savedCopyList));
  }, [savedCopyList]);

  // Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Cross-tab transfer product state (e.g., from overview to content studio)
  const [focusedProduct, setFocusedProduct] = useState<Product | null>(null);

  // Low stock counter for header badge
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  // ----------------------------------------------------
  // PRODUCT OPERATIONS
  // ----------------------------------------------------
  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (productId: string, partial: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...partial } : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleRestockProduct = (productId: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + amount } : p))
    );
  };

  // ----------------------------------------------------
  // ORDER OPERATIONS WITH INVENTORY DEDUCTION & RESTORATION
  // ----------------------------------------------------
  const DEDUCTIBLE_STATUSES: OrderStatus[] = ['Paid', 'Complete', 'Shipped', 'Confirmed'];
  const RESTORABLE_STATUSES: OrderStatus[] = ['Cancelled', 'Refunded'];

  const handleRecordOrder = (
    orderData: Omit<Order, 'id' | 'date'>
  ): { success: boolean; error?: string } => {
    const product = products.find((p) => p.id === orderData.productId);
    const shouldDeduct = DEDUCTIBLE_STATUSES.includes(orderData.status);

    if (shouldDeduct) {
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }
      if (product.stock < orderData.quantity) {
        return {
          success: false,
          error: `Insufficient inventory! Only ${product.stock} units remaining for SKU ${product.sku}. Negative inventory is prohibited.`,
        };
      }
      // Deduct inventory
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock: Math.max(0, p.stock - orderData.quantity) } : p
        )
      );
    }

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      date: new Date().toISOString(),
      stockDeducted: shouldDeduct,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { success: true };
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus
  ): { success: boolean; error?: string } => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { success: false, error: 'Order not found.' };

    const product = products.find(
      (p) => p.id === targetOrder.productId || p.sku === targetOrder.sku
    );

    let willBeStockDeducted = targetOrder.stockDeducted;
    const isTargetDeductible = DEDUCTIBLE_STATUSES.includes(newStatus);
    const isTargetRestorable = RESTORABLE_STATUSES.includes(newStatus);

    // Case 1: Switching to a fulfilled status (Paid/Complete/Shipped/Confirmed) and stock was NOT yet deducted
    if (isTargetDeductible && !targetOrder.stockDeducted) {
      if (product) {
        if (product.stock < targetOrder.quantity) {
          return {
            success: false,
            error: `Cannot fulfill order: Insufficient stock for ${product.sku} (Only ${product.stock} available, needs ${targetOrder.quantity}).`,
          };
        }
        // Deduct stock
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stock: Math.max(0, p.stock - targetOrder.quantity) }
              : p
          )
        );
      }
      willBeStockDeducted = true;
    }

    // Case 2: Switching to Cancelled or Refunded and stock WAS previously deducted -> RESTORE STOCK
    else if (isTargetRestorable && targetOrder.stockDeducted) {
      if (product) {
        // Restore stock
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stock: p.stock + targetOrder.quantity }
              : p
          )
        );
      }
      willBeStockDeducted = false;
    }

    // Update order in state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, stockDeducted: willBeStockDeducted }
          : o
      )
    );

    return { success: true };
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find((o) => o.id === orderId);
    if (orderToDelete && orderToDelete.stockDeducted) {
      // If order had deducted stock, restore it upon deletion
      const product = products.find(
        (p) => p.id === orderToDelete.productId || p.sku === orderToDelete.sku
      );
      if (product) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stock: p.stock + orderToDelete.quantity }
              : p
          )
        );
      }
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // ----------------------------------------------------
  // SCENARIO OPERATIONS
  // ----------------------------------------------------
  const handleSaveScenario = (
    name: string,
    input: CalculatorInput,
    output: CalculatorOutput
  ) => {
    const newScenario: SavedScenario = {
      id: `scen-${Date.now()}`,
      name,
      date: new Date().toISOString().split('T')[0],
      input,
      output,
    };
    setSavedScenarios((prev) => [newScenario, ...prev]);
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // ----------------------------------------------------
  // COPY LIBRARY OPERATIONS
  // ----------------------------------------------------
  const handleSaveCopy = (copy: SavedCopy) => {
    setSavedCopyList((prev) => [copy, ...prev]);
  };

  const handleDeleteSavedCopy = (id: string) => {
    setSavedCopyList((prev) => prev.filter((c) => c.id !== id));
  };

  // ----------------------------------------------------
  // RESET & CLEAR CONTROLS
  // ----------------------------------------------------
  const handleResetToDemo = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSavedScenarios(INITIAL_SCENARIOS);
    setSavedCopyList([]);
    localStorage.removeItem('sell_smart_products');
    localStorage.removeItem('sell_smart_orders');
    localStorage.removeItem('sell_smart_scenarios');
    localStorage.removeItem('sell_smart_copy');
  };

  const handleClearAll = () => {
    setProducts([]);
    setOrders([]);
    setSavedScenarios([]);
    setSavedCopyList([]);
    localStorage.removeItem('sell_smart_products');
    localStorage.removeItem('sell_smart_orders');
    localStorage.removeItem('sell_smart_scenarios');
    localStorage.removeItem('sell_smart_copy');
  };

  const handleImportAllData = (backup: any) => {
    if (Array.isArray(backup.products)) {
      setProducts(backup.products);
    }
    if (Array.isArray(backup.orders)) {
      setOrders(backup.orders);
    }
    if (Array.isArray(backup.savedScenarios)) {
      setSavedScenarios(backup.savedScenarios);
    }
    if (Array.isArray(backup.savedCopyList)) {
      setSavedCopyList(backup.savedCopyList);
    }
    if (Array.isArray(backup.history)) {
      localStorage.setItem('sell_smart_content_history', JSON.stringify(backup.history));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Universal Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        lowStockCount={lowStockCount}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <OverviewTab
            products={products}
            orders={orders}
            currency={currency}
            onNavigateTab={setActiveTab}
            onRestockProduct={handleRestockProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onLoadProductToCalculator={(prod) => setFocusedProduct(prod)}
          />
        )}

        {/* Tab 2: Sales & Profit Calculator */}
        {activeTab === 'calculator' && (
          <CalculatorTab
            products={products}
            currency={currency}
            savedScenarios={savedScenarios}
            onSaveScenario={handleSaveScenario}
            onDeleteScenario={handleDeleteScenario}
          />
        )}

        {/* Tab 3: Orders & Inventory Hub */}
        {activeTab === 'inventory' && (
          <OrdersInventoryTab
            products={products}
            orders={orders}
            currency={currency}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRecordOrder={handleRecordOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {/* Tab 4: Content Studio */}
        {activeTab === 'content' && (
          <ContentStudioTab
            products={products}
            savedCopyList={savedCopyList}
            onSaveCopy={handleSaveCopy}
            onDeleteSavedCopy={handleDeleteSavedCopy}
            initialProduct={focusedProduct}
          />
        )}

        {/* Tab 5: Settings & Deployment Guide */}
        {activeTab === 'settings' && (
          <SettingsTab
            currency={currency}
            setCurrency={setCurrency}
            products={products}
            orders={orders}
            savedScenarios={savedScenarios}
            savedCopyList={savedCopyList}
            onResetToDemo={handleResetToDemo}
            onClearAll={handleClearAll}
            onImportAllData={handleImportAllData}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">SELL SMART AI</span>
            <span>•</span>
            <span>Ecommerce Profit Engineering & Inventory Suite</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client Currency: <strong className="text-slate-200">{currency}</strong></span>
            <span>•</span>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 underline underline-offset-2 transition"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>

      {/* Reset / Clear Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetToDemo={handleResetToDemo}
        onClearAll={handleClearAll}
      />

    </div>
  );
}
