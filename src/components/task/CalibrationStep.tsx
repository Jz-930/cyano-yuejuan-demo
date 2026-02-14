import { CalibrationRun } from '@/lib/demo/types';
import { Loader2, CheckCircle, BarChart2, AlertCircle, Play } from 'lucide-react';
import { clsx } from 'clsx';

interface CalibrationStepProps {
    run: CalibrationRun;
    locked: boolean;     // criteria locked?
    hasSamples: boolean; // samples ready?

    onStart: () => void;
    onGoGrading: () => void;
}

export function CalibrationStep({
    run,
    locked,
    hasSamples,
    onStart,
    onGoGrading
}: CalibrationStepProps) {
    const canStart = locked && hasSamples && run.status === 'idle';

    return (
        <div className="space-y-8">
            {/* Start / Progress Area */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">模型校准</h3>
                        <p className="text-sm text-gray-500">
                            基于 100 份样卷进行人工-模型对齐，生成当前任务的专用评分模型。
                        </p>
                    </div>
                    {run.status === 'idle' && (
                        <button
                            onClick={onStart}
                            disabled={!canStart}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow active:scale-[0.98]"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            开始校准
                        </button>
                    )}
                    {run.status === 'done' && (
                        <button
                            onClick={onGoGrading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow"
                        >
                            <CheckCircle className="w-5 h-5" />
                            进入批量阅卷
                        </button>
                    )}
                </div>

                {/* Pre-flight Checks */}
                {run.status === 'idle' && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className={clsx("flex items-center gap-2 p-3 rounded border", locked ? "bg-green-50 border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-500")}>
                            {locked ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>判定标准已生成并锁定</span>
                        </div>
                        <div className={clsx("flex items-center gap-2 p-3 rounded border", hasSamples ? "bg-green-50 border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-500")}>
                            {hasSamples ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>样卷已准备 (100份)</span>
                        </div>
                    </div>
                )}

                {/* Running / Done: Progress & Logs */}
                {run.status !== 'idle' && (
                    <div className="space-y-4">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                        Progress
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-blue-600">
                                        {run.progress}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100 transition-all">
                                <div style={{ width: `${run.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"></div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-md p-4 font-mono text-xs text-green-400 h-40 overflow-y-auto">
                            {run.logs.map((log, i) => (
                                <div key={i} className="mb-1">
                                    <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {log}...
                                </div>
                            ))}
                            {run.status === 'running' && (
                                <div className="animate-pulse flex items-center gap-1 mt-2 text-gray-500">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                </div>
                            )}
                            {run.status === 'done' && (
                                <div className="text-white mt-2 font-bold flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3" /> 校准完成
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Done: Metrics */}
            {run.status === 'done' && run.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <MetricCard label="MAE (平均绝对误差)" value={run.metrics.mae} sub="越低越好" />
                    <MetricCard label="RMSE (均方根误差)" value={run.metrics.rmse} sub="越低越好" />
                    <MetricCard label="Pearson 相关系数" value={run.metrics.pearson} sub="接近 1" highlight />
                    <MetricCard label="Spearman 相关系数" value={run.metrics.spearman} sub="接近 1" highlight />
                    <MetricCard label="分档一致率" value={(run.metrics.bandAcc * 100).toFixed(1) + '%'} sub="Target > 80%" highlight />
                    <MetricCard label="建议复核比例" value={(run.metrics.reviewRate * 100).toFixed(1) + '%'} sub="Low Risk" />
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
    return (
        <div className={clsx("p-4 rounded-lg border", highlight ? "bg-green-50 border-green-200" : "bg-white border-gray-200")}>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={clsx("text-2xl font-bold mb-1", highlight ? "text-green-700" : "text-gray-900")}>
                {value}
            </div>
            {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
    );
}
