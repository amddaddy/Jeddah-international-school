import React from 'react';
import { Student, Invoice } from '../types';
import Card from './Card';
import PlusIcon from './icons/PlusIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import DownloadIcon from './icons/DownloadIcon';

interface InvoicingStepProps {
    students: Student[];
    classInfo: { level: string; arm: string; session: string; term: string; };
    onGenerateInvoice: (studentId: string) => void;
    onPrintInvoice: (studentId: string, invoiceId: string) => void;
    isGeneratingInvoice: boolean;
}

const InvoicingStep: React.FC<InvoicingStepProps> = ({ students, classInfo, onGenerateInvoice, onPrintInvoice, isGeneratingInvoice }) => {
    return (
        <Card title={`Manage Invoices for ${classInfo.level} ${classInfo.arm}`}>
            <div className="space-y-6">
                {students.map(student => (
                    <div key={student.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-slate-800">{student.name}</h3>
                            <button
                                onClick={() => onGenerateInvoice(student.id)}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm flex items-center"
                            >
                                <PlusIcon className="w-4 h-4 mr-1" /> Generate Invoice
                            </button>
                        </div>
                        
                        {student.invoices && student.invoices.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            {['Date', 'Invoice No.', 'Total Amount', 'Actions'].map(h => 
                                                <th key={h} className="p-2 font-semibold">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.invoices.map(invoice => (
                                            <tr key={invoice.id} className="border-b border-slate-200">
                                                <td className="p-2">{new Date(invoice.date).toLocaleDateString()}</td>
                                                <td className="p-2 font-mono text-xs">{invoice.invoiceNo}</td>
                                                <td className="p-2">₦{invoice.totalAmount.toLocaleString()}</td>
                                                <td className="p-2">
                                                    <button 
                                                        onClick={() => onPrintInvoice(student.id, invoice.id)}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-xs flex items-center justify-center disabled:bg-slate-400"
                                                        disabled={isGeneratingInvoice}
                                                    >
                                                        {isGeneratingInvoice ? <SpinnerIcon className="mr-1" /> : <DownloadIcon className="w-4 h-4 mr-1" />}
                                                        Print
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No invoices generated for this student.</p>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default InvoicingStep;
