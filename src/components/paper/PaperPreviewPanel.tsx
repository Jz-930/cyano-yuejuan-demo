import { Submission } from '@/lib/demo/types';
import { FileText } from 'lucide-react';

export function PaperPreviewPanel({ paper }: { paper?: Submission }) {
    if (!paper) return <div className="p-4">Loading...</div>;

    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">卷面预览</h3>
            </div>
            <div className="flex-1 bg-gray-100 p-4 overflow-y-auto flex items-center justify-center">
                {/* Placeholder for PDF/Image */}
                <div className="max-w-[80%] w-full aspect-[3/4] bg-white shadow-lg rounded-sm flex flex-col items-center justify-center text-gray-300">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm font-medium text-gray-400">Paper Preview</p>
                    <p className="text-xs text-gray-300 mt-1">{paper.paperId}</p>
                </div>
            </div>
        </div>
    );
}
