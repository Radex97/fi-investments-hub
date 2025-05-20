
/**
 * Calculate fees for an investment based on amount, interest rate and last interest date
 * 
 * @param amount - The investment amount
 * @param interestRate - The interest rate as a decimal (e.g., 0.05 for 5%)
 * @param lastInterestDate - The date when interest was last calculated
 * @returns Object containing calculated fees and total amount
 */
export const calculateFees = (
  amount: number, 
  interestRate: number, 
  lastInterestDate: Date
): { fees: number; total: number } => {
  const daysBetween = (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffMs / oneDay);
  };

  const days = daysBetween(lastInterestDate, new Date());
  const fees = amount * (interestRate / 365) * days;
  const total = amount + fees;
  
  return { fees, total };
};
