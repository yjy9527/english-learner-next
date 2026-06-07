/**
 * SM-2 间隔复习算法
 * 从旧项目 Python 版本搬运到 TypeScript，逻辑完全一致
 */

export interface SRSState {
  easeFactor: number;    // 难度系数，初始 2.5，范围 1.3～2.5
  intervalDays: number;  // 当前间隔（天）
  repetitions: number;   // 连续正确次数
}

export interface SRSResult {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: Date;
}

/**
 * 根据评分计算下一次复习时间
 * @param state 当前 SRS 状态
 * @param rating 评分：0=完全忘了, 3=勉强想起, 4=正确但有犹豫, 5=完美回忆
 */
export function calculateSRS(state: SRSState, rating: number): SRSResult {
  let { easeFactor, intervalDays, repetitions } = state;

  if (rating === 0) {
    // 完全忘了 → 重置
    repetitions = 0;
    intervalDays = 1;
  } else if (rating === 3) {
    // 勉强想起 → 间隔不变，EF 降低
    repetitions = 0;
    intervalDays = Math.max(1, Math.round(intervalDays * 0.8));
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 4) {
    // 正确但有犹豫 → 间隔按 EF 增长，EF 不变
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
  } else if (rating === 5) {
    // 完美回忆 → 间隔按 EF 增长，EF 微升
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    easeFactor = Math.min(2.5, easeFactor + 0.1);
  }

  // 计算下次复习日期
  const next = new Date();
  next.setDate(next.getDate() + intervalDays);
  next.setHours(0, 0, 0, 0);

  return {
    easeFactor: Math.max(1.3, Math.min(2.5, easeFactor)),
    intervalDays,
    repetitions,
    nextReviewAt: next,
  };
}

/**
 * 创建初始 SRS 状态（首次复习）
 */
export function initialSRS(): SRSState {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
}
