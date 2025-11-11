
import React, { forwardRef } from 'react';
import { Student, Invoice, ReportCardTemplateSettings } from '../types';
import { SCHOOL_LOGO_BASE64 } from './assets';
import { generateQrCodeUrl } from '../utils';

interface SchoolFeesInvoiceProps {
    student: Student | null;
    invoice: Invoice | null;
    classInfo: { level: string; arm: string; session: string; term: string };
    schoolInfo: ReportCardTemplateSettings;
}

const SchoolFeesInvoice = forwardRef<HTMLDivElement, SchoolFeesInvoiceProps>(({ student, invoice, classInfo, schoolInfo }, ref) => {
    if (!student || !invoice || !schoolInfo) return null;

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const requiredFees = invoice.feeItems.filter(f => f.type === 'required');
    const optionalFees = invoice.feeItems.filter(f => f.type === 'optional');

    const qrCodeUrl = generateQrCodeUrl({
        docType: 'School Fees Invoice',
        invoiceNo: invoice.invoiceNo,
        studentName: student.name,
        date: new Date(invoice.date).toLocaleDateString(),
        amount: invoice.totalAmount,
        school: schoolInfo.schoolName,
    });

    return (
        <div ref={ref} className="bg-white text-black p-6 font-['Arial']" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="text-center mb-4">
                <img src={SCHOOL_LOGO_BASE64} alt="School Logo" className="h-20 w-20 mx-auto mb-2 object-contain" />
                <h1 className="font-bold text-2xl uppercase">{schoolInfo.schoolName}</h1>
                <p className="text-sm">{schoolInfo.schoolAddress}</p>
                <p className="text-sm">{schoolInfo.contactInfo}</p>
            </div>
            
            <div className="text-center my-4">
                <h2 className="text-xl font-bold border-y-2 border-black py-1">SCHOOL FEES INVOICE</h2>
                <p className="font-semibold">{classInfo.session} - {classInfo.term.toUpperCase()}</p>
            </div>

            <table className="w-1/3 text-sm mb-4">
                <tbody>
                    <tr><td className="font-bold pr-2">Invoice No:</td><td>{invoice.invoiceNo}</td></tr>
                    <tr><td className="font-bold pr-2">Date:</td><td>{new Date(invoice.date).toLocaleDateString()}</td></tr>
                    <tr><td className="font-bold pr-2">Student:</td><td>{student.name}</td></tr>
                    <tr><td className="font-bold pr-2">Admission No:</td><td>{student.admissionNo}</td></tr>
                    <tr><td className="font-bold pr-2">Class:</td><td>{classInfo.level} {classInfo.arm}</td></tr>
                </tbody>
            </table>

            <div className="border-t border-dashed border-gray-400 pt-2 mb-3">
                <h3 className="font-bold text-md mb-1 border-b border-gray-300 pb-1">REQUIRED FEES (MUST PAY)</h3>
                <table className="w-full text-sm">
                    <tbody>
                        {requiredFees.map(item => (
                            <tr key={item.id}><td className="py-0.5">{item.name}</td><td className="text-right py-0.5">{formatCurrency(item.amount)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {optionalFees.length > 0 && (
                <div className="border-t border-dashed border-gray-400 pt-2 mb-3">
                    <h3 className="font-bold text-md mb-1 border-b border-gray-300 pb-1">ADDITIONAL FEES (OPTIONAL)</h3>
                     <table className="w-full text-sm">
                        <tbody>
                            {optionalFees.map(item => (
                                <tr key={item.id}><td className="py-0.5">{item.name}</td><td className="text-right py-0.5">{formatCurrency(item.amount)}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="border-t-2 border-black pt-2 text-sm">
                 <table className="w-full">
                    <tbody>
                        <tr><td className="font-bold">Required Fees:</td><td className="text-right">{formatCurrency(invoice.totalRequired)}</td></tr>
                        <tr><td className="font-bold">Additional Fees:</td><td className="text-right">{formatCurrency(invoice.totalOptional)}</td></tr>
                        <tr className="font-bold text-md"><td className="py-1">TOTAL AMOUNT:</td><td className="text-right py-1">{formatCurrency(invoice.totalAmount)}</td></tr>
                    </tbody>
                 </table>
            </div>

            <div className="bg-yellow-300 text-black text-center p-2 my-3">
                <p className="font-bold">MINIMUM PAYMENT REQUIRED: {formatCurrency(invoice.totalRequired)}</p>
                <p className="text-xs mt-1">You must pay all required fees. Additional fees are optional but recommended for your child's development.</p>
            </div>
            
            <div className="border border-gray-400 p-2 text-sm">
                <h3 className="font-bold text-center mb-2">Payment Details</h3>
                 <table className="w-full">
                    <tbody>
                        <tr><td className="font-bold w-1/4">Bank:</td><td>Your Bank Name</td></tr>
                        <tr><td className="font-bold w-1/4">Account:</td><td>Your School Account Name</td></tr>
                        <tr><td className="font-bold w-1/4">Number:</td><td>0123456789</td></tr>
                    </tbody>
                 </table>
            </div>

            <div className="flex justify-between items-center mt-6 text-xs">
                 <div className="text-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 mx-auto" crossOrigin="anonymous" />
                    <p>Scan to verify invoice authenticity</p>
                </div>
                 <div className="text-right">
                    <p>Questions? Contact {schoolInfo.contactInfo.split(',')[0].replace('Tel:', '').trim()}</p>
                    <p className="italic mt-2">This is a computer-generated invoice.</p>
                    <p>© {new Date().getFullYear()} {schoolInfo.schoolName.toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
});

export default SchoolFeesInvoice;