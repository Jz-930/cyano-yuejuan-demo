import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Criterion, CalibrationSample, CalibrationRun, Submission, PaperJudgement, TaskStatus
} from '../demo/types';

export interface TaskState {
    id: string;
    name: string;
    status: TaskStatus;

    questionText: string;
    rubricText: string;

    criteria: Criterion[];
    criteriaLocked: boolean;
    criteriaVersionId?: string;

    // After Calibration
    modelVersion?: string;
}

export interface AppState {
    // global
    demoMode: boolean;

    // task config
    task: TaskState;
    currentStep: 1 | 2 | 3 | 4 | 5;

    // calibration
    calibrationSamples: CalibrationSample[];
    calibrationRun: CalibrationRun;

    // grading
    submissions: Submission[];

    // paper details
    judgementsByPaperId: Record<string, PaperJudgement | undefined>;

    // actions
    actions: {
        setDemoMode: (v: boolean) => void;
        resetAll: () => void;

        // wizard nav
        setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
        nextStep: () => void;
        prevStep: () => void;

        // step1/2
        setQuestionText: (text: string) => void;
        setRubricText: (text: string) => void;

        // step3 criteria
        setCriteria: (criteria: Criterion[]) => void;
        updateCriterionText: (id: string, text: string) => void;
        toggleCriterionEnabled: (id: string) => void;
        lockCriteria: (versionId: string) => void;

        // step4 samples
        setCalibrationSamples: (samples: CalibrationSample[]) => void;
        updateSample: (paperId: string, patch: Partial<CalibrationSample>) => void;

        // step5 calibration run
        setCalibrationRun: (patch: Partial<CalibrationRun>) => void;
        setModelVersion: (v: string) => void;

        // grading
        setSubmissions: (subs: Submission[]) => void;
        updateSubmission: (paperId: string, patch: Partial<Submission>) => void;

        // paper judgement
        setJudgement: (paperId: string, judgement: PaperJudgement) => void;

        // review
        saveReview: (paperId: string, scoreFinal: number, reason: string) => void;
    };
}

const initialState = {
    demoMode: true,
    currentStep: 1 as const,
    task: {
        id: 'TASK-001',
        name: '单题阅卷任务（Demo）',
        status: 'draft' as const,
        questionText: '',
        rubricText: '',
        criteria: [],
        criteriaLocked: false,
    },
    calibrationSamples: [],
    calibrationRun: { status: 'idle' as const, progress: 0, logs: [] as string[] },
    submissions: [],
    judgementsByPaperId: {},
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            ...initialState,
            actions: {
                setDemoMode: (v) => set({ demoMode: v }),
                resetAll: () => set({ ...initialState }),

                setStep: (step) => set({ currentStep: step }),
                nextStep: () => set({ currentStep: (Math.min(5, get().currentStep + 1) as any) }),
                prevStep: () => set({ currentStep: (Math.max(1, get().currentStep - 1) as any) }),

                setQuestionText: (text) => set({ task: { ...get().task, questionText: text } }),
                setRubricText: (text) => set({ task: { ...get().task, rubricText: text } }),

                setCriteria: (criteria) => set({ task: { ...get().task, criteria }, }),
                updateCriterionText: (id, text) => {
                    const t = get().task;
                    set({ task: { ...t, criteria: t.criteria.map(c => c.id === id ? { ...c, text } : c) } });
                },
                toggleCriterionEnabled: (id) => {
                    const t = get().task;
                    set({ task: { ...t, criteria: t.criteria.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c) } });
                },
                lockCriteria: (versionId) => {
                    const t = get().task;
                    set({ task: { ...t, criteriaLocked: true, criteriaVersionId: versionId, status: 'criteria_locked' } });
                },

                setCalibrationSamples: (samples) => set({ calibrationSamples: samples, task: { ...get().task, status: 'calibration_uploaded' } }),
                updateSample: (paperId, patch) => set({
                    calibrationSamples: get().calibrationSamples.map(s => s.paperId === paperId ? { ...s, ...patch } : s)
                }),

                setCalibrationRun: (patch) => set({ calibrationRun: { ...get().calibrationRun, ...patch } }),
                setModelVersion: (v) => set({ task: { ...get().task, modelVersion: v, status: 'calibrated' } }),

                setSubmissions: (subs) => set({ submissions: subs, task: { ...get().task, status: 'submissions_uploaded' } }),
                updateSubmission: (paperId, patch) => set({ submissions: get().submissions.map(s => s.paperId === paperId ? { ...s, ...patch } : s) }),

                setJudgement: (paperId, judgement) => set({ judgementsByPaperId: { ...get().judgementsByPaperId, [paperId]: judgement } }),

                saveReview: (paperId, scoreFinal, reason) => {
                    const now = Date.now();
                    // update submissions list
                    get().actions.updateSubmission(paperId, { scoreFinal });

                    // update judgement record
                    const j = get().judgementsByPaperId[paperId];
                    if (j) {
                        get().actions.setJudgement(paperId, {
                            ...j,
                            review: { overridden: true, reason, reviewer: 'Reviewer-1', updatedAt: now },
                        });
                    }
                },
            },
        }),
        {
            name: 'llm-grading-demo-store-v02',
            partialize: (state) => {
                const { actions, ...rest } = state;
                return rest;
            }
        }
    )
);
