import { Submission } from '@/lib/demo/types';
import { Eye, Check, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface SubmissionsTableProps {
    rows: Submission[];
    onReview: (paperId: string) => void;
}

export function SubmissionsTable({ rows, onReview }: SubmissionsTableProps) {
    if (rows.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">暂无试卷数据</h3>
                <p className="text-gray-500 mt-1">请点击上方“演示：一键生成全量卷”</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">试卷ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型给分</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">定档</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风险标记</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row) => (
                            <tr key={row.paperId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {row.paperId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={row.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono font-medium">
                                    {row.scoreFinal !== undefined ? (
                                        <span className="text-primary font-bold">{row.scoreFinal} <span className="text-gray-400 text-xs font-normal strike-through decoration-gray-400 line-through decoration-1 opacity-60 ml-1">{row.scoreModel}</span></span>
                                    ) : (
                                        row.scoreModel ?? '-'
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row.band ? (
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-xs font-medium border",
                                            row.band === '一等' ? "bg-green-50 text-green-700 border-green-100" :
                                                row.band === '四等' ? "bg-red-50 text-red-700 border-red-100" :
                                                    "bg-gray-50 text-gray-600 border-gray-100"
                                        )}>{row.band}</span>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                                        {row.riskFlags && row.riskFlags.length > 0 ? row.riskFlags.map(f => (
                                            <span key={f} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-100">
                                                {f}
                                            </span>
                                        )) : (
                                            row.status === 'done' ? <span className="text-gray-300">-</span> : null
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onReview(row.paperId)}
                                        className="text-primary hover:text-green-700 inline-flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        复核
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'pending') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">待阅卷</span>;
    if (status === 'running') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />阅卷中</span>;
    if (status === 'failed') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />失败</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"><Check className="w-3 h-3 mr-1" />完成</span>;
}
