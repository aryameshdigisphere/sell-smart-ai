import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Plus,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Activity
} from 'lucide-react';
import { Product, Order, Currency, OrderStatus } from '../types';
import { formatCurrency } from '../utils/currencies';
import { calculateProfit } from '../utils/calculator';
import { AppTab } from './Navbar';

interface OverviewTabProps {
  products: Product[];
  orders: Order[];
  currency: Currency;
  onNavigateTab: (tab: AppTab) => void;
  onRestockProduct: (productId: string, amount: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onLoadProductToCalculator: (product: Product) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  products,
  orders,
  currency,
  onNavigateTab,
  onRestockProduct,
  onUpdateOrderStatus,
  onLoadProductToCalculator,
}) => {
  // Quick Simulator state in Overview
  const [simPrice, setSimPrice] = useState(39.99);
  const [simCost, setSimCost] = useState(11.50);
  const [simUnits, setSimUnits] = useState(150);

  const simResult = calculateProfit({
    sellingPrice: simPrice,
    productCost: simCost,
    packaging: 2.00,
    sellerPaidShipping: 4.50,
    otherVariableCosts: 1.00,
    percentagePaymentFee: 2.9,
    fixedFeePerOrder: 0.30,
    unitsPerOrder: 1,
    numberOfOrders: simUnits,
  });

  // Calculate real metrics from paid/confirmed orders
  const fulfilledStatuses: OrderStatus[] = ['Confirmed', 'Paid', 'Complete', 'Shipped'];
  const confirmedOrders = orders.filter((o) => fulfilledStatuses.includes(o.status));
  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const grossRevenue = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Calculate estimated profit from confirmed orders
  const totalOrderProfit = confirmedOrders.reduce((sum, o) => {
    const product = products.find((p) => p.id === o.productId || p.sku === o.sku);
    const costPerUnit = product ? product.costPrice : o.unitPrice * 0.35; // reasonable estimate if deleted
    // Estimate shipping + packaging approx $4.50 + $1.50 and Stripe fee 2.9% + $0.30
    const variableCost = o.quantity * (costPerUnit + 4.50 + 1.50);
    const fee = (o.totalAmount * 0.029) + 0.30;
    const profit = o.totalAmount - (variableCost + fee);
    return sum + profit;
  }, 0);

  const overallMargin = grossRevenue > 0 ? (totalOrderProfit / grossRevenue) * 100 : 0;
  const avgOrderValue = confirmedOrders.length > 0 ? grossRevenue / confirmedOrders.length : 0;

  // Inventory valuation
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockCostValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalStockRetailValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Chart range state: defaults to 30 days
  const [chartRangeDays, setChartRangeDays] = useState<number>(30);

  // Compute 30-day daily trends from confirmed order history
  const dailyTrends = useMemo(() => {
    const list = [];
    const now = new Date('2026-11-05T23:59:59Z');

    for (let i = chartRangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const ymd = `${year}-${month}-${day}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

      const dayOrders = orders.filter((o) => {
        if (o.status !== 'Confirmed') return false;
        const oDate = new Date(o.date);
        const oYmd = `${oDate.getUTCFullYear()}-${String(oDate.getUTCMonth() + 1).padStart(2, '0')}-${String(oDate.getUTCDate()).padStart(2, '0')}`;
        return oYmd === ymd;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const dayProfit = dayOrders.reduce((sum, o) => {
        const prod = products.find((p) => p.id === o.productId || p.sku === o.sku);
        const costPerUnit = prod ? prod.costPrice : o.unitPrice * 0.35;
        const variableCost = o.quantity * (costPerUnit + 4.50 + 1.50);
        const fee = (o.totalAmount * 0.029) + 0.30;
        return sum + (o.totalAmount - (variableCost + fee));
      }, 0);

      list.push({
        dateStr: ymd,
        date: label,
        revenue: Math.round(dayRevenue * 100) / 100,
        profit: Math.round(dayProfit * 100) / 100,
        ordersCount: dayOrders.length,
      });
    }

    return list;
  }, [orders, products, chartRangeDays]);

  const rangeTotalRevenue = dailyTrends.reduce((sum, d) => sum + d.revenue, 0);
  const rangeTotalProfit = dailyTrends.reduce((sum, d) => sum + d.profit, 0);
  const rangeAvgDailyRevenue = rangeTotalRevenue / chartRangeDays;
  const peakDay = dailyTrends.reduce(
    (max, d) => (d.revenue > max.revenue ? d : max),
    dailyTrends[0] || { date: 'N/A', revenue: 0, profit: 0 }
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Status */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">SELL SMART AI</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time monitoring of your DTC sales velocity, net profit margins, inventory depletion alerts, and marketing copy generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('calculator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 transition shadow-sm"
            >
              <Calculator className="h-4 w-4 text-emerald-400" />
              <span>Profit Engine</span>
            </button>
            <button
              onClick={() => onNavigateTab('content')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if Low/Out of Stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-amber-300">
                Inventory Restock Notice: {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} at or below threshold
                {outOfStockCount > 0 && ` (${outOfStockCount} completely out of stock)`}
              </p>
              <p className="text-xs text-amber-400/80">
                Prevent missed sales by replenishing stock or adjusting safety levels in the inventory manager.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium self-start sm:self-auto transition"
          >
            <span>Review Items</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metric Cards - All 7 Required Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        
        {/* Metric 1: Total Orders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Total Orders</span>
            <ShoppingCart className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-white">{orders.length}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold">{confirmedOrders.length} fulfilled</span>
          </div>
        </div>

        {/* Metric 2: Pending Orders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Pending Orders</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-2">
            <h3 className={`text-xl font-black ${pendingOrders.length > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {pendingOrders.length}
            </h3>
            <span className="text-[10px] text-slate-400">awaiting action</span>
          </div>
        </div>

        {/* Metric 3: Total Estimated Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Total Revenue</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-white truncate">{formatCurrency(grossRevenue, currency)}</h3>
            <span className="text-[10px] text-slate-400">gross sales</span>
          </div>
        </div>

        {/* Metric 4: Estimated Profit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Estimated Profit</span>
            <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-emerald-400 truncate">{formatCurrency(totalOrderProfit, currency)}</h3>
            <span className="text-[10px] text-slate-400">net profit</span>
          </div>
        </div>

        {/* Metric 5: Average Profit Margin */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Avg Profit Margin</span>
            <Activity className="h-3.5 w-3.5 text-teal-300" />
          </div>
          <div className="mt-2">
            <h3 className={`text-xl font-black ${overallMargin >= 20 ? 'text-emerald-400' : overallMargin > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {overallMargin.toFixed(1)}%
            </h3>
            <span className="text-[10px] text-slate-400">after COGS & fees</span>
          </div>
        </div>

        {/* Metric 6: Products in Inventory */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Products in Inventory</span>
            <Package className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-white">{products.length}</h3>
            <span className="text-[10px] text-slate-400">{totalStockCount} units total</span>
          </div>
        </div>

        {/* Metric 7: Low-Stock Products */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Low-Stock Products</span>
            <AlertTriangle className={`h-3.5 w-3.5 ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2">
            <h3 className={`text-xl font-black ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockProducts.length}
            </h3>
            <span className="text-[10px] text-slate-400">{outOfStockCount > 0 ? `${outOfStockCount} out of stock` : 'reorder alert'}</span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Links to All Four Main Working Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('calculator')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-left transition group shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Calculator className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">1. Profit Calculator</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculate itemized costs, margins & break-even</p>
        </button>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-left transition group shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Package className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">2. Orders & Inventory</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Manage stock, negative prevention & fulfillments</p>
        </button>

        <button
          onClick={() => onNavigateTab('content')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 text-left transition group shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Sparkles className="h-4 w-4 text-teal-400 group-hover:scale-110 transition-transform" />
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-400 transition" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition">3. Content Studio</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">SEO listings, captions, keywords & 3 templates</p>
        </button>

        <button
          onClick={() => onNavigateTab('settings')}
          className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 text-left transition group shadow-sm"
        >
          <div className="flex items-center justify-between mb-1.5">
            <Activity className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400 transition" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition">4. Settings & Deploy</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Currency, spelling localization & free hosting</p>
        </button>
      </div>

      {/* 30-Day Revenue & Net Profit Trend Line Chart (Recharts) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Daily Revenue & Net Profit Trends</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Recharts Analytics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily sales performance and estimated net profit margin trends over the last {chartRangeDays} days based on confirmed order history.
              </p>
            </div>
          </div>

          {/* Time range selector tabs */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Window:
            </span>
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs">
              {[
                { days: 7, label: '7D' },
                { days: 14, label: '14D' },
                { days: 30, label: 'Last 30 Days' },
              ].map((btn) => (
                <button
                  key={btn.days}
                  onClick={() => setChartRangeDays(btn.days)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    chartRangeDays === btn.days
                      ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block font-medium">{chartRangeDays}-Day Revenue</span>
            <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
              {formatCurrency(rangeTotalRevenue, currency)}
            </span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block font-medium">{chartRangeDays}-Day Net Profit</span>
            <span className="text-base font-extrabold text-cyan-400 mt-0.5 block">
              {formatCurrency(rangeTotalProfit, currency)}
            </span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block font-medium">Avg Daily Velocity</span>
            <span className="text-base font-extrabold text-white mt-0.5 block">
              {formatCurrency(rangeAvgDailyRevenue, currency)}/day
            </span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <span className="text-[11px] text-slate-400 block font-medium">Top Single Day</span>
            <span className="text-base font-extrabold text-indigo-300 mt-0.5 block truncate">
              {formatCurrency(peakDay.revenue, currency)} <span className="text-xs font-normal text-slate-400">({peakDay.date})</span>
            </span>
          </div>
        </div>

        {/* Recharts Chart Container */}
        <div className="h-72 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyTrends} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />

              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const rev = data.revenue;
                    const prof = data.profit;
                    const margin = rev > 0 ? (prof / rev) * 100 : 0;
                    return (
                      <div className="bg-slate-900/95 border border-slate-700/90 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
                        <div className="font-bold text-white border-b border-slate-800 pb-1.5 flex items-center justify-between">
                          <span>{data.date}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {data.ordersCount} confirmed order{data.ordersCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 font-semibold">
                          <span>Daily Revenue:</span>
                          <span>{formatCurrency(rev, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-cyan-400 font-semibold">
                          <span>Net Profit:</span>
                          <span>{formatCurrency(prof, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300 text-[11px] pt-1 border-t border-slate-800/80">
                          <span>Daily Margin:</span>
                          <span className="font-bold text-slate-100">{margin.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend 
                verticalAlign="top" 
                align="right" 
                height={30}
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />

              <Area 
                type="monotone" 
                dataKey="revenue" 
                fill="url(#revenueGradient)" 
                stroke="none"
              />

              <Area 
                type="monotone" 
                dataKey="profit" 
                fill="url(#profitGradient)" 
                stroke="none"
              />

              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Daily Revenue" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                dot={{ r: 2.5, fill: '#10b981', strokeWidth: 1.5, stroke: '#064e3b' }} 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }} 
              />

              <Line 
                type="monotone" 
                dataKey="profit" 
                name="Net Profit" 
                stroke="#06b6d4" 
                strokeWidth={2.5} 
                dot={{ r: 2.5, fill: '#06b6d4', strokeWidth: 1.5, stroke: '#083344' }} 
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row: Quick Profit Simulator Sandbox & Low Stock Replenishment Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Simulator Sandbox (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quick Profit Simulator</h3>
                  <p className="text-xs text-slate-400">Instant sensitivity test: simulate price changes and order volume</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('calculator')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Full Calculator
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Simulator Interactive Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Selling Price per Unit:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(simPrice, currency)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="0.5"
                  value={simPrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Product Cost (COGS) per Unit:</span>
                  <span className="text-slate-200 font-bold">{formatCurrency(simCost, currency)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="0.5"
                  value={simCost}
                  onChange={(e) => setSimCost(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">Target Order Volume:</span>
                  <span className="text-slate-200 font-bold">{simUnits} orders</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={simUnits}
                  onChange={(e) => setSimUnits(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulator Live Results */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block font-medium">Projected Revenue</span>
              <span className="text-base font-extrabold text-white mt-1 block">
                {formatCurrency(simResult.revenue, currency)}
              </span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block font-medium">Estimated Net Profit</span>
              <span className={`text-base font-extrabold mt-1 block ${simResult.estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(simResult.estimatedProfit, currency)}
              </span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block font-medium">Net Margin</span>
              <span className={`text-base font-extrabold mt-1 block ${simResult.profitMargin >= 20 ? 'text-emerald-400' : simResult.profitMargin > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {simResult.profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Replenishment Action Center (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Stock Health Radar</h3>
                  <p className="text-xs text-slate-400">Immediate re-order alerts</p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {products.length} Products
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto opacity-80" />
                <p className="text-sm font-semibold text-slate-200">All Stock Levels Healthy</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Every product currently exceeds its safety replenishment threshold.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mt-3 max-h-[220px] overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">{p.sku}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          p.stock === 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} Left`}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate mt-0.5">{p.name}</p>
                      <p className="text-[11px] text-slate-400">Threshold: {p.lowStockThreshold} units</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onRestockProduct(p.id, 10)}
                        className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                        title="Add 10 to inventory"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => onRestockProduct(p.id, 25)}
                        className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                        title="Add 25 to inventory"
                      >
                        +25
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Manage all catalog items:</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Open Inventory Table
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Orders Feed & Quick Copy Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Feed (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Recent Orders Stream</h3>
                <p className="text-xs text-slate-400">Live order activity and automated stock syncing</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1"
            >
              View All Orders ({orders.length})
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Qty</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-mono font-bold text-emerald-400">
                      {o.orderNumber}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-200 block">{o.customerName}</span>
                      <span className="text-[10px] text-slate-400">{o.channel}</span>
                    </td>
                    <td className="py-3 max-w-[180px] truncate text-slate-300 font-medium">
                      {o.productName}
                    </td>
                    <td className="py-3 text-slate-200 font-semibold">{o.quantity}</td>
                    <td className="py-3 font-bold text-white">
                      {formatCurrency(o.totalAmount, currency)}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'Confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : o.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {o.status === 'Confirmed' && <CheckCircle2 className="h-3 w-3" />}
                        {o.status === 'Pending' && <Clock className="h-3 w-3" />}
                        {o.status === 'Cancelled' && <XCircle className="h-3 w-3" />}
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {o.status === 'Pending' ? (
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'Confirmed')}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-md transition"
                        >
                          Confirm & Deduct
                        </button>
                      ) : o.status === 'Confirmed' ? (
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'Cancelled')}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 rounded-md transition"
                        >
                          Cancel & Restore
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Content Studio Banner Card (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Content Studio</h3>
                <span className="text-[11px] text-indigo-300 font-medium">High-converting ecommerce copy</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Generate persuasive product descriptions and scroll-stopping Instagram captions in 4 brand tones: 
              <span className="text-emerald-400 font-semibold"> Friendly</span>, 
              <span className="text-indigo-400 font-semibold"> Professional</span>, 
              <span className="text-amber-400 font-semibold"> Playful</span>, and 
              <span className="text-purple-400 font-semibold"> Luxury</span>.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Select from catalog:</span>
                <span className="text-slate-300 font-semibold">{products[0]?.sku || 'MUG-BLK-01'}</span>
              </div>
              <p className="text-slate-200 font-medium text-xs truncate">
                {products[0]?.name || 'Ceramic Matte Travel Mug'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => {
                if (products[0]) {
                  onLoadProductToCalculator(products[0]);
                }
                onNavigateTab('content');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Open Studio & Draft Copy</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
