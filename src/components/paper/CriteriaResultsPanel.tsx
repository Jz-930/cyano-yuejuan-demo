import { useState } from 'react';
import { Criterion, PaperJudgement } from '@/lib/demo/types';
import { Check, X, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface CriteriaResultsPanelProps {
    criteria: Criterion[];
    judgement?: PaperJudgement;
    onRequestGenerate: () => void;
    generating?: boolean;
}

export function CriteriaResultsPanel({ criteria, judgement, onRequestGenerate, generating }: CriteriaResultsPanelProps) {
    const [showAll, setShowAll] = useState(false);

    if (!judgement) {
        return (
            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-gray-900 font-medium mb-2">尚无判定详情</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">点击下方按钮，模型将根据所有判定标准对本卷进行逐项分析。</p>
                <button
                    onClick={onRequestGenerate}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? '生成中...' : '演示：生成判定详情'}
                </button>
            </div>
        );
    }

    const results = judgement.criteriaResults;
    const displayResults = showAll ? results : results.slice(0, 20);

    return (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <h3 className="font-medium text-gray-700">
                    判定维度 ({results.length})
                </h3>
                <div className="text-xs text-gray-500">
                    {showAll ? '全部显示' : `显示前 20 条`}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
                <div className="divide-y divide-gray-100">
                    {displayResults.map((res, idx) => {
                        const crit = criteria.find(c => c.id === res.criterionId);
                        return (
                            <div key={res.criterionId} className="p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <div className="text-sm font-medium text-gray-900 leading-snug">
                                        <span className="text-gray-400 font-normal mr-2">#{idx + 1}</span>
                                        {crit?.text || res.criterionId}
                                    </div>
                                    <div className={clsx(
                                        "shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded",
                                        res.result === '是' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    )}>
                                        {res.result === '是' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        {res.result}
                                    </div>
                                </div>
                                {/* Evidence & Confidence */}
                                <div className="mt-2 pl-6 border-l-2 border-gray-100 group-hover:border-primary/20">
                                    <p className="text-xs text-gray-600 italic mb-1">
                                        “{res.evidence}”
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">置信度:</span>
                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={clsx("h-full rounded-full", res.confidence > 0.8 ? "bg-green-500" : "bg-amber-500")}
                                                style={{ width: `${res.confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono text-gray-400">{res.confidence.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {results.length > 20 && (
                    <div className="p-4 text-center border-t border-gray-50">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1 w-full"
                        >
                            {showAll ? (
                                <>收起 <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>展开全部 ({results.length}) <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
