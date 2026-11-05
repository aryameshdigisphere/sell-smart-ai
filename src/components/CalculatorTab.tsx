import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  HelpCircle, 
  RotateCcw, 
  Save, 
  Bookmark, 
  Trash2, 
  Package, 
  Truck, 
  CreditCard, 
  Layers, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  ArrowRight,
  Info
} from 'lucide-react';
import { CalculatorInput, CalculatorOutput, Currency, Product, SavedScenario } from '../types';
import { calculateProfit, DEFAULT_CALCULATOR_INPUT } from '../utils/calculator';
import { formatCurrency } from '../utils/currencies';

interface CalculatorTabProps {
  products: Product[];
  currency: Currency;
  savedScenarios: SavedScenario[];
  onSaveScenario: (name: string, input: CalculatorInput, output: CalculatorOutput) => void;
  onDeleteScenario: (id: string) => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  products,
  currency,
  savedScenarios,
  onSaveScenario,
  onDeleteScenario,
}) => {
  // Calculator state
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_CALCULATOR_INPUT);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Calculate outputs
  const output: CalculatorOutput = calculateProfit(input);

  // Field update helper
  const handleInputChange = (field: keyof CalculatorInput, value: number) => {
    setInput((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : Math.max(0, value),
    }));
  };

  // Populate from Product Catalog
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setInput((prev) => ({
        ...prev,
        productName: prod.name,
        sellingPrice: prod.sellingPrice,
        productCost: prod.costPrice,
      }));
    }
  };

  // Presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'dropship') {
      setInput({
        sellingPrice: 34.99,
        productCost: 8.50,
        packaging: 1.00,
        sellerPaidShipping: 3.50,
        otherVariableCosts: 1.20,
        percentagePaymentFee: 2.9,
        fixedFeePerOrder: 0.30,
        unitsPerOrder: 1.0,
        numberOfOrders: 200,
      });
    } else if (presetName === 'dtc') {
      setInput({
        sellingPrice: 65.00,
        productCost: 14.00,
        packaging: 2.50,
        sellerPaidShipping: 5.50,
        otherVariableCosts: 2.00,
        percentagePaymentFee: 2.9,
        fixedFeePerOrder: 0.30,
        unitsPerOrder: 1.3,
        numberOfOrders: 350,
      });
    } else if (presetName === 'wholesale') {
      setInput({
        sellingPrice: 18.00,
        productCost: 6.20,
        packaging: 0.75,
        sellerPaidShipping: 2.00,
        otherVariableCosts: 0.50,
        percentagePaymentFee: 2.4,
        fixedFeePerOrder: 0.30,
        unitsPerOrder: 12.0,
        numberOfOrders: 50,
      });
    }
  };

  // Cost breakdown percentages for visual bar
  const totalCost = output.totalCosts;
  const cogsShare = totalCost > 0 ? ((output.totalUnitsSold * input.productCost) / totalCost) * 100 : 0;
  const shipPackShare = totalCost > 0 ? ((output.totalUnitsSold * (input.packaging + input.sellerPaidShipping)) / totalCost) * 100 : 0;
  const feeShare = totalCost > 0 ? (output.totalPaymentFees / totalCost) * 100 : 0;
  const otherShare = totalCost > 0 ? ((output.totalUnitsSold * input.otherVariableCosts) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Calculator className="h-3.5 w-3.5" />
            Unit Economics & Profit Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sales & Net Profit Calculator
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Simulate realistic ecommerce margins. Fixed fees are automatically applied once per transaction, and variable costs scale with order volume.
          </p>
        </div>

        {/* Action presets & inventory loader */}
        <div className="flex flex-wrap items-center gap-2">
          {products.length > 0 && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
              <Package className="h-4 w-4 text-emerald-400 shrink-0" />
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900">Import from Inventory...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setInput(DEFAULT_CALCULATOR_INPUT)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            title="Reset to default benchmark values"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Scenario</span>
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Quick Models:</span>
        <button
          onClick={() => applyPreset('dtc')}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 font-medium transition shrink-0"
        >
          High-Margin DTC Brand ($65 / 1.3 units)
        </button>
        <button
          onClick={() => applyPreset('dropship')}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 font-medium transition shrink-0"
        >
          Fast-Ship Low Ticket ($34.99 / 1 unit)
        </button>
        <button
          onClick={() => applyPreset('wholesale')}
          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 font-medium transition shrink-0"
        >
          B2B Wholesale / Bundle ($18 / 12 units)
        </button>
      </div>

      {/* Main Grid: Inputs on Left (7 cols), Analytics & Output on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs Panel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span>Unit Pricing & Direct Costs</span>
            </h2>
            <span className="text-xs text-slate-400">All figures in {currency}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Product Name */}
            <div className="sm:col-span-2 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Product Name / Title</label>
                <span className="text-[11px] text-slate-400">Optional or import from catalog</span>
              </div>
              <input
                type="text"
                value={input.productName || ''}
                onChange={(e) => setInput((prev) => ({ ...prev, productName: e.target.value }))}
                placeholder="e.g. Personalized Pet Christmas Ornament, Ceramic Tumbler..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Selling Price */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Selling Price (per unit)</label>
                <span className="text-emerald-400 font-bold">{formatCurrency(input.sellingPrice, currency)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={input.sellingPrice || ''}
                  onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <input
                type="range"
                min="1"
                max="300"
                step="0.5"
                value={input.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Product Cost (COGS) */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Product Cost / COGS (per unit)</label>
                <span className="text-slate-300 font-bold">{formatCurrency(input.productCost, currency)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={input.productCost || ''}
                  onChange={(e) => handleInputChange('productCost', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="0.5"
                value={input.productCost}
                onChange={(e) => handleInputChange('productCost', parseFloat(e.target.value))}
                className="w-full accent-teal-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Packaging */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Packaging (per unit)</label>
                <span className="text-slate-300 font-bold">{formatCurrency(input.packaging, currency)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={input.packaging || ''}
                  onChange={(e) => handleInputChange('packaging', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-slate-400">Custom boxes, tissue, stickers & inserts</p>
            </div>

            {/* Seller-paid Shipping */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Seller-paid Shipping (per unit)</label>
                <span className="text-slate-300 font-bold">{formatCurrency(input.sellerPaidShipping, currency)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={input.sellerPaidShipping || ''}
                  onChange={(e) => handleInputChange('sellerPaidShipping', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-slate-400">Outbound courier label or free shipping subsidy</p>
            </div>

            {/* Other Variable Costs */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2 sm:col-span-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Other Variable Costs (per unit)</label>
                <span className="text-slate-300 font-bold">{formatCurrency(input.otherVariableCosts, currency)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={input.otherVariableCosts || ''}
                  onChange={(e) => handleInputChange('otherVariableCosts', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[10px] text-slate-400">Fulfillment pick-and-pack fee, returns allowance, or royalties</p>
            </div>

          </div>

          {/* Section 2: Payment Fees & Order Scale */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <span>Payment Gateway Fees & Order Volume</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Payment fee % */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-200">Gateway Percentage Fee</label>
                  <span className="text-indigo-400 font-bold">{input.percentagePaymentFee}%</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={input.percentagePaymentFee || ''}
                    onChange={(e) => handleInputChange('percentagePaymentFee', parseFloat(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Standard Stripe/Shopify is 2.9%</p>
              </div>

              {/* Fixed Fee per order */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-200">Fixed Fee per Order</label>
                  <span className="text-indigo-400 font-bold">{formatCurrency(input.fixedFeePerOrder, currency)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.05"
                    value={input.fixedFeePerOrder || ''}
                    onChange={(e) => handleInputChange('fixedFeePerOrder', parseFloat(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <CheckCircle className="h-3 w-3 shrink-0" />
                  <span>Applied once per order, never per unit</span>
                </div>
              </div>

              {/* Units per order */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-200">Units per Order (Cart Size)</label>
                  <span className="text-slate-200 font-bold">{input.unitsPerOrder}</span>
                </div>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={input.unitsPerOrder || ''}
                  onChange={(e) => handleInputChange('unitsPerOrder', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">Average items purchased in one transaction</p>
              </div>

              {/* Number of orders */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-200">Number of Orders</label>
                  <span className="text-slate-200 font-bold">{input.numberOfOrders} orders</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={input.numberOfOrders || ''}
                  onChange={(e) => handleInputChange('numberOfOrders', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400">Total transaction count to project</p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Output & Economics Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Profit Card */}
          <div className={`rounded-2xl p-6 border shadow-xl relative overflow-hidden ${
            output.estimatedProfit >= 0
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Projected Net Profit
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                output.estimatedProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {output.profitMargin.toFixed(1)}% Margin
              </span>
            </div>

            <div className="mt-3">
              <h2 className={`text-4xl font-black tracking-tight ${
                output.estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatCurrency(output.estimatedProfit, currency)}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                <span className="font-semibold">
                  {formatCurrency(output.unitProfit, currency)} profit / unit
                </span>
                <span>•</span>
                <span className="font-semibold">
                  ROI: {output.roi.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Break-Even Highlight */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-indigo-400" />
                  Break-Even Selling Price:
                </span>
                <span className="text-white font-extrabold text-sm">
                  {formatCurrency(output.breakEvenPrice, currency)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {input.sellingPrice > output.breakEvenPrice ? (
                  <span className="text-emerald-400 font-medium">
                    Safe pricing: You are {formatCurrency(input.sellingPrice - output.breakEvenPrice, currency)} above zero-profit threshold.
                  </span>
                ) : (
                  <span className="text-rose-400 font-medium">
                    Below break-even! Increase price by at least {formatCurrency(output.breakEvenPrice - input.sellingPrice, currency)} to avoid losing money.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Detailed Financial Breakdown Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Full Financial Statement</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Units Sold ({input.numberOfOrders} orders × {input.unitsPerOrder} units)</span>
                <span className="text-white font-bold">{output.totalUnitsSold.toLocaleString()} units</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Total Revenue</span>
                <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(output.revenue, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Product Costs (COGS)</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.productCosts, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Packaging Costs</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.packagingCosts, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Shipping Costs (Seller-Paid)</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.shippingCosts, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Other Variable Costs</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.otherCosts, currency)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Total Variable Costs</span>
                <span className="text-rose-400 font-bold">-{formatCurrency(output.totalVariableCosts, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Processing % Fee ({input.percentagePaymentFee}% of revenue)</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.percentageFeeAmount, currency)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-400 pl-2">
                <span>↳ Processing Fixed Fee ({formatCurrency(input.fixedFeePerOrder, currency)} × {input.numberOfOrders} orders)</span>
                <span className="text-slate-300 font-medium">-{formatCurrency(output.fixedFeeAmount, currency)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-medium">Payment Processing Fees</span>
                <span className="text-rose-400 font-bold">-{formatCurrency(output.totalPaymentFees, currency)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-700 bg-slate-800/40 px-2 rounded-lg font-bold">
                <span className="text-white">Total Expenses (Costs + Fees)</span>
                <span className="text-rose-300">-{formatCurrency(output.totalExpenses, currency)}</span>
              </div>

              <div className="flex justify-between py-2 px-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg font-black text-sm">
                <span className="text-emerald-400">Estimated Total Profit</span>
                <span className={output.estimatedProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}>
                  {formatCurrency(output.estimatedProfit, currency)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Profit per Unit</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{formatCurrency(output.unitProfit, currency)}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Profit Margin</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{output.profitMargin.toFixed(1)}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Break-Even Price</span>
                  <span className="text-xs font-bold text-teal-300 mt-0.5 block">{formatCurrency(output.breakEvenPrice, currency)}</span>
                </div>
              </div>
            </div>

            {/* Visual Stacked Cost Distribution */}
            {totalCost > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Cost Distribution Breakdown
                </span>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${cogsShare}%` }} className="bg-teal-500" title={`COGS: ${cogsShare.toFixed(1)}%`} />
                  <div style={{ width: `${shipPackShare}%` }} className="bg-indigo-500" title={`Pack & Ship: ${shipPackShare.toFixed(1)}%`} />
                  <div style={{ width: `${feeShare}%` }} className="bg-amber-500" title={`Payment Fees: ${feeShare.toFixed(1)}%`} />
                  <div style={{ width: `${otherShare}%` }} className="bg-slate-400" title={`Other: ${otherShare.toFixed(1)}%`} />
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>COGS ({cogsShare.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Shipping & Pack ({shipPackShare.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Gateways ({feeShare.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Saved Scenarios Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-amber-400" />
                <span>Saved Scenarios ({savedScenarios.length})</span>
              </h3>
            </div>

            {savedScenarios.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No saved scenarios yet. Click &quot;Save Scenario&quot; above to preserve your model.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedScenarios.map((scen) => (
                  <div
                    key={scen.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-200">{scen.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatCurrency(scen.output.estimatedProfit, currency)} profit • {scen.output.profitMargin.toFixed(1)}% margin
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInput(scen.input)}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteScenario(scen.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Delete scenario"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Save Scenario Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Save Current Calculation</h3>
            <p className="text-xs text-slate-400">
              Give this pricing scenario a memorable name to compare alternatives later.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Scenario Name</label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g. Q4 Black Friday Promo Model"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setScenarioName('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (scenarioName.trim()) {
                    onSaveScenario(scenarioName.trim(), input, output);
                    setScenarioName('');
                    setShowSaveModal(false);
                  }
                }}
                disabled={!scenarioName.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
