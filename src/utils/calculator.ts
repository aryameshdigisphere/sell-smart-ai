import { CalculatorInput, CalculatorOutput } from '../types';

/**
 * Calculates ecommerce sales, costs, payment fees, net profit, margins, and break-even price.
 * 
 * Rules:
 * - Apply fixed fees once per order, not once per unit.
 * - Variable costs apply per unit sold.
 * - Percentage payment fee applies to gross revenue.
 * - Break-even price is the exact unit selling price where net profit equals zero.
 */
export function calculateProfit(input: CalculatorInput): CalculatorOutput {
  const sellingPrice = Math.max(0, Number(input.sellingPrice) || 0);
  const productCost = Math.max(0, Number(input.productCost) || 0);
  const packaging = Math.max(0, Number(input.packaging) || 0);
  const sellerPaidShipping = Math.max(0, Number(input.sellerPaidShipping) || 0);
  const otherVariableCosts = Math.max(0, Number(input.otherVariableCosts) || 0);
  const percentagePaymentFee = Math.max(0, Number(input.percentagePaymentFee) || 0);
  const fixedFeePerOrder = Math.max(0, Number(input.fixedFeePerOrder) || 0);
  const unitsPerOrder = Math.max(0.01, Number(input.unitsPerOrder) || 1);
  const numberOfOrders = Math.max(0, Number(input.numberOfOrders) || 0);

  // 1. Total units sold
  const totalUnitsSold = numberOfOrders * unitsPerOrder;

  // 2. Gross revenue
  const revenue = totalUnitsSold * sellingPrice;

  // 3. Variable costs per unit and total
  const unitVariableCosts = productCost + packaging + sellerPaidShipping + otherVariableCosts;
  const totalVariableCosts = totalUnitsSold * unitVariableCosts;

  // 4. Payment processing fees
  // Percentage fee applies to gross revenue
  const percentageFeeAmount = revenue * (percentagePaymentFee / 100);
  // Fixed fee applies ONCE PER ORDER, not once per unit
  const fixedFeeAmount = numberOfOrders * fixedFeePerOrder;
  const totalPaymentFees = percentageFeeAmount + fixedFeeAmount;

  // 5. Total costs
  const totalCosts = totalVariableCosts + totalPaymentFees;

  // 6. Estimated net profit
  const estimatedProfit = revenue - totalCosts;

  // 7. Profit margin (%) = (Profit / Revenue) * 100
  const profitMargin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;

  // 8. Unit profit
  const unitProfit = totalUnitsSold > 0 ? estimatedProfit / totalUnitsSold : 0;

  // 9. Break-even selling price per unit
  // Revenue = Total Costs
  // P * Units = (UnitVarCost * Units) + (P * Units * pctFee) + (Orders * fixedFee)
  // Divide by Units:
  // P = UnitVarCost + (P * pctFee) + (fixedFee / unitsPerOrder)
  // P * (1 - pctFee) = UnitVarCost + (fixedFee / unitsPerOrder)
  // P = [UnitVarCost + (fixedFee / unitsPerOrder)] / (1 - pctFee)
  const feeRateFraction = percentagePaymentFee / 100;
  let breakEvenPrice = 0;
  if (feeRateFraction < 1) {
    const effectiveFixedFeePerUnit = fixedFeePerOrder / unitsPerOrder;
    breakEvenPrice = (unitVariableCosts + effectiveFixedFeePerUnit) / (1 - feeRateFraction);
  } else {
    breakEvenPrice = 0;
  }

  // 10. Return on Investment (ROI)
  const roi = totalCosts > 0 ? (estimatedProfit / totalCosts) * 100 : 0;

  // Detailed component breakdowns
  const productCosts = totalUnitsSold * productCost;
  const packagingCosts = totalUnitsSold * packaging;
  const shippingCosts = totalUnitsSold * sellerPaidShipping;
  const otherCosts = totalUnitsSold * otherVariableCosts;
  const totalExpenses = totalCosts;

  return {
    totalUnitsSold,
    revenue,
    productCosts,
    packagingCosts,
    shippingCosts,
    otherCosts,
    unitVariableCosts,
    totalVariableCosts,
    percentageFeeAmount,
    fixedFeeAmount,
    totalPaymentFees,
    totalCosts,
    totalExpenses,
    estimatedProfit,
    profitMargin,
    unitProfit,
    breakEvenPrice,
    roi,
  };
}

export const DEFAULT_CALCULATOR_INPUT: CalculatorInput = {
  productName: 'Ceramic Matte Travel Mug (16oz)',
  sellingPrice: 49.99,
  productCost: 14.50,
  packaging: 2.25,
  sellerPaidShipping: 4.80,
  otherVariableCosts: 1.50,
  percentagePaymentFee: 2.9,
  fixedFeePerOrder: 0.30,
  unitsPerOrder: 1.25,
  numberOfOrders: 250,
};

