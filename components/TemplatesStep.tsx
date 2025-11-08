import React from 'react';
import { TemplateSettings, ReportCardTemplateSettings } from '../types';
import Card from './Card';

interface TemplatesStepProps {
  settings: TemplateSettings;
  setSettings: React.Dispatch<React.SetStateAction<TemplateSettings>>;
}

const TemplatesStep: React.FC<TemplatesStepProps> = ({ settings, setSettings }) => {
  const handleReportCardChange = <K extends keyof ReportCardTemplateSettings>(
    field: K,
    value: ReportCardTemplateSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      reportCard: { ...prev.reportCard, [field]: value },
    }));
  };

  const handleSubjectWiseChange = (field: keyof TemplateSettings['subjectWise'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      subjectWise: { ...prev.subjectWise, [field]: value },
    }));
  };
  
  const handleBroadsheetChange = (field: keyof TemplateSettings['broadsheet'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      broadsheet: { ...prev.broadsheet, [field]: value },
    }));
  };
  
  const commonInputClass = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500";
  const checkboxClass = "h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500";

  return (
    <div className="space-y-8">
      <Card title="Report Card Customization">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
              <input id="schoolName" type="text" value={settings.reportCard.schoolName} onChange={e => handleReportCardChange('schoolName', e.target.value)} className={commonInputClass} />
            </div>
            <div>
              <label htmlFor="schoolAddress" className="block text-sm font-medium text-slate-700 mb-1">School Address</label>
              <input id="schoolAddress" type="text" value={settings.reportCard.schoolAddress} onChange={e => handleReportCardChange('schoolAddress', e.target.value)} className={commonInputClass} />
            </div>
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-slate-700 mb-1">Contact Information</label>
              <input id="contactInfo" type="text" value={settings.reportCard.contactInfo} onChange={e => handleReportCardChange('contactInfo', e.target.value)} className={commonInputClass} />
            </div>
             <div>
              <label htmlFor="fontFamily" className="block text-sm font-medium text-slate-700 mb-1">Font Family</label>
              <select id="fontFamily" value={settings.reportCard.fontFamily} onChange={e => handleReportCardChange('fontFamily', e.target.value as ReportCardTemplateSettings['fontFamily'])} className={commonInputClass}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Visible Sections</h3>
            <div className="flex items-center"><input id="showGradeAnalysis" type="checkbox" checked={settings.reportCard.showGradeAnalysis} onChange={e => handleReportCardChange('showGradeAnalysis', e.target.checked)} className={checkboxClass} /><label htmlFor="showGradeAnalysis" className="ml-2 text-sm text-slate-600">Grade Analysis Table</label></div>
            <div className="flex items-center"><input id="showQRCode" type="checkbox" checked={settings.reportCard.showQRCode} onChange={e => handleReportCardChange('showQRCode', e.target.checked)} className={checkboxClass} /><label htmlFor="showQRCode" className="ml-2 text-sm text-slate-600">QR Code for Verification</label></div>
            <div className="flex items-center"><input id="showClassPosition" type="checkbox" checked={settings.reportCard.showClassPosition} onChange={e => handleReportCardChange('showClassPosition', e.target.checked)} className={checkboxClass} /><label htmlFor="showClassPosition" className="ml-2 text-sm text-slate-600">Class Position</label></div>
            <div className="flex items-center"><input id="showPromotionStatus" type="checkbox" checked={settings.reportCard.showPromotionStatus} onChange={e => handleReportCardChange('showPromotionStatus', e.target.checked)} className={checkboxClass} /><label htmlFor="showPromotionStatus" className="ml-2 text-sm text-slate-600">Promotion Status</label></div>
          </div>
        </div>
      </Card>

      <Card title="Subject-Wise Report Customization">
        <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Visible Sections</h3>
            <div className="flex items-center"><input id="showSummary" type="checkbox" checked={settings.subjectWise.showSummary} onChange={e => handleSubjectWiseChange('showSummary', e.target.checked)} className={checkboxClass} /><label htmlFor="showSummary" className="ml-2 text-sm text-slate-600">Summary & Grade Distribution</label></div>
            <div className="flex items-center"><input id="showPerformanceIndicators" type="checkbox" checked={settings.subjectWise.showPerformanceIndicators} onChange={e => handleSubjectWiseChange('showPerformanceIndicators', e.target.checked)} className={checkboxClass} /><label htmlFor="showPerformanceIndicators" className="ml-2 text-sm text-slate-600">Performance Indicators</label></div>
            <div className="flex items-center"><input id="showPerformanceBar" type="checkbox" checked={settings.subjectWise.showPerformanceBar} onChange={e => handleSubjectWiseChange('showPerformanceBar', e.target.checked)} className={checkboxClass} /><label htmlFor="showPerformanceBar" className="ml-2 text-sm text-slate-600">Performance Bar & F9 Count</label></div>
        </div>
      </Card>
      
      <Card title="Broadsheet Report Customization">
         <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-800 border-b pb-2">Visible Sections</h3>
            <div className="flex items-center"><input id="showSubjectAverage" type="checkbox" checked={settings.broadsheet.showSubjectAverage} onChange={e => handleBroadsheetChange('showSubjectAverage', e.target.checked)} className={checkboxClass} /><label htmlFor="showSubjectAverage" className="ml-2 text-sm text-slate-600">Subject Average Row</label></div>
            <div className="flex items-center"><input id="showHighestScore" type="checkbox" checked={settings.broadsheet.showHighestScore} onChange={e => handleBroadsheetChange('showHighestScore', e.target.checked)} className={checkboxClass} /><label htmlFor="showHighestScore" className="ml-2 text-sm text-slate-600">Highest Score Row</label></div>
            <div className="flex items-center"><input id="showLowestScore" type="checkbox" checked={settings.broadsheet.showLowestScore} onChange={e => handleBroadsheetChange('showLowestScore', e.target.checked)} className={checkboxClass} /><label htmlFor="showLowestScore" className="ml-2 text-sm text-slate-600">Lowest Score Row</label></div>
        </div>
      </Card>
    </div>
  );
};

export default TemplatesStep;
