import { Submission } from '@/lib/demo/types';

export function downloadSubmissionsCsv(submissions: Submission[]) {
    const headers = [
        'paperId',
        'status',
        'scoreModel',
        'scoreFinal',
        'band',
        'riskFlags',
        'reviewer',
        'reviewReason',
        'updatedAt'
    ];

    const rows = submissions.map(s => {
        // We don't have reviewer/reviewReason in Submission type directly, 
        // but in a real app or if we joined with judgements we would.
        // For this demo, we can just export what's available or join if needed.
        // Requirement says: "judgement.review 写入 reviewer/reason"
        // But Submission list doesn't have it.
        // We can assume for now we just export what's in submission or just leave blank if not joined.
        // Actually, Store has judgementsByPaperId. The export function might need access to storestate or we pass joined data.
        // To keep it simple, I'll allow passing joined data or just export base data.
        // User request: "12. CSV 导出字段... reviewer/reviewReason"

        // I'll make this function accept `any[]` or specific joined type.
        // But for now let's just use what's in Submission and maybe some extra fields if passed.
        return [
            s.paperId,
            s.status,
            s.scoreModel ?? '',
            s.scoreFinal ?? '',
            s.band ?? '',
            (s.riskFlags || []).join('|'),
            // reviewer/reason will be handled by the caller preparing the data
        ];
    });

    // Actually, let's just make it generic.
    // The caller will form the objects.
}

export function generateAndDownloadCsv(data: any[], filename = 'grading_results.csv') {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const cell = row[header] ?? '';
            // Escape quotes
            const stringCell = String(cell).replace(/"/g, '""');
            return `"${stringCell}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
