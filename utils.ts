import { ScoreBreakdown } from './types';

export const getScoreTotal = (scoreBreakdown: ScoreBreakdown | undefined): number => {
    if (!scoreBreakdown) {
        return 0;
    }
    const { firstCA, secondCA, exam } = scoreBreakdown;
    // Ensure only numbers are added up, treating non-numeric values as 0.
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