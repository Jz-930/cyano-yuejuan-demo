'use client';


import { useAppStore } from '@/lib/store/useAppStore';
import { mockApi } from '@/lib/services/mockApi';
import { StepPanel } from '@/components/task/StepPanel';
import { WizardFooter } from '@/components/task/WizardFooter';
import { QuestionStep } from '@/components/task/QuestionStep';
import { RubricStep } from '@/components/task/RubricStep';
import { CriteriaStep } from '@/components/task/CriteriaStep';
import { SamplesStep } from '@/components/task/SamplesStep';
import { CalibrationStep } from '@/components/task/CalibrationStep';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';


export default function TaskWizardPage() {
    const router = useRouter();
    const store = useAppStore();
    const {
        currentStep,
        task,
        calibrationSamples,
        calibrationRun,
        demoMode
    } = store;

    const {
        setStep, nextStep, prevStep,
        setQuestionText, setRubricText,
        setCriteria, updateCriterionText, toggleCriterionEnabled, lockCriteria,
        setCalibrationSamples, updateSample,
        setCalibrationRun, setModelVersion
    } = store.actions;

    const [wizardLoading, setWizardLoading] = useState(false);
    const [generatingCriteria, setGeneratingCriteria] = useState(false);

    // --- Step Logic ---
    // Mapping:
    // UI Step 1 (Setup) = Store Steps 1, 2, 3 (conceptually merged)
    // UI Step 2 (Samples) = Store Step 4
    // UI Step 3 (Calibration) = Store Step 5

    // Helper to map store step to UI step index (1-based)
    const getUiStep = (storeStep: number) => {
        if (storeStep <= 3) return 1;
        if (storeStep === 4) return 2;
        return 3;
    };

    const uiStep = getUiStep(currentStep);

    const handleNext = async () => {
        setWizardLoading(true);
        // Simulate slight delay for effect
        await new Promise(r => setTimeout(r, 300));
        setWizardLoading(false);

        if (uiStep === 3 && calibrationRun.status === 'done') {
            router.push('/grading');
            return;
        }

        // Logic to advance store step based on current UI phase
        if (uiStep === 1) {
            // Move from "Setup" (Store 1/2/3) to "Samples" (Store 4)
            // We assume if they click Next, they are done with 1, 2, and 3.
            // But store.nextStep() increments by 1. So we might need to jump.
            // To be safe, let's just use setStep(4).
            setStep(4);
        } else if (uiStep === 2) {
            // Move from "Samples" (Store 4) to "Calibration" (Store 5)
            setStep(5);
        }
    };

    const handlePrev = () => {
        if (uiStep === 2) {
            setStep(1); // Go back to Setup
        } else if (uiStep === 3) {
            setStep(4); // Go back to Samples
        }
    };


    // --- Demo Actions ---

    // Consolidated demo for Step 1
    const handleDemoStep1 = async () => {
        // 1. Fill Question
        if (!task.questionText) mockApi.demoFillQuestion();
        // 2. Fill Rubric
        if (!task.rubricText) mockApi.demoFillRubric();

        // 3. Generate Criteria (if needed)
        if (task.criteria.length === 0) {
            setGeneratingCriteria(true);
            // We need to wait for state updates if we just filled them, but mockApi updates store directly usually? 
            // Actually mockApi actions usually are synchronous state updates in this demo store, except async API calls.
            // We might need a small delay or check.
            // For safety in this demo, let's just trigger generation with the specific hardcoded text if it's missing from state yet.
            await mockApi.generateCriteria(
                task.questionText || "请简述“光合作用”的主要过程及其意义。",
                task.rubricText || "1. 准确描述光反应阶段（2分）\n2. 准确描述暗反应阶段（2分）\n3. 说明光合作用的生态意义（1分）"
            );
            setGeneratingCriteria(false);
        }

        // 4. Lock
        await mockApi.lockCriteria();
    };

    const handleDemoStep2 = async () => {
        await mockApi.demoGenerateSamples100();
    };

    const handleDemoStep3 = async () => {
        mockApi.demoCalibrationDone();
    };

    const handleGenerateCriteria = async () => {
        setGeneratingCriteria(true);
        await mockApi.generateCriteria(task.questionText, task.rubricText);
        setGeneratingCriteria(false);
    };

    const handleStartCalibration = async () => {
        await mockApi.runCalibration();
    };

    // --- Render ---

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">任务配置</h1>
                <p className="text-gray-500">配置题目、标准并完成模型校准</p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mb-8 px-4 max-w-3xl mx-auto">
                {[1, 2, 3].map(step => (
                    <div key={step}
                        className={`flex items-center gap-2 cursor-pointer ${step <= uiStep ? 'text-primary' : 'text-gray-300'}`}
                        onClick={() => {
                            if (step < uiStep) {
                                if (step === 1) setStep(1);
                                if (step === 2) setStep(4);
                            }
                        }}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step === uiStep ? 'border-primary bg-primary text-white' :
                            step < uiStep ? 'border-primary bg-green-50 text-primary' :
                                'border-gray-200 bg-white text-gray-400'
                            }`}>
                            {step}
                        </div>
                        <span className="text-sm font-medium">
                            {step === 1 && '任务配置 (题目/标准/判定)'}
                            {step === 2 && '样卷准备'}
                            {step === 3 && '模型校准'}
                        </span>
                        {step < 3 && <div className="w-16 h-0.5 bg-gray-200 mx-2" />}
                    </div>
                ))}
            </div>

            {/* Unified Step 1: Setup */}
            {uiStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Step 1: 任务配置</h2>
                                <p className="text-sm text-gray-500 mt-1">输入题目信息、评分标准并生成判定点</p>
                            </div>
                            {demoMode && (
                                <button
                                    onClick={handleDemoStep1}
                                    disabled={task.criteriaLocked}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    <Zap className="w-4 h-4" />
                                    演示：一键完成配置
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Question Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</div>
                                    <h3 className="text-md font-medium text-gray-800">题目内容</h3>
                                </div>
                                <QuestionStep
                                    value={task.questionText}
                                    onChange={setQuestionText}
                                />
                            </section>

                            <hr className="border-gray-100" />

                            {/* Rubric Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</div>
                                    <h3 className="text-md font-medium text-gray-800">评分标准</h3>
                                </div>
                                <RubricStep
                                    value={task.rubricText}
                                    onChange={setRubricText}
                                />
                            </section>

                            <hr className="border-gray-100" />

                            {/* Criteria Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</div>
                                    <h3 className="text-md font-medium text-gray-800">判定点</h3>
                                </div>
                                <CriteriaStep
                                    questionText={task.questionText}
                                    rubricText={task.rubricText}
                                    criteria={task.criteria}
                                    locked={task.criteriaLocked}
                                    generating={generatingCriteria}
                                    onGenerate={handleGenerateCriteria}
                                    onToggleEnabled={toggleCriterionEnabled}
                                    onUpdateText={updateCriterionText}
                                    onLock={() => mockApi.lockCriteria()}
                                />
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Samples */}
            {uiStep === 2 && (
                <StepPanel
                    title="Step 2: 准备样卷 (100份)"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep2}
                    demoDisabled={calibrationSamples.length > 0}
                >
                    <SamplesStep
                        samples={calibrationSamples}
                        target={100}
                    />
                </StepPanel>
            )}

            {/* Step 3: Calibration */}
            {uiStep === 3 && (
                <StepPanel
                    title="Step 3: 模型校准"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep3}
                    demoDisabled={calibrationRun.status === 'done'}
                >
                    <CalibrationStep
                        run={calibrationRun}
                        locked={task.criteriaLocked}
                        hasSamples={calibrationSamples.length > 0}
                        onStart={handleStartCalibration}
                        onGoGrading={() => router.push('/grading')}
                    />
                </StepPanel>
            )}

            <WizardFooter
                currentStep={uiStep}
                totalSteps={3}
                onPrev={handlePrev}
                onNext={handleNext}
                loading={wizardLoading}
                nextDisabled={
                    (uiStep === 1 && !task.criteriaLocked) ||
                    (uiStep === 2 && calibrationSamples.length === 0)
                }
                nextLabel={uiStep === 3 ? (calibrationRun.status === 'done' ? '进入批量阅卷' : '等待校准完成') : undefined}
            />
        </div>
    );
}


