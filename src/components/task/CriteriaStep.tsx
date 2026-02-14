import { useState } from 'react';
import { Criterion } from '@/lib/demo/types';
import { Lock, Loader2, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface CriteriaStepProps {
    questionText: string;
    rubricText: string;
    criteria: Criterion[];
    locked: boolean;
    generating: boolean;

    onGenerate: () => Promise<void>;
    onToggleEnabled: (id: string) => void;
    onUpdateText: (id: string, text: string) => void;
    onLock: () => void;
}

export function CriteriaStep({
    questionText,
    rubricText,
    criteria,
    locked,
    generating,
    onGenerate,
    onToggleEnabled,
    onUpdateText,
    onLock,
}: CriteriaStepProps) {
    const [showLockModal, setShowLockModal] = useState(false);

    const enabledCount = criteria.filter(c => c.enabled).length;

    if (criteria.length === 0 && !generating) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900 mb-2">尚未生成判定标准</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    系统将基于前两步的题目与阅卷标准，自动拆解出颗粒度更细的 Yes/No 判定维度。
                </p>
                <button
                    onClick={onGenerate}
                    disabled={!questionText || !rubricText}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    立即生成判定标准
                </button>
                {(!questionText || !rubricText) && (
                    <p className="text-xs text-red-500 mt-2">请先完成 Step1 与 Step2 的填写</p>
                )}
            </div>
        );
    }

    if (generating) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-600 font-medium">正在生成判定标准...</p>
                <p className="text-gray-400 text-sm mt-1">大约需要 2-3 秒，请稍候</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        已生成：<span className="font-bold text-gray-900">{criteria.length}</span> 条
                    </div>
                    <div className="text-sm text-gray-600">
                        保留：<span className="font-bold text-primary">{enabledCount}</span> 条
                    </div>
                </div>

                {!locked ? (
                    <button
                        onClick={() => setShowLockModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary text-sm font-medium rounded hover:bg-green-50"
                    >
                        <Lock className="w-4 h-4" />
                        确定并锁定标准
                    </button>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded cursor-not-allowed">
                        <Lock className="w-4 h-4" />
                        判定标准已锁定
                    </div>
                )}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                启用
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                类别
                            </th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                标准内容 (Yes/No)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {criteria.map((item) => (
                            <tr key={item.id} className={clsx(!item.enabled && "bg-gray-50 opacity-60")}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={item.enabled}
                                        disabled={locked}
                                        onChange={() => onToggleEnabled(item.id)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {locked ? (
                                        <span className="text-sm text-gray-700 block w-full truncate" title={item.text}>{item.text}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) => onUpdateText(item.id, e.target.value)}
                                            className="text-sm text-gray-900 w-full border-gray-200 focus:ring-0 focus:border-primary rounded px-2 py-1"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Lock Modal */}
            {showLockModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4 mx-auto">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-medium text-center text-gray-900 mb-2">锁定判定标准？</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            锁定后将用于样卷校准与批量阅卷。本版本锁定后不可修改。
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLockModal(false)}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    onLock();
                                    setShowLockModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-opacity-90 transition-colors"
                            >
                                锁定并继续
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
