import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface WizardFooterProps {
    currentStep: number;
    totalSteps: number;
    onPrev: () => void;
    onNext: () => void;
    nextDisabled?: boolean;
    nextLabel?: string;
    prevDisabled?: boolean;
    loading?: boolean;
}

export function WizardFooter({
    currentStep,
    totalSteps,
    onPrev,
    onNext,
    nextDisabled,
    nextLabel,
    prevDisabled,
    loading
}: WizardFooterProps) {
    return (
        <div className="fixed bottom-0 left-20 right-0 p-4 bg-white border-t border-gray-200 flex items-center justify-between z-40">
            <button
                onClick={onPrev}
                disabled={currentStep === 1 || prevDisabled || loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-30 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                上一步
            </button>

            <div className="flex gap-2">
                {/* Optional: Cancel or Save Draft */}
            </div>

            <button
                onClick={onNext}
                disabled={nextDisabled || loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {nextLabel || (currentStep === totalSteps ? '完成' : '下一步')}
                {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    );
}
