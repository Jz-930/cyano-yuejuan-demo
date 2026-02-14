import type { Criterion, CalibrationSample, Submission, PaperJudgement, CriterionResult, CriterionCategory } from './types';
import { DEMO_SEED, DEMO_MODEL_VERSION, DEMO_CALIBRATION_METRICS } from './seed';

// ---- seeded random helpers ----
function xmur3(str: string) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededRand(key: string) {
    const seedFn = xmur3(key);
    return mulberry32(seedFn());
}

function pad(n: number, len = 3) {
    return String(n).padStart(len, '0');
}

export function genCriteriaFixed(): Criterion[] {
    // Fixed 80 items: Ratio 20/15/15/15/10/5
    const plan: Array<[CriterionCategory, number]> = [
        ['立意', 20],
        ['结构', 15],
        ['语言', 15],
        ['扣分项', 15],
        ['文体', 10],
        ['其他', 5],
    ];

    const templates: Record<CriterionCategory, string[]> = {
        '立意': [
            '是否准确理解题意并提出明确论点？',
            '是否围绕“老方法/新地方/新方法/老地方”建立清晰阐释？',
            '是否体现“老方法在新地方仍有效”的含义？',
            '是否体现“新方法解决老问题”的含义？',
            '是否避免故步自封/不思进取的消极立意？',
        ],
        '结构': [
            '是否在题目或首段明确提出中心观点？',
            '是否层次清晰、论证推进自然？',
            '是否有分论点或逻辑递进？',
            '是否首尾呼应或总结升华？',
            '是否存在明显跑题段落影响整体结构？',
        ],
        '语言': [
            '语言是否通顺、表达是否准确？',
            '是否存在大量病句影响理解？',
            '是否用词得当，避免空洞套话堆砌？',
            '是否举例/论据表达清楚？',
            '是否存在过度辞藻堆砌导致观点不清？',
        ],
        '扣分项': [
            '是否缺少标题（若缺少应扣分）？',
            '篇幅是否不足 400 字（若不足应降分）？',
            '是否少于要求字数 150 字以上（若是应扣分）？',
            '是否存在严重偏离题意导致低档？',
            '是否存在“有字不能给 0 分”的最低分规则触发？',
        ],
        '文体': [
            '是否为议论文体裁？',
            '是否包含论点、论据、论证要素？',
            '是否避免写成记叙文/散文导致文体不符？',
            '是否有明确的论证结构而非流水叙述？',
            '是否出现文体混杂影响判定？',
        ],
        '其他': [
            '是否联系实际且联系得当？',
            '是否观点前后一致，不自相矛盾？',
            '是否有一定发展与上升（可冲一等）？',
            '是否存在明显事实/常识错误影响可信度？',
            '是否整体可读性良好（无严重混乱）？',
        ],
    };

    const out: Criterion[] = [];
    let idx = 1;
    for (const [cat, count] of plan) {
        for (let i = 0; i < count; i++) {
            const t = templates[cat][i % templates[cat].length];
            out.push({
                id: `CRIT-${pad(idx, 3)}`,
                enabled: true,
                category: cat,
                text: t.replace('？', `？（${cat}-${i + 1}）`),
            });
            idx++;
        }
    }
    // Ensure total 80
    return out.slice(0, 80);
}

export function genSamples100(): CalibrationSample[] {
    const r = seededRand(`${DEMO_SEED}-samples`);
    const graders = ['张三', '李四', '王五', '赵六'];
    const now = Date.now();
    const out: CalibrationSample[] = [];
    for (let i = 1; i <= 100; i++) {
        // Score distribution: 8..38, skewed mid-high
        const base = 18 + Math.floor(r() * 18); // 18..35
        const jitter = Math.floor(r() * 6) - 3; // -3..+2
        const score = Math.min(38, Math.max(8, base + jitter));

        const ts = now - Math.floor(r() * 7 * 24 * 3600 * 1000); // Last 7 days
        out.push({
            paperId: `CAL-${pad(i, 3)}`,
            scoreHuman: score,
            grader: graders[i % graders.length],
            timestamp: ts,
            previewUrl: `/demo/previews/cal_${pad(i, 3)}.png`, // Placeholder OK
            status: 'ok',
        });
    }
    return out;
}

