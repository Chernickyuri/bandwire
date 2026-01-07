import React, { useState } from 'react';
import { formatCurrency } from '../utils/helpers';

export default function PaymentForm({ amount, onPaymentComplete, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useStripeLink, setUseStripeLink] = useState(false);

  const handleStripeLink = () => {
    setUseStripeLink(true);
    setIsProcessing(true);
    
    // Simulate Stripe Link one-click payment
    setTimeout(() => {
      const transactionId = `pi_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      onPaymentComplete({
        transactionId,
        method: 'Stripe Link',
        amount,
        type: 'Down Payment',
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleCardPayment = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      alert('Please fill in all card details');
      return;
    }

    setIsProcessing(true);
    
    // Simulate Stripe payment processing
    setTimeout(() => {
      const transactionId = `pi_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      onPaymentComplete({
        transactionId,
        method: 'Credit Card',
        amount,
        type: 'Down Payment',
        cardLast4: cardNumber.slice(-4),
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
          <p className="text-sm text-gray-600 mt-1">Secure payment powered by Stripe</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Powered by</span>
          <div className="flex items-center gap-1">
            <svg className="w-16 h-6" viewBox="0 0 468 222" fill="none">
              <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.7 39.5 45.7 6.3 0 11.9-.8 16.3-2.1v-20.7h-15.7v14.4c0 8.3-4.3 13.6-11.2 13.6-8.4 0-12.5-6.2-12.5-13.8 0-21.1 11.1-33.2 23.9-33.2 6.3 0 10.6 2.4 13.6 6.9l11.1-7.5c-4.6-7.2-12.9-12-24.7-12-21.5 0-39.5 16.8-39.5 45.7 0 28.9 18 45.7 39.5 45.7 11.8 0 20.1-4.8 24.7-12l-11.1-7.5c-3 4.5-7.3 6.9-13.6 6.9-12.8 0-23.9-12.1-23.9-33.2 0-7.6 4.1-13.8 12.5-13.8 6.9 0 11.2 5.3 11.2 13.6v13.8h15.7v20.7c-4.4 1.3-10 2.1-16.3 2.1-22.5 0-39.5-15.6-39.5-45.7 0-25.4 14.4-45.6 38.2-45.6 23.7 0 36.1 20.2 36.1 45.8z" fill="#635BFF"/>
              <path d="M301.1 67.4c-6 0-10.8 2.1-14.3 6.7l-1.4-5.2h-18.1v93.1h21.6V89.8c0-7.1 4.3-10.8 9.8-10.8 6.3 0 9.1 4.5 9.1 10.8v71.4h21.6V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
              <path d="M223.3 61.6l-25.4 7.1c-2.1-7.1-7.9-11.2-15.5-11.2-12.5 0-22.1 10.1-22.1 25.7 0 15.6 9.6 25.7 22.1 25.7 7.6 0 13.4-4.1 15.5-11.2l25.4 7.1c-4.1 13.7-15.8 23.3-41 23.3-26.2 0-45.1-18.2-45.1-44.9 0-26.7 18.9-44.9 45.1-44.9 25.2 0 36.9 9.6 41 23.3z" fill="#635BFF"/>
              <path d="M183.5 73.1c-3.8 0-6.8 2.9-6.8 7.1 0 4.2 3 7.1 6.8 7.1 3.8 0 6.8-2.9 6.8-7.1 0-4.2-3-7.1-6.8-7.1z" fill="#635BFF"/>
              <path d="M146.9 61.6l-1.4 5.2c-3.5-4.6-8.3-6.7-14.3-6.7-11.1 0-19.3 7.6-19.3 22.4v71.4h21.6V89.8c0-6.3 2.8-10.8 9.1-10.8 5.5 0 9.8 3.7 9.8 10.8v71.4h21.6V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
              <path d="M79.3 61.6l-1.4 5.2c-3.5-4.6-8.3-6.7-14.3-6.7-11.1 0-19.3 7.6-19.3 22.4v71.4h21.6V89.8c0-6.3 2.8-10.8 9.1-10.8 5.5 0 9.8 3.7 9.8 10.8v71.4H66.1V89.8c0-14.8-8.2-22.4-19.3-22.4z" fill="#635BFF"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Amount Due</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</span>
        </div>
      </div>

      {/* Stripe Link Option */}
      <div className="mb-6">
        <button
          onClick={handleStripeLink}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing && useStripeLink ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing with Stripe Link...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay with Stripe Link (One-Click)
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Fast, secure payment using your saved payment methods
        </p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or pay with card</span>
        </div>
      </div>

      {/* Card Payment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            maxLength="16"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                setExpiry(value);
              }}
              placeholder="MM/YY"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              maxLength="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              maxLength="4"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <button
          onClick={handleCardPayment}
          disabled={isProcessing || !cardNumber || !expiry || !cvv || !name}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing && !useStripeLink ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay {formatCurrency(amount)}
            </>
          )}
        </button>
      </div>

      {/* Security Badge */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Secured by Stripe • PCI DSS Level 1 Compliant</span>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

