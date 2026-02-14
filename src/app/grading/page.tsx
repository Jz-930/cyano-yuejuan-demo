'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { mockApi } from '@/lib/services/mockApi';
import { OverviewBar } from '@/components/grading/OverviewBar';
import { FiltersBar, FilterState } from '@/components/grading/FiltersBar';
import { SubmissionsTable } from '@/components/grading/SubmissionsTable';
import { generateAndDownloadCsv } from '@/lib/utils/csv';

export default function GradingPage() {
    const router = useRouter();
    const store = useAppStore();
    const { task, submissions, judgementsByPaperId, demoMode } = store;

    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        risk: 'all',
        scoreBand: 'all',
    });

    const handleFilterChange = (patch: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...patch }));
    };

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => {
            if (filters.status !== 'all' && s.status !== filters.status) return false;
            if (filters.risk !== 'all') {
                if (!s.riskFlags?.includes(filters.risk)) return false;
            }
            if (filters.scoreBand !== 'all') {
                const score = s.scoreFinal ?? s.scoreModel ?? -1;
                if (score === -1) return false;
                const [min, max] = filters.scoreBand.split('-').map(Number);
                if (score < min || score > max) return false;
            }
            return true;
        });
    }, [submissions, filters]);

    const handleExport = () => {
        const data = submissions.map(s => {
            const j = judgementsByPaperId[s.paperId];
            const reviewer = j?.review?.reviewer || '';
            const reason = j?.review?.reason || '';
            const updatedAt = j?.review?.updatedAt ? new Date(j.review.updatedAt).toISOString() : '';

            return {
                paperId: s.paperId,
                status: s.status,
                scoreModel: s.scoreModel,
                scoreFinal: s.scoreFinal,
                band: s.band,
                riskFlags: (s.riskFlags || []).join('|'),
                reviewer,
                reviewReason: reason,
                updatedAt,
            };
        });
        generateAndDownloadCsv(data, `grading_results.csv`);
    };

    const overview = {
        total: submissions.length,
        done: submissions.filter(s => s.status === 'done').length,
        failed: submissions.filter(s => s.status === 'failed').length,
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">批量阅卷</h1>
                <p className="text-gray-500 text-sm">任务: {task.name}</p>
            </div>

            <OverviewBar
                modelVersion={task.modelVersion}
                total={overview.total}
                done={overview.done}
                failed={overview.failed}
                onGenerateSubmissions={() => mockApi.demoGenerateSubmissions()}
                onStartGrading={() => mockApi.runGrading()}
                onRetryFailed={() => mockApi.retryFailedSubmissions()}
                onExportCsv={handleExport}
                onDemoDone={() => mockApi.demoGradingDone()}
                demoMode={demoMode}
                status={submissions.some(s => s.status === 'running') ? 'grading' : 'idle'}
            />

            <FiltersBar
                value={filters}
                onChange={handleFilterChange}
            />

            <SubmissionsTable
                rows={filteredSubmissions}
                onReview={(id) => router.push(`/paper/${id}`)}
            />
        </div>
    );
}