function scoreToBand(score: number): '一等' | '二等' | '三等' | '四等' {
    if (score >= 36) return '一等';
    if (score >= 26) return '二等';
    if (score >= 16) return '三等';
    return '四等';
}

export function genSubmissions(count = 80): Submission[] {
    const out: Submission[] = [];
    for (let i = 1; i <= count; i++) {
        out.push({
            paperId: `SUB-${pad(i, 4)}`,
            previewUrl: `/demo/previews/sub_${pad(i, 4)}.png`,
            status: 'pending',
        });
    }
    return out;
}

export function applyGradingResults(sub: Submission): Submission {
    const r = seededRand(`${DEMO_SEED}-grade-${sub.paperId}`);
    const score = Math.min(40, Math.max(0, Math.round(10 + r() * 28))); // 10..38
    const risk: string[] = [];

    // Fixed paperId mapping for stability
    const lowConf = new Set(['SUB-0008', 'SUB-0021', 'SUB-0033', 'SUB-0055']);
    const offTopic = new Set(['SUB-0012', 'SUB-0044']);
    const shortLen = new Set(['SUB-0019', 'SUB-0020', 'SUB-0061']);
    const noTitle = new Set(['SUB-0070']);
    const wrongStyle = new Set(['SUB-0039']);

    if (lowConf.has(sub.paperId)) risk.push('低置信度');
    if (offTopic.has(sub.paperId)) risk.push('疑似跑题');
    if (shortLen.has(sub.paperId)) risk.push('字数不足');
    if (noTitle.has(sub.paperId)) risk.push('无标题');
    if (wrongStyle.has(sub.paperId)) risk.push('文体不符');

    return {
        ...sub,
        status: 'done',
        scoreModel: score,
        band: scoreToBand(score),
        riskFlags: risk,
    };
}

export function isFixedFailedPaperId(paperId: string) {
    // Fixed two failure cases for retry demo
    return paperId === 'SUB-0017' || paperId === 'SUB-0064';
}

export function genPaperJudgement(paperId: string, criteria: Criterion[]): PaperJudgement {
    const r = seededRand(`${DEMO_SEED}-judge-${paperId}`);
    const evidencePool = [
        '文章首段提出“传统经验在新问题中仍能发挥作用”的观点。',
        '作者通过对比“老方法/新方法”说明方法需随问题情境调整。',
        '论证过程中举例联系现实，但部分表述略显空泛。',
        '结尾有总结与升华，强调避免故步自封。',
        '行文中存在部分套话，影响观点清晰度。',
    ];

    const enabledCriteria = criteria.filter(c => c.enabled);
    const results: CriterionResult[] = enabledCriteria.map((c) => {
        const rr = seededRand(`${DEMO_SEED}-judge-${paperId}-${c.id}`);
        const yes = rr() > 0.45;
        const conf = 0.55 + rr() * 0.43; // 0.55..0.98
        const ev = evidencePool[Math.floor(rr() * evidencePool.length)];
        return {
            criterionId: c.id,
            result: yes ? '是' : '否',
            confidence: Number(conf.toFixed(2)),
            evidence: ev,
        };
    });

    // top factors: first 5 enabled criteria text
    const top = enabledCriteria.slice(0, 5).map(c => c.text);

    return {
        paperId,
        criteriaResults: results,
        scoreExplain: {
            topFactors: top,
            summary: '综合判定结果与证据摘录，系统给出模型分数与分档建议。若存在低置信度或风险标记，建议人工复核。',
        },
    };
}

export const DEMO_METRICS = { ...DEMO_CALIBRATION_METRICS, modelVersion: DEMO_MODEL_VERSION };
