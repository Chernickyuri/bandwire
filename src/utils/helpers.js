export const calculateMonthlyPayment = (totalCost, downPayment, installments) => {
  if (installments <= 0) return 0;
  const remaining = totalCost - downPayment;
  return remaining / installments;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generateTransactionId = () => {
  const random = Math.floor(Math.random() * 100000);
  return `STRIPE_TXN_${random.toString().padStart(5, '0')}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

