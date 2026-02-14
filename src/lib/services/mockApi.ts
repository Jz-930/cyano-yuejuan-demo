import { useAppStore } from '../store/useAppStore';
import {
    genCriteriaFixed,
    genSamples100,
    genSubmissions,
    applyGradingResults,
    isFixedFailedPaperId,
    genPaperJudgement,
    DEMO_METRICS,
} from '../demo/generators';
import { DEMO_QUESTION_TEXT, DEMO_RUBRIC_TEXT, DEMO_CALIBRATION_LOGS, DEMO_MODEL_VERSION } from '../demo/seed';

// Helpers to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
    // --- Step 1 & 2 ---
    async demoFillQuestion() {
        const { setQuestionText } = useAppStore.getState().actions;
        setQuestionText(DEMO_QUESTION_TEXT);
    },

    async demoFillRubric() {
        const { setRubricText } = useAppStore.getState().actions;
        setRubricText(DEMO_RUBRIC_TEXT);
    },

    // --- Step 3: Criteria ---
    async generateCriteria(question: string, rubric: string) {
        if (!question || !rubric) return;
        await delay(2000); // Simulate LLM generation
        const criteria = genCriteriaFixed();
        useAppStore.getState().actions.setCriteria(criteria);
    },

    async lockCriteria() {
        await delay(500);
        const versionId = `VER-${Date.now().toString().slice(-6)}`;
        useAppStore.getState().actions.lockCriteria(versionId);
        return versionId;
    },

    // --- Step 4: Samples ---
    async demoGenerateSamples100() {
        await delay(800);
        const samples = genSamples100();
        useAppStore.getState().actions.setCalibrationSamples(samples);
    },

    // --- Step 5: Calibration ---
    async runCalibration() {
        const { setCalibrationRun, setModelVersion } = useAppStore.getState().actions;

        setCalibrationRun({ status: 'running', progress: 0, logs: [] });

        // Simulate progress logs
        for (let i = 0; i < DEMO_CALIBRATION_LOGS.length; i++) {
            await delay(800); // 4-5s total
            const progress = Math.round(((i + 1) / DEMO_CALIBRATION_LOGS.length) * 100);
            setCalibrationRun({
                progress,
                logs: DEMO_CALIBRATION_LOGS.slice(0, i + 1),
            });
        }

        await delay(500);
        setCalibrationRun({
            status: 'done',
            metrics: DEMO_METRICS,
        });
        setModelVersion(DEMO_MODEL_VERSION);
    },

    demoCalibrationDone() {
        const { setCalibrationRun, setModelVersion } = useAppStore.getState().actions;
        setCalibrationRun({
            status: 'done',
            progress: 100,
            logs: DEMO_CALIBRATION_LOGS,
            metrics: DEMO_METRICS,
        });
        setModelVersion(DEMO_MODEL_VERSION);
    },


    // --- Grading ---
    async demoGenerateSubmissions(count = 80) {
        await delay(500);
        const subs = genSubmissions(count);
        useAppStore.getState().actions.setSubmissions(subs);
    },

    async runGrading() {
        const store = useAppStore.getState();
        const subs = store.submissions;
        if (subs.length === 0) return;

        // Mark all running
        // In a real app we might batch update. Here we simulate gradual completion.
        const runningState = subs.map(s => ({ ...s, status: 'running' as const }));
        store.actions.setSubmissions(runningState);

        // Process in chunks to simulate progress
        const chunkSize = 10;
        for (let i = 0; i < runningState.length; i += chunkSize) {
            await delay(800);
            const chunk = runningState.slice(i, i + chunkSize);
            const processed = chunk.map(sub => {
                if (isFixedFailedPaperId(sub.paperId)) {
                    return { ...sub, status: 'failed' as const };
                }
                return applyGradingResults(sub);
            });

            // Update store with processed chunk
            // We need to merge back into the MAIN list, because user might have interacted
            const currentSubs = useAppStore.getState().submissions;
            const map = new Map(currentSubs.map(s => [s.paperId, s]));
            processed.forEach(p => map.set(p.paperId, p));
            useAppStore.getState().actions.setSubmissions(Array.from(map.values()));
        }
    },

    demoGradingDone() {
        const subs = genSubmissions(80);
        const processed = subs.map(sub => {
            if (isFixedFailedPaperId(sub.paperId)) {
                return { ...sub, status: 'failed' as const };
            }
            return applyGradingResults(sub);
        });
        useAppStore.getState().actions.setSubmissions(processed);
    },

    async retryFailedSubmissions() {
        const store = useAppStore.getState();
        const failed = store.submissions.filter(s => s.status === 'failed');
        if (failed.length === 0) return;

        // Set to running
        const withRunning = store.submissions.map(s => s.status === 'failed' ? { ...s, status: 'running' as const } : s);
        store.actions.setSubmissions(withRunning);

        await delay(1500);

        // Set to done (success)
        const withDone = withRunning.map(s => {
            if (s.status === 'running') { // these were the failed ones
                return applyGradingResults(s);
            }
            return s;
        });
        store.actions.setSubmissions(withDone);
    },

    // --- Paper Judgement ---
    async getOrGeneratePaperJudgement(paperId: string) {
        const store = useAppStore.getState();
        if (store.judgementsByPaperId[paperId]) return;

        await delay(500);
        const criteria = store.task.criteria;
        // if criteria is empty (direct access to paper page?), gen defaults
        const effectiveCriteria = criteria.length > 0 ? criteria : genCriteriaFixed();

        const judgment = genPaperJudgement(paperId, effectiveCriteria);
        store.actions.setJudgement(paperId, judgment);
    },

    demoReviewAdjustAndSave(paperId: string) {
        const store = useAppStore.getState();
        const sub = store.submissions.find(s => s.paperId === paperId);
        if (!sub || !sub.scoreModel) return;

        const newScore = Math.min(40, sub.scoreModel + 2); // Demo: ensure a change
        const explain = "Demo: Manual adjustment for testing.";

        // Ensure local judgement exists
        if (!store.judgementsByPaperId[paperId]) {
            const criteria = store.task.criteria.length > 0 ? store.task.criteria : genCriteriaFixed();
            const judgment = genPaperJudgement(paperId, criteria);
            store.actions.setJudgement(paperId, judgment);
        }

        store.actions.saveReview(paperId, newScore, explain);
    }
};
