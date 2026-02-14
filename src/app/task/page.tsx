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

    const handleNext = async () => {
        setWizardLoading(true);
        // Simulate slight delay for effect
        await new Promise(r => setTimeout(r, 300));
        setWizardLoading(false);

        if (currentStep === 5 && calibrationRun.status === 'done') {
            router.push('/grading');
            return;
        }

        nextStep();
    };

    // --- Demo Actions ---

    const handleDemoStep1 = () => mockApi.demoFillQuestion();
    const handleDemoStep2 = () => mockApi.demoFillRubric();

    const handleGenerateCriteria = async () => {
        setGeneratingCriteria(true);
        await mockApi.generateCriteria(task.questionText, task.rubricText);
        setGeneratingCriteria(false);
    };

    const handleDemoStep3 = async () => {
        // 1. Generate if empty
        if (task.criteria.length === 0) {
            await handleGenerateCriteria();
        }
        // 2. Lock
        const versionId = await mockApi.lockCriteria();
        // 3. Next
        // nextStep();
    };

    const handleDemoStep4 = async () => {
        await mockApi.demoGenerateSamples100();
        // nextStep();
    };

    const handleDemoStep5 = async () => {
        mockApi.demoCalibrationDone();
        // auto nav to grading? Or let user click "Enter Grading"
        // Requirement says: "metrics + modelVersion=v1.0 -> 可进入 /grading"
    };

    const handleStartCalibration = async () => {
        await mockApi.runCalibration();
    };

    // --- Render Steps ---

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">单题任务配置</h1>
                <p className="text-gray-500">配置题目、标准并完成模型校准</p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
                {[1, 2, 3, 4, 5].map(step => (
                    <div key={step}
                        className={`flex items-center gap-2 cursor-pointer ${step <= currentStep ? 'text-primary' : 'text-gray-300'}`}
                        onClick={() => step < currentStep && setStep(step as any)}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step === currentStep ? 'border-primary bg-primary text-white' :
                            step < currentStep ? 'border-primary bg-green-50 text-primary' :
                                'border-gray-200 bg-white text-gray-400'
                            }`}>
                            {step}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">
                            {step === 1 && '题目'}
                            {step === 2 && '标准'}
                            {step === 3 && '判定'}
                            {step === 4 && '样卷'}
                            {step === 5 && '校准'}
                        </span>
                        {step < 5 && <div className="w-8 h-0.5 bg-gray-200 mx-2" />}
                    </div>
                ))}
            </div>

            {currentStep === 1 && (
                <StepPanel
                    title="Step 1: 输入题目"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep1}
                >
                    <QuestionStep
                        value={task.questionText}
                        onChange={setQuestionText}
                    />
                </StepPanel>
            )}

            {currentStep === 2 && (
                <StepPanel
                    title="Step 2: 输入评分细则"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep2}
                >
                    <RubricStep
                        value={task.rubricText}
                        onChange={setRubricText}
                    />
                </StepPanel>
            )}

            {currentStep === 3 && (
                <StepPanel
                    title="Step 3: 生成并锁定判定标准"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep3}
                    demoDisabled={task.criteriaLocked}
                >
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
                </StepPanel>
            )}

            {currentStep === 4 && (
                <StepPanel
                    title="Step 4: 准备样卷 (100份)"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep4}
                    demoDisabled={calibrationSamples.length > 0}
                >
                    <SamplesStep
                        samples={calibrationSamples}
                        target={100}
                    />
                </StepPanel>
            )}

            {currentStep === 5 && (
                <StepPanel
                    title="Step 5: 模型校准"
                    demoMode={demoMode}
                    onDemoClick={handleDemoStep5}
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
                currentStep={currentStep}
                totalSteps={5}
                onPrev={prevStep}
                onNext={handleNext}
                loading={wizardLoading}
                nextDisabled={
                    (currentStep === 1 && !task.questionText) ||
                    (currentStep === 2 && !task.rubricText) ||
                    (currentStep === 3 && !task.criteriaLocked) ||
                    (currentStep === 4 && calibrationSamples.length === 0)
                }
                nextLabel={currentStep === 5 ? (calibrationRun.status === 'done' ? '进入批量阅卷' : '等待校准完成') : undefined}
            />
        </div>
    );
}
