export type FilterState = {
    status: 'all' | 'pending' | 'running' | 'done' | 'failed';
    risk: 'all' | '低置信度' | '疑似跑题' | '字数不足' | '无标题' | '文体不符';
    scoreBand: 'all' | '0-15' | '16-25' | '26-35' | '36-40';
};

interface FiltersBarProps {
    value: FilterState;
    onChange: (patch: Partial<FilterState>) => void;
}

export function FiltersBar({ value, onChange }: FiltersBarProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">状态:</span>
                <select
                    className="text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={value.status}
                    onChange={(e) => onChange({ status: e.target.value as any })}
                >
                    <option value="all">全部</option>
                    <option value="pending">待阅卷</option>
                    <option value="running">阅卷中</option>
                    <option value="done">已完成</option>
                    <option value="failed">失败</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">风险标记:</span>
                <select
                    className="text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={value.risk}
                    onChange={(e) => onChange({ risk: e.target.value as any })}
                >
                    <option value="all">全部</option>
                    <option value="低置信度">低置信度</option>
                    <option value="疑似跑题">疑似跑题</option>
                    <option value="字数不足">字数不足</option>
                    <option value="无标题">无标题</option>
                    <option value="文体不符">文体不符</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">分数段:</span>
                <select
                    className="text-sm border-gray-300 rounded focus:ring-primary focus:border-primary"
                    value={value.scoreBand}
                    onChange={(e) => onChange({ scoreBand: e.target.value as any })}
                >
                    <option value="all">全部</option>
                    <option value="36-40">一等 (36-40)</option>
                    <option value="26-35">二等 (26-35)</option>
                    <option value="16-25">三等 (16-25)</option>
                    <option value="0-15">四等 (0-15)</option>
                </select>
            </div>
        </div>
    );
}
