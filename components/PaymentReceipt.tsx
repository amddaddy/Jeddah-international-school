import React, { forwardRef } from 'react';
import { Student, Payment, ReportCardTemplateSettings } from '../types';
import { SCHOOL_LOGO_BASE64 } from './assets';
import { generateQrCodeUrl } from '../utils';

interface PaymentReceiptProps {
    student: Student | null;
    payment: Payment | null;
    classInfo: { level: string; arm: string; session: string; term: string };
    schoolInfo: ReportCardTemplateSettings;
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({ student, payment, classInfo, schoolInfo }, ref) => {
    if (!student || !payment || !schoolInfo) {
        return null;
    }

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const balance = payment.totalBill - payment.amountPaid;

    const qrCodeUrl = generateQrCodeUrl({
        docType: 'Payment Receipt',
        receiptNo: payment.receiptNo,
        studentName: student.name,
        date: new Date(payment.date).toLocaleDateString(),
        amountPaid: payment.amountPaid,
        school: schoolInfo.schoolName,
    });

    return (
        <div ref={ref} className="bg-white text-black p-4 font-sans" style={{ width: '80mm' }}>
            <div className="text-center">
                <img src={SCHOOL_LOGO_BASE64} alt="School Logo" className="h-16 w-16 mx-auto mb-2 object-contain" />
                <h1 className="font-bold text-lg uppercase">{schoolInfo.schoolName}</h1>
                <p className="text-xs">{schoolInfo.schoolAddress}</p>
                <p className="text-xs">{schoolInfo.contactInfo}</p>
            </div>

            <hr className="border-dashed border-black my-2" />
            
            <div className="bg-gray-200 text-center py-1 my-2">
                <h2 className="font-bold text-md">PAYMENT RECEIPT</h2>
            </div>
            
            <div className="text-sm space-y-1">
                <p><strong>Receipt No:</strong> {payment.receiptNo}</p>
                <p><strong>Date:</strong> {new Date(payment.date).toLocaleString()}</p>
                <p><strong>Student:</strong> {student.name}</p>
                <p><strong>Class:</strong> {classInfo.level} {classInfo.arm}</p>
                <p><strong>Session:</strong> {classInfo.session}</p>
                <p><strong>Term:</strong> {classInfo.term}</p>
                <p><strong>Invoice No:</strong> {payment.invoiceNo}</p>
            </div>
            
            <hr className="border-dashed border-black my-2" />

             <div className="text-sm space-y-1">
                <p><strong>Total Bill:</strong> {formatCurrency(payment.totalBill)}</p>
             </div>

            <div className="bg-gray-200 py-1 my-2 text-sm">
                <p><strong>Paid:</strong> {formatCurrency(payment.amountPaid)}</p>
                <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                <p><strong>Processed By:</strong> {payment.processedBy}</p>
            </div>

             <hr className="border-dashed border-black my-2" />

             <div className="bg-gray-200 py-1 my-2 text-sm font-bold">
                 <p><strong>Total Paid:</strong> {formatCurrency(payment.amountPaid)}</p>
                 <p><strong>Balance:</strong> {formatCurrency(balance)}</p>
             </div>
             
             <div className="text-center my-3">
                <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 mx-auto" crossOrigin="anonymous" />
                <p className="text-xs">Scan to verify payment</p>
             </div>

             <div className="text-center">
                <p className="font-bold">Thank you for your payment!</p>
                <p className="text-xs">www.{schoolInfo.schoolName.toLowerCase().replace(/\s+/g, '')}.intelps.cloud</p>
                <p className="text-xs italic">Computer generated receipt</p>
             </div>
        </div>
    );
});

export default PaymentReceipt;