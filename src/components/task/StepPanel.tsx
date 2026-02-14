import { ReactNode } from 'react';
import { Zap } from 'lucide-react';

interface StepPanelProps {
    title: string;
    description?: string;
    children: ReactNode;

    // Demo action
    demoMode?: boolean;
    onDemoClick?: () => void;
    demoLabel?: string;
    demoDisabled?: boolean; // if step is already filled/done
}

export function StepPanel({
    title,
    description,
    children,
    demoMode,
    onDemoClick,
    demoLabel = "演示：一键完成本步",
    demoDisabled
}: StepPanelProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
                </div>

                {demoMode && onDemoClick && (
                    <button
                        onClick={onDemoClick}
                        disabled={demoDisabled}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4" />
                        {demoLabel}
                    </button>
                )}
            </div>

            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
