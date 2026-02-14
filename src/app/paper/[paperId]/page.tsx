'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { mockApi } from '@/lib/services/mockApi';
import { PaperPreviewPanel } from '@/components/paper/PaperPreviewPanel';
import { CriteriaResultsPanel } from '@/components/paper/CriteriaResultsPanel';
import { ScoreReviewPanel } from '@/components/paper/ScoreReviewPanel';
import { ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PaperReviewPage() {
    const params = useParams();
    const paperId = params.paperId as string; // safe cast
    const router = useRouter();

    const store = useAppStore();
    const { submissions, judgementsByPaperId, demoMode, task } = store;

    const submission = submissions.find(s => s.paperId === paperId);
    const judgement = judgementsByPaperId[paperId];

    const [generating, setGenerating] = useState(false);

    // Demo: Auto-generate logic if missing?
    // User might click "Generate Judgement"

    const handleGenerate = async () => {
        setGenerating(true);
        await mockApi.getOrGeneratePaperJudgement(paperId);
        setGenerating(false);
    };

    const handleSaveReview = (score: number, reason: string) => {
        store.actions.saveReview(paperId, score, reason);
        if (demoMode) {
            alert('已保存改分');
        }
    };

    const handleDemoAutoReview = () => {
        mockApi.demoReviewAdjustAndSave(paperId);
    };

    if (!submission) {
        return (
            <div className="p-8 text-center text-gray-500">
                未找到试卷信息 (ID: {paperId})
                <button onClick={() => router.push('/grading')} className="block mt-4 text-primary hover:underline mx-auto">
                    返回列表
                </button>
            </div>
        );
    }

    // Navigation logic
    const currentIndex = submissions.findIndex(s => s.paperId === paperId);
    const prevId = currentIndex > 0 ? submissions[currentIndex - 1].paperId : null;
    const nextId = currentIndex < submissions.length - 1 ? submissions[currentIndex + 1].paperId : null;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/grading')}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">返回列表</span>
                    </button>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{paperId}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className={submission.status === 'done' ? 'text-green-600' : 'text-gray-400'}>
                                Status: {submission.status}
                            </span>
                            {judgement?.review && <span className="text-blue-600">• 已人工复核</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex border rounded-md overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => prevId && router.push(`/paper/${prevId}`)}
                            disabled={!prevId}
                            className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 border-r"
                            title="上一份"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={() => nextId && router.push(`/paper/${nextId}`)}
                            disabled={!nextId}
                            className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                            title="下一份"
                        >
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    {demoMode && (
                        <>
                            <button
                                onClick={handleGenerate}
                                disabled={!!judgement || generating}
                                className="btn-secondary text-sm"
                            >
                                演示：生成判定详情
                            </button>
                            <button
                                onClick={handleDemoAutoReview}
                                className="btn-secondary text-sm"
                            >
                                演示：一键改分并保存
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 3-Column Content */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left: 4 cols */}
                <div className="col-span-3 h-full overflow-hidden">
                    <PaperPreviewPanel paper={submission} />
                </div>

                {/* Middle: 5 cols */}
                <div className="col-span-5 h-full overflow-hidden">
                    <CriteriaResultsPanel
                        criteria={task.criteria}
                        judgement={judgement}
                        onRequestGenerate={handleGenerate}
                        generating={generating}
                    />
                </div>

                {/* Right: 4 cols */}
                <div className="col-span-4 h-full overflow-hidden">
                    <ScoreReviewPanel
                        paper={submission}
                        judgement={judgement}
                        onSave={handleSaveReview}
                    />
                </div>
            </div>
        </div>
    );
}
