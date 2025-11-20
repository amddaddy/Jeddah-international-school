import React, { useRef, useState } from 'react';
import XIcon from './icons/XIcon';
import DownloadIcon from './icons/DownloadIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { generatePdf } from '../utils';

interface PrintPreviewModalProps {
  content: {
    title: string;
    component: React.ReactNode;
    orientation?: 'p' | 'l';
    format?: string | number[];
  };
  onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ content, onClose }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    try {
      const filename = `${content.title.toLowerCase().replace(/[\s/]/g, '-')}.pdf`;
      await generatePdf(contentRef, filename, content.orientation, content.format);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      aria-labelledby="print-preview-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-200 rounded-lg shadow-xl w-full max-w-5xl h-[95vh] flex flex-col m-4">
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-slate-300 rounded-t-lg">
          <h2 id="print-preview-title" className="text-xl font-bold text-slate-800 truncate pr-4">
            {content.title}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? <SpinnerIcon className="mr-2" /> : <DownloadIcon className="w-5 h-5 mr-2" />}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close preview"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="flex-grow p-4 sm:p-6 overflow-auto">
            <div ref={contentRef}>
              {content.component}
            </div>
        </main>
      </div>
    </div>
  );
};

export default PrintPreviewModal;