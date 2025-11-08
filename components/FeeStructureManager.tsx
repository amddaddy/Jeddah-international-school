
import React, { useState } from 'react';
import { FeeItem } from '../types';
import Card from './Card';
import XIcon from './icons/XIcon';
import PlusIcon from './icons/PlusIcon';
import ConfirmationDialog from './ConfirmationDialog';

interface FeeStructureManagerProps {
  feeItems: FeeItem[];
  setFeeItems: React.Dispatch<React.SetStateAction<FeeItem[]>>;
}

const FeeStructureManager: React.FC<FeeStructureManagerProps> = ({ feeItems, setFeeItems }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'required' | 'optional'>('required');
  const [itemToRemove, setItemToRemove] = useState<FeeItem | null>(null);

  const handleAddFeeItem = () => {
    if (name.trim() && amount.trim()) {
      const newFee: FeeItem = {
        id: Date.now().toString(),
        name: name.trim(),
        amount: parseFloat(amount),
        type,
      };
      setFeeItems([...feeItems, newFee]);
      setName('');
      setAmount('');
    }
  };

  const handleRequestRemove = (item: FeeItem) => {
    setItemToRemove(item);
  };
  
  const handleConfirmRemove = () => {
    if (itemToRemove) {
      setFeeItems(feeItems.filter(item => item.id !== itemToRemove.id));
      setItemToRemove(null);
    }
  };
  
  const inputClass = "px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";

  return (
    <Card title="Manage Fee Structure">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-700 mb-2">Current Fees</h3>
        {feeItems.length > 0 ? (
          <ul className="space-y-2">
            {feeItems.map(item => (
              <li key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                <div>
                  <span className="font-medium">{item.name}</span> - <span className="text-slate-600">₦{item.amount.toLocaleString()}</span>
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'required' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.type}
                  </span>
                </div>
                <button onClick={() => handleRequestRemove(item)} className="text-red-500 hover:text-red-700">
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">No fees defined yet.</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-2 border-t pt-4">Add New Fee Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Fee Name (e.g., Library Fee)"
            className={`${inputClass} md:col-span-2`}
          />
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            className={inputClass}
          />
          <select value={type} onChange={e => setType(e.target.value as 'required' | 'optional')} className={inputClass}>
            <option value="required">Required</option>
            <option value="optional">Optional</option>
          </select>
        </div>
        <button
          onClick={handleAddFeeItem}
          className="mt-3 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Add Fee
        </button>
      </div>
      <ConfirmationDialog
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Confirm Fee Item Deletion"
        message={`Are you sure you want to delete the fee item "${itemToRemove?.name}"?`}
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </Card>
  );
};

export default FeeStructureManager;
