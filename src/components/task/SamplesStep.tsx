import { useState } from 'react';
import { CalibrationSample } from '@/lib/demo/types';
import { FileUp, Eye, X, Check, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/lib/store/useAppStore';

interface SamplesStepProps {
    samples: CalibrationSample[];
    target: number;
}

export function SamplesStep({ samples, target }: SamplesStepProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

    const updateSample = useAppStore(s => s.actions.updateSample);

    // Find selected sample carefully
    const selectedSample = selectedSampleId ? samples.find(s => s.paperId === selectedSampleId) : null;

    const handleRowClick = (id: string) => {
        setSelectedSampleId(id);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedSampleId(null);
    };

    if (samples.length === 0) {
        return (
            <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow">
                    <FileUp className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">尚未准备样卷</h3>
                <p className="text-gray-500 mt-1 mb-4">请点击“演示：一键完成本步”生成样卷数据</p>
                <button className="text-sm text-primary font-medium hover:underline">
                    或点击上传文件 (Demo 禁用)
                </button>
            </div>
        );
    }

    return (
        <div className="relative min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                    已准备：<span className="text-primary font-bold">{samples.length}</span> / {target} 份样卷
                </h3>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    <FileUp className="w-4 h-4" />
                    继续上传
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 bg-white shadow-sm z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">样卷ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">人工分数</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">阅卷人</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {samples.map((s) => (
                            <tr key={s.paperId} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleRowClick(s.paperId)}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{s.paperId}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {s.status === 'ok' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            <Check className="w-3 h-3 mr-1" />有效
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <AlertTriangle className="w-3 h-3 mr-1" />异常
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{s.scoreHuman}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{s.grader}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Drawer Overlay */}
            {drawerOpen && (
                <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
            )}

            {/* Drawer Content */}
            <div className={clsx(
                "fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ease-in-out",
                drawerOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedSample ? (
                    <>
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg text-gray-900">样卷详情 <span className="text-gray-500 font-normal">{selectedSample.paperId}</span></h3>
                            <button onClick={closeDrawer} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="aspect-[3/4] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <FileTextIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Mock Paper Preview</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 p-5 rounded-lg space-y-4 shadow-sm">
                                <h4 className="font-medium text-gray-900 border-b pb-2 mb-2">人工评分信息</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">人工给分 (0-40)</label>
                                    <input
                                        type="number"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border"
                                        value={selectedSample.scoreHuman}
                                        onChange={(e) => updateSample(selectedSample.paperId, { scoreHuman: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">阅卷人</label>
                                    <input
                                        type="text"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm px-3 py-2 border"
                                        value={selectedSample.grader}
                                        onChange={(e) => updateSample(selectedSample.paperId, { grader: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={closeDrawer} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors">
                                取消
                            </button>
                            <button onClick={closeDrawer} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors shadow-sm">
                                保存并关闭
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Loading...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FileTextIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    );
}
