interface RubricStepProps {
    value: string;
    onChange: (v: string) => void;
    error?: string;
}

export function RubricStep({ value, onChange, error }: RubricStepProps) {
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="rubric" className="block text-sm font-medium text-gray-700 mb-1">
                    参考答案与评分细则
                </label>
                <textarea
                    id="rubric"
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm resize-y font-mono text-sm"
                    placeholder="输入参考答案、分档描述、扣分规则等..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 p-3 rounded text-xs text-gray-500">
                    推荐包含：
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>立意方向解析</li>
                        <li>分档给分标准（一等/二等...）</li>
                        <li>特殊扣分项（字数、标题等）</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
