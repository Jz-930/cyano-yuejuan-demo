interface QuestionStepProps {
    value: string;
    onChange: (v: string) => void;
    error?: string;
}

export function QuestionStep({ value, onChange, error }: QuestionStepProps) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    作文题目文本
                </label>
                <textarea
                    id="question"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm resize-y"
                    placeholder="请输入或粘贴题目文本（例如：老方法在新地方...）"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                <h4 className="font-semibold mb-1">提示：</h4>
                <p>系统将基于题目文本自动生成判定维度。题目越清晰，生成越准确。</p>
            </div>
        </div>
    );
}
