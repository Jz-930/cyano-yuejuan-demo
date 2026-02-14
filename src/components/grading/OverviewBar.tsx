import { Play, RotateCcw, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface OverviewBarProps {
    modelVersion?: string;
    total: number;
    done: number;
    failed: number;

    onGenerateSubmissions: () => void;
    onStartGrading: () => void;
    onRetryFailed: () => void;
    onExportCsv: () => void;
    onDemoDone: () => void;

    demoMode: boolean;
    status: 'idle' | 'grading';
}

export function OverviewBar({
    modelVersion,
    total,
    done,
    failed,
    onGenerateSubmissions,
    onStartGrading,
    onRetryFailed,
    onExportCsv,
    onDemoDone,
    demoMode,
    status
}: OverviewBarProps) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">当前模型版本</span>
                    <span className="font-mono font-bold text-gray-900">{modelVersion || '-'}</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs">总卷数</span>
                        <span className="font-medium text-lg">{total}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs">已完成</span>
                        <span className="font-medium text-lg text-green-600">{done}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs">失败/异常</span>
                        <span className={clsx("font-medium text-lg", failed > 0 ? "text-red-600" : "text-gray-400")}>{failed}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {total === 0 && (
                    <button onClick={onGenerateSubmissions} className="btn-secondary text-sm">
                        演示：一键生成全量卷
                    </button>
                )}

                {total > 0 && done < total && failed === 0 && (
                    <>
                        <button onClick={onStartGrading} className="btn-primary text-sm flex items-center gap-2">
                            <Play className="w-4 h-4" /> 开始批量阅卷
                        </button>
                        {demoMode && (
                            <button onClick={onDemoDone} className="btn-secondary text-sm">
                                演示：一键完成
                            </button>
                        )}
                    </>
                )}

                {failed > 0 && (
                    <button onClick={onRetryFailed} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 font-medium text-sm transition-colors">
                        <RotateCcw className="w-4 h-4" /> 重试失败项 ({failed})
                    </button>
                )}

                <button
                    onClick={onExportCsv}
                    disabled={done === 0}
                    className="btn-outline text-sm flex items-center gap-2 ml-2 disabled:opacity-50"
                >
                    <Download className="w-4 h-4" /> 导出结果
                </button>
            </div>
        </div>
    );
}
