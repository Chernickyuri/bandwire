import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateTransactionId, formatCurrency } from '../utils/helpers';

export default function PatientPayment() {
  const { state, completePayment, savePaymentMethod, removePaymentMethod } = useApp();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(state.payment.completed);

  // Get saved payment methods for current payment method type
  const savedMethods = state.savedPaymentMethods?.filter(m => m.type === paymentMethod) || [];

  const handlePayment = () => {
    // If using saved method, validate it's selected
    if (!useNewCard && !selectedSavedMethod) {
      if (savedMethods.length > 0) {
        alert('Please select a saved payment method or add a new one');
        return;
      }
    }

    // If using new card, validate fields
    if (useNewCard || savedMethods.length === 0) {
      if (paymentMethod === 'credit') {
        if (!cardNumber || !expiry || !cvv) {
          alert('Please fill in all card details');
          return;
        }
      } else {
        if (!routingNumber || !accountNumber) {
          alert('Please fill in all bank account details');
          return;
        }
      }
    }

    setProcessing(true);
    setTimeout(() => {
      const transactionId = generateTransactionId();
      
      // Save payment method if checkbox is checked and using new card
      if (saveCard && (useNewCard || savedMethods.length === 0)) {
        if (paymentMethod === 'credit') {
          savePaymentMethod({
            type: 'credit',
            cardLast4: cardNumber.slice(-4),
            expiry: expiry,
            brand: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Card',
          });
        } else {
          savePaymentMethod({
            type: 'ach',
            bankAccount: `****${accountNumber.slice(-4)}`,
            routingNumber: routingNumber,
          });
        }
      }

      completePayment(
        transactionId,
        paymentMethod === 'credit' ? 'Credit Card' : 'ACH',
        state.consultation.downPayment,
        'Down Payment'
      );
      setPaid(true);
      setProcessing(false);
    }, 2000);
  };

  const handleRemoveMethod = (methodId) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      removePaymentMethod(methodId);
      if (selectedSavedMethod === methodId) {
        setSelectedSavedMethod(null);
        setUseNewCard(true);
      }
    }
  };

  if (paid) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful</h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-700 mb-2">
                <strong>Status:</strong> Down payment of {formatCurrency(state.consultation.downPayment)} received.
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Transaction ID:</strong> {state.payment.transactionId}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Payment Method:</strong> {state.payment.method}
              </p>
              <p className="text-gray-600">
                <strong>Processed in:</strong> ~{state.payment.elapsedTime} minutes
              </p>
            </div>
            <button
              onClick={() => navigate('/patient')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Complete your down payment: <strong>{formatCurrency(state.consultation.downPayment)}</strong>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method Type
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setSelectedSavedMethod(null);
              setUseNewCard(false);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="credit">Credit Card</option>
            <option value="ach">Bank Transfer (ACH)</option>
          </select>
        </div>

        {/* Saved Payment Methods */}
        {savedMethods.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Saved {paymentMethod === 'credit' ? 'Cards' : 'Bank Accounts'}
              </label>
              <button
                onClick={() => {
                  setUseNewCard(true);
                  setSelectedSavedMethod(null);
                }}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add New
              </button>
            </div>
            <div className="space-y-2">
              {savedMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSavedMethod === method.id && !useNewCard
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedSavedMethod(method.id);
                    setUseNewCard(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedSavedMethod === method.id && !useNewCard}
                        onChange={() => {
                          setSelectedSavedMethod(method.id);
                          setUseNewCard(false);
                        }}
                        className="mr-3"
                      />
                      <div>
                        {method.type === 'credit' ? (
                          <>
                            <div className="flex items-center">
                              <span className="text-lg mr-2">💳</span>
                              <span className="font-semibold text-gray-900">
                                {method.brand || 'Card'} •••• {method.cardLast4}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <span className="text-lg mr-2">🏦</span>
                              <span className="font-semibold text-gray-900">
                                Bank Account {method.bankAccount}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Routing: •••{method.routingNumber?.slice(-4)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMethod(method.id);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Payment Method Form */}
        {(useNewCard || savedMethods.length === 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {savedMethods.length > 0 ? 'New Payment Method' : 'Payment Details'}
              </h3>
              {savedMethods.length > 0 && (
                <button
                  onClick={() => {
                    setUseNewCard(false);
                    if (savedMethods.length > 0) {
                      setSelectedSavedMethod(savedMethods[0].id);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Use Saved
                </button>
              )}
            </div>

        {paymentMethod === 'credit' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Routing Number
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="987654321"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        )}
          </div>
        )}

        {/* Save Card Checkbox */}
        {(useNewCard || savedMethods.length === 0) && (
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="mr-2 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">
                Save this {paymentMethod === 'credit' ? 'card' : 'bank account'} for future payments
              </span>
            </label>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors shadow-sm ${
              processing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {processing ? 'Processing Payment...' : `Pay ${formatCurrency(state.consultation.downPayment)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

