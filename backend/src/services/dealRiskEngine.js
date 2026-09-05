/**
 * DealRiskEngine for DealFlow360
 * Calculates pricing risk, discount compliance, customer tier adjustments, and governance requirements.
 */

const calculateItemRisk = ({ basePrice, requestedPrice, standardCost, allowedLimit = 10, customerTier = 'BRONZE' }) => {
  const effectiveBase = Number(basePrice);
  const effectiveReq = Number(requestedPrice);
  const effectiveCost = Number(standardCost || effectiveBase * 0.7);

  if (effectiveReq <= 0 || effectiveBase <= 0) {
    return {
      discountPercent: 0,
      marginPercent: 0,
      riskScore: 100,
      riskLevel: 'CRITICAL',
      requiresApproval: true,
      reason: 'Invalid pricing parameters'
    };
  }

  // 1. Discount percentage from base catalog price
  const discountPercent = Math.max(0, ((effectiveBase - effectiveReq) / effectiveBase) * 100);

  // 2. Gross Margin percentage on negotiated price
  const marginPercent = ((effectiveReq - effectiveCost) / effectiveReq) * 100;

  // 3. Customer Tier risk softening (GOLD gets 5% extra discount headroom, SILVER gets 2%)
  let tierAllowance = 0;
  if (customerTier === 'GOLD') tierAllowance = 5;
  if (customerTier === 'SILVER') tierAllowance = 2;

  const effectiveAllowedLimit = allowedLimit + tierAllowance;

  // 4. Risk Score Calculation (0 to 100)
  let riskScore = 0;
  let riskLevel = 'LOW';
  let requiresApproval = false;
  let reason = 'Standard pricing within allowed parameters';

  if (discountPercent > effectiveAllowedLimit) {
    const excessDiscount = discountPercent - effectiveAllowedLimit;
    // Risk penalty scales with excess discount and margin erosion
    const marginPenalty = marginPercent < 25 ? (25 - marginPercent) * 2 : 0;
    riskScore = Math.min(100, Math.round(excessDiscount * 3.5 + marginPenalty));
    requiresApproval = true;

    if (riskScore > 65 || marginPercent < 15) {
      riskLevel = 'CRITICAL';
      reason = `Excessive discount (${discountPercent.toFixed(1)}% > ${effectiveAllowedLimit}%) and dangerously low margin (${marginPercent.toFixed(1)}%)`;
    } else if (riskScore > 35 || marginPercent < 20) {
      riskLevel = 'HIGH';
      reason = `High discount (${discountPercent.toFixed(1)}%) exceeds policy limit (${effectiveAllowedLimit}%)`;
    } else {
      riskLevel = 'MEDIUM';
      reason = `Moderate discount (${discountPercent.toFixed(1)}%) requires managerial review`;
    }
  } else if (marginPercent < 20) {
    riskScore = Math.round((20 - marginPercent) * 2);
    riskLevel = 'MEDIUM';
    requiresApproval = riskScore > 0;
    reason = `Low margin (${marginPercent.toFixed(1)}%) triggers governance threshold`;
  } else {
    // Risk = 0: Sales Rep can accept directly
    riskScore = 0;
    riskLevel = 'LOW';
    requiresApproval = false;
    reason = `Discount (${discountPercent.toFixed(1)}%) is within authorized limit (${effectiveAllowedLimit}%)`;
  }

  return {
    discountPercent: Number(discountPercent.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(2)),
    riskScore,
    riskLevel,
    requiresApproval,
    reason
  };
};

module.exports = {
  calculateItemRisk
};
