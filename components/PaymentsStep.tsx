import React, { useState } from 'react';
import { Student, Payment } from '../types';
import Card from './Card';
import PlusIcon from './icons/PlusIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';

interface PaymentFormProps {
    studentId: string;
    onAddPayment: (studentId: string, payment: Omit<Payment, 'id' | 'receiptNo' | 'invoiceNo' | 'date'>) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ studentId, onAddPayment }) => {
    const [totalBill, setTotalBill] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('');
    const [processedBy, setProcessedBy] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!totalBill || !amountPaid || !paymentMethod || !processedBy) {
            alert('Please fill all fields');
            return;
        }
        onAddPayment(studentId, {
            totalBill: parseFloat(totalBill),
            amountPaid: parseFloat(amountPaid),
            paymentMethod,
            processedBy
        });
        setTotalBill('');
        setAmountPaid('');
        setPaymentMethod('');
        setProcessedBy('');
        setShowForm(false);
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="bg-sky-600 text-white px-3 py-1.5 rounded-md hover:bg-sky-700 text-sm flex items-center"
            >
                <PlusIcon className="w-4 h-4 mr-1" /> Add Payment
            </button>
        );
    }
    
    const inputClass = "w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm";

    return (
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 rounded-lg border space-y-3">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Total Bill (₦)</label>
                    <input type="number" value={totalBill} onChange={e => setTotalBill(e.target.value)} placeholder="e.g., 290995" className={inputClass} required />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Amount Paid (₦)</label>
                    <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="e.g., 100000" className={inputClass} required />
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Payment Method</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as Payment['paymentMethod'])} className={inputClass} required>
                        <option value="">Select</option>
                        <option value="CASH">CASH</option>
                        <option value="TRANSFER">TRANSFER</option>
                        <option value="CARD">CARD</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Processed By</label>
                    <input type="text" value={processedBy} onChange={e => setProcessedBy(e.target.value)} placeholder="Staff Name" className={inputClass} required />
                </div>
             </div>
             <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-300 text-sm">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm">Save Payment</button>
             </div>
        </form>
    );
};

interface PaymentsStepProps {
    students: Student[];
    classInfo: { level: string; arm: string; session: string; term: string; };
    onAddPayment: (studentId: string, payment: Omit<Payment, 'id' | 'receiptNo' | 'invoiceNo' | 'date'>) => void;
    onPrintReceipt: (studentId: string, paymentId: string) => void;
    isGeneratingReceipt: boolean;
}

const PaymentsStep: React.FC<PaymentsStepProps> = ({ students, classInfo, onAddPayment, onPrintReceipt, isGeneratingReceipt }) => {
    return (
        <Card title={`Manage Payments for ${classInfo.level} ${classInfo.arm}`}>
            <div className="space-y-6">
                {students.map(student => (
                    <div key={student.id} className="border border-slate-200 rounded-lg p-4">
                        <h3 className="font-bold text-lg text-slate-800 mb-3">{student.name}</h3>
                        {student.payments && student.payments.length > 0 ? (
                            <div className="mb-4 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            {['Date', 'Receipt No.', 'Amount Paid', 'Balance', 'Method', 'Actions'].map(h => 
                                                <th key={h} className="p-2 font-semibold">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.payments.map(payment => {
                                            const balance = payment.totalBill - payment.amountPaid;
                                            return (
                                                <tr key={payment.id} className="border-b border-slate-200">
                                                    <td className="p-2">{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="p-2 font-mono text-xs">{payment.receiptNo}</td>
                                                    <td className="p-2">₦{payment.amountPaid.toLocaleString()}</td>
                                                    <td className="p-2">₦{balance.toLocaleString()}</td>
                                                    <td className="p-2">{payment.paymentMethod}</td>
                                                    <td className="p-2">
                                                        <button 
                                                            onClick={() => onPrintReceipt(student.id, payment.id)}
                                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-xs flex items-center justify-center disabled:bg-slate-400"
                                                            disabled={isGeneratingReceipt}
                                                        >
                                                            {isGeneratingReceipt ? <SpinnerIcon className="mr-1" /> : <DownloadIcon className="w-4 h-4 mr-1" />}
                                                            Print
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm mb-4">No payments recorded for this student.</p>
                        )}
                        <PaymentForm studentId={student.id} onAddPayment={onAddPayment} />
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default PaymentsStep;
