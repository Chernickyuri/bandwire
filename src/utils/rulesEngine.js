export const validatePaymentPlan = (downPayment, installments, totalCost, rules) => {
  const errors = [];

  if (downPayment < rules.minDownPayment) {
    errors.push({
      field: 'downPayment',
      message: `Minimum down payment is ${formatCurrency(rules.minDownPayment)}`,
    });
  }

  if (downPayment === 0 && !rules.allowZeroDownPayment) {
    errors.push({
      field: 'downPayment',
      message: 'Down payment cannot be $0',
    });
  }

  if (installments > rules.maxInstallmentMonths) {
    errors.push({
      field: 'installments',
      message: `Maximum installment duration is ${rules.maxInstallmentMonths} months`,
    });
  }

  if (downPayment > totalCost) {
    errors.push({
      field: 'downPayment',
      message: 'Down payment cannot exceed total cost',
    });
  }

  if (installments < 1) {
    errors.push({
      field: 'installments',
      message: 'Installments must be at least 1 month',
    });
  }

  return errors;
};

export const autoFixPaymentPlan = (downPayment, installments, totalCost, rules) => {
  let fixedDownPayment = downPayment;
  let fixedInstallments = installments;

  // Fix down payment
  if (fixedDownPayment < rules.minDownPayment) {
    fixedDownPayment = rules.minDownPayment;
  }
  if (fixedDownPayment === 0 && !rules.allowZeroDownPayment) {
    fixedDownPayment = rules.minDownPayment;
  }
  if (fixedDownPayment > totalCost) {
    fixedDownPayment = totalCost;
  }

  // Fix installments
  if (fixedInstallments > rules.maxInstallmentMonths) {
    fixedInstallments = rules.maxInstallmentMonths;
  }
  if (fixedInstallments < 1) {
    fixedInstallments = 1;
  }

  return {
    downPayment: fixedDownPayment,
    installments: fixedInstallments,
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

