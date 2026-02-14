import { useState, useEffect } from 'react';
import { PaperJudgement, Submission } from '@/lib/demo/types';
import { Save, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ScoreReviewPanelProps {
    paper: Submission;
    judgement?: PaperJudgement;
    onSave: (score: number, reason: string) => void;
}

export function ScoreReviewPanel({ paper, judgement, onSave }: ScoreReviewPanelProps) {
    // Local edit state
    const [editingScore, setEditingScore] = useState<number>(paper.scoreFinal ?? paper.scoreModel ?? 0);
    const [reason, setReason] = useState(judgement?.review?.reason || '');
    const [hasChanges, setHasChanges] = useState(false);

    // Sync when paper changes
    useEffect(() => {
        setEditingScore(paper.scoreFinal ?? paper.scoreModel ?? 0);
        setReason(judgement?.review?.reason || '');
        setHasChanges(false);
    }, [paper.paperId, paper.scoreFinal, paper.scoreModel, judgement]);

    const handleScoreChange = (val: number) => {
        setEditingScore(Math.min(40, Math.max(0, val)));
        setHasChanges(true);
    };

    const handleReasonChange = (val: string) => {
        setReason(val);
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!reason.trim()) {
            alert('请填写改分原因');
            return;
        }
        onSave(editingScore, reason);
        setHasChanges(false);
    };

    const isRisk = (paper.riskFlags || []).length > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-medium text-gray-700">分数与复核</h3>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Main Score Display */}
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">模型建议得分</div>
                    <div className="text-3xl font-bold font-mono text-gray-900">{paper.scoreModel ?? '-'}</div>
                    <div className="text-sm text-gray-500 mt-1 font-medium">{paper.band ?? '-'}</div>
                </div>

                {/* Risk Flags */}
                {isRisk && (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-100 flex gap-2 items-start">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <div className="font-semibold mb-1">风险提示</div>
                            <div className="flex flex-wrap gap-1">
                                {paper.riskFlags!.map(f => (
                                    <span key={f} className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-xs border border-amber-200">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Score Explanation Summary */}
                {judgement?.scoreExplain && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">评分依据摘要</h4>
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded leading-relaxed border border-gray-100">
                            {judgement.scoreExplain.summary}
                        </div>
                        <div className="mt-2 space-y-1">
                            {judgement.scoreExplain.topFactors.map((f, i) => (
                                <div key={i} className="text-xs flex gap-2 text-gray-500">
                                    <span className="text-primary">•</span>
                                    <span className="line-clamp-1">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* Manual Review Form */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">人工复核</h4>
                        {paper.scoreFinal !== undefined && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> 已复核
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">最终得分</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleScoreChange(editingScore - 1)}
                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                                >-</button>
                                <input
                                    type="number"
                                    className="w-16 h-8 text-center border-gray-300 rounded focus:ring-primary focus:border-primary font-mono font-bold"
                                    value={editingScore}
                                    onChange={(e) => handleScoreChange(Number(e.target.value))}
                                />
                                <button
                                    onClick={() => handleScoreChange(editingScore + 1)}
                                    className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50"
                                >+</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">改分/确认原因</label>
                            <textarea
                                rows={3}
                                className="w-full text-sm border-gray-300 rounded focus:ring-primary focus:border-primary resize-none"
                                placeholder="请填写原因..."
                                value={reason}
                                onChange={(e) => handleReasonChange(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className={clsx(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-all shadow-sm",
                                hasChanges
                                    ? "bg-primary text-white hover:bg-opacity-90 shadow hover:shadow-md"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Save className="w-4 h-4" />
                            保存复核结果
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
