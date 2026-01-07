import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/helpers';

export default function TreatmentBreakdown({ breakdown = [], onBreakdownChange, readOnly = false }) {
  const [items, setItems] = useState(breakdown);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setItems(breakdown);
  }, [breakdown]);

  const handleItemChange = (id, field, value) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    });
    setItems(updatedItems);
    if (onBreakdownChange) {
      onBreakdownChange(updatedItems);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      type: 'service',
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    if (onBreakdownChange) {
      onBreakdownChange(updatedItems);
    }
  };

  const handleRemoveItem = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    if (onBreakdownChange) {
      onBreakdownChange(updatedItems);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const services = items.filter(item => item.type === 'service');
  const materials = items.filter(item => item.type === 'material');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Treatment Breakdown</h3>
        {!readOnly && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isEditing ? 'Done Editing' : 'Edit Breakdown'}
          </button>
        )}
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Services
          </h4>
          <div className="space-y-2">
            {services.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Service name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      placeholder="Unit Price"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="w-24 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.total || 0)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-sm text-gray-600">@ {formatCurrency(item.unitPrice)}</span>
                    <span className="w-24 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.total || 0)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials Section */}
      {materials.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Materials
          </h4>
          <div className="space-y-2">
            {materials.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Material name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                      placeholder="Unit Price"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="w-24 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.total || 0)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-sm text-gray-600">@ {formatCurrency(item.unitPrice)}</span>
                    <span className="w-24 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(item.total || 0)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && !readOnly && (
        <div className="mt-4">
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Total Treatment Cost:</span>
          <span className="text-2xl font-bold text-teal-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

