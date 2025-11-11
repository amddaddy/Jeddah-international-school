import { ScoreBreakdown, Student } from './types';
import React from 'react';

// --- SUBJECT MANAGEMENT ---

export const JUNIOR_SUBJECTS = ['English Studies', 'Mathematics', 'Basic Science', 'Basic Technology', 'Computer Studies', 'PHE', 'Social Studies', 'Civic Education', 'Security Education', 'Agricultural Science', 'Home Economics', 'Business Studies', 'Keyboarding', 'CCA', 'History', 'CRS'];

export const SENIOR_CORE_SUBJECTS = ['English Language', 'Mathematics', 'Civic Education', 'Computer Studies'];
export const SCIENCE_SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Further Mathematics'];
export const ART_SUBJECTS = ['Literature in English', 'Government', 'History', 'CRS'];
export const COMMERCE_SUBJECTS = ['Economics', 'Accounting', 'Commerce', 'Office Practice'];

export const ALL_SENIOR_SUBJECTS = [...new Set([...SENIOR_CORE_SUBJECTS, ...SCIENCE_SUBJECTS, ...ART_SUBJECTS, ...COMMERCE_SUBJECTS])];

export const getSubjectsForStudent = (student: Student, section: 'Junior' | 'Senior'): string[] => {
    if (section === 'Junior') {
        return JUNIOR_SUBJECTS;
    }
    if (!student.stream) {
        return SENIOR_CORE_SUBJECTS; // Default if no stream is assigned
    }
    switch (student.stream) {
        case 'Science':
            return [...SENIOR_CORE_SUBJECTS, ...SCIENCE_SUBJECTS];
        case 'Art':
            return [...SENIOR_CORE_SUBJECTS, ...ART_SUBJECTS];
        case 'Commerce':
            return [...SENIOR_CORE_SUBJECTS, ...COMMERCE_SUBJECTS];
        default:
            return SENIOR_CORE_SUBJECTS;
    }
};

export const SUBJECT_ABBREVIATIONS: Record<string, string> = {
    'English Studies': 'ENG', 'Mathematics': 'MAT', 'Basic Science': 'BSC', 'Basic Technology': 'B-TECH',
    'Computer Studies': 'COMP', 'PHE': 'PHE', 'Social Studies': 'SOS', 'Civic Education': 'CIV',
    'Security Education': 'SEC', 'Agricultural Science': 'AGR', 'Home Economics': 'H-ECO',
    'Business Studies': 'BUS', 'Keyboarding': 'KEYB', 'CCA': 'CCA', 'History': 'HIS', 'CRS': 'CRS',
    'English Language': 'ENG', 'Physics': 'PHY', 'Chemistry': 'CHE', 'Biology': 'BIO',
    'Further Mathematics': 'F-MAT', 'Literature in English': 'LIT', 'Government': 'GOV',
    'Economics': 'ECO', 'Accounting': 'ACC', 'Commerce': 'COM', 'Office Practice': 'O-PRAC',
};

// --- SCORE & GRADE CALCULATIONS ---

export const getScoreTotal = (scoreBreakdown: ScoreBreakdown | undefined): number => {
    if (!scoreBreakdown) return 0;
    const { firstCA, secondCA, exam } = scoreBreakdown;
    const firstCANum = typeof firstCA === 'number' ? firstCA : 0;
    const secondCANum = typeof secondCA === 'number' ? secondCA : 0;
    const examNum = typeof exam === 'number' ? exam : 0;
    return firstCANum + secondCANum + examNum;
};

export const getGradeInfo = (score: number): { grade: string; remark: string } => {
    if (score >= 75) return { grade: 'A1', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B2', remark: 'V. Good' };
    if (score >= 65) return { grade: 'B3', remark: 'Good' };
    if (score >= 60) return { grade: 'C4', remark: 'Credit' };
    if (score >= 55) return { grade: 'C5', remark: 'Credit' };
    if (score >= 50) return { grade: 'C6', remark: 'Credit' };
    if (score >= 45) return { grade: 'D7', remark: 'Pass' };
    if (score >= 40) return { grade: 'E8', remark: 'Pass' };
    return { grade: 'F9', remark: 'Fail' };
};

export const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// --- QR CODE GENERATION ---

/**
 * Generates a URL for a QR code using a CORS-friendly API.
 * @param verificationData - An object containing the data to be encoded.
 * @returns A URL string that can be used as the src for an <img> tag.
 */
export const generateQrCodeUrl = (verificationData: Record<string, any>): string => {
    const dataString = JSON.stringify(verificationData);
    const encodedData = encodeURIComponent(dataString);
    const size = '150x150'; // Standard size for the QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedData}`;
};


// --- PDF GENERATION UTILITY ---

export const generatePdf = async (
    ref: React.RefObject<HTMLDivElement>,
    filename: string,
    orientation: 'p' | 'l' = 'p',
    format: string | number[] = 'a4'
) => {
    if (ref.current) {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const pageElements = ref.current.querySelectorAll('.report-card-page, .subject-report-page, .broadsheet-page');
            if (pageElements.length === 0) {
                alert("No content found to generate a PDF.");
                return;
            }

            const pdf = new jsPDF(orientation, 'mm', format);
            const quality = 0.95; // High-quality JPEG

            for (let i = 0; i < pageElements.length; i++) {
                const element = pageElements[i] as HTMLElement;
                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/jpeg', quality);

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;

                let finalWidth = pdfWidth;
                let finalHeight = pdfWidth / ratio;
                
                if (finalHeight > pdfHeight) {
                    finalHeight = pdfHeight;
                    finalWidth = pdfHeight * ratio;
                }
                
                if (i > 0) {
                    pdf.addPage();
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, finalWidth, finalHeight);
            }
            pdf.save(filename);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the PDF. Please check the console.");
        }
    }
};