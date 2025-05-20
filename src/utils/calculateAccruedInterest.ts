
/**
 * Calculates the accrued interest (Stückzinsen) for an investment
 * @param amount - The investment amount
 * @param annualInterestRate - The annual interest rate (e.g., 0.05 for 5%)
 * @param lastInterestDate - The date of the last interest payment
 * @returns Object containing interest amount and total amount (principal + interest)
 */
export const calculateAccruedInterest = (
  amount: number,
  annualInterestRate: number,
  lastInterestDate: Date | string
): { interest: number; totalAmount: number } => {
  const today = new Date();
  const interestDate = typeof lastInterestDate === 'string' 
    ? new Date(lastInterestDate) 
    : lastInterestDate;
  
  // Calculate days since last interest payment
  const days = Math.ceil((today.getTime() - interestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate interest
  const interest = amount * (annualInterestRate / 365) * days;
  
  // Calculate total amount
  const totalAmount = amount + interest;
  
  return { interest, totalAmount };
};
