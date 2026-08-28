export type CategoryType = 'work' | 'life';
export type QuadrantType =
  | 'urgent-important'
  | 'important-not-urgent'
  | 'urgent-not-important'
  | 'not-urgent-not-important';

export interface ICalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: CategoryType;
  quadrant: QuadrantType;
  note: string;
  source: 'mock' | 'user' | 'api';
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  isCountdown: boolean;
}

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  work: '工作',
  life: '生活',
};

export const QUADRANT_LABELS: Record<QuadrantType, string> = {
  'urgent-important': '重要且紧急',
  'important-not-urgent': '重要不紧急',
  'urgent-not-important': '紧急不重要',
  'not-urgent-not-important': '不紧急不重要',
};

function todayAt(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function daysFromTodayAt(days: number, h: number, m: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const MOCK_EVENTS: ICalendarEvent[] = [
  {
    id: 'mock-1',
    title: '项目里程碑评审',
    startTime: todayAt(10, 0),
    endTime: todayAt(11, 30),
    category: 'work',
    quadrant: 'urgent-important',
    note: '准备 Q3 项目进度汇报材料，与产品、设计、研发三方对齐里程碑节点。',
    source: 'mock',
    createdAt: daysFromTodayAt(-3, 9, 0),
    updatedAt: daysFromTodayAt(-1, 14, 0),
    isCompleted: false,
    completedAt: null,
    isCountdown: true,
  },
  {
    id: 'mock-2',
    title: '健身训练计划',
    startTime: daysFromTodayAt(1, 19, 0),
    endTime: daysFromTodayAt(1, 20, 30),
    category: 'life',
    quadrant: 'important-not-urgent',
    note: '本周重点：核心力量训练，平板支撑 + 仰卧起坐 + 侧平板。',
    source: 'mock',
    createdAt: daysFromTodayAt(-2, 20, 0),
    updatedAt: daysFromTodayAt(-2, 20, 0),
    isCompleted: false,
    completedAt: null,
    isCountdown: false,
  },
  {
    id: 'mock-3',
    title: '回复客户邮件',
    startTime: todayAt(14, 0),
    endTime: todayAt(14, 30),
    category: 'work',
    quadrant: 'urgent-not-important',
    note: '客户询问报价细节，尽快回复确认即可。',
    source: 'mock',
    createdAt: todayAt(9, 0),
    updatedAt: todayAt(9, 0),
    isCompleted: true,
    completedAt: todayAt(15, 0),
    isCountdown: false,
  },
  {
    id: 'mock-4',
    title: '阅读《深度工作》',
    startTime: daysFromTodayAt(2, 21, 0),
    endTime: daysFromTodayAt(2, 22, 0),
    category: 'life',
    quadrant: 'not-urgent-not-important',
    note: '第 3 章：远离社交媒体，培养深度工作的能力。',
    source: 'mock',
    createdAt: daysFromTodayAt(-5, 10, 0),
    updatedAt: daysFromTodayAt(-5, 10, 0),
    isCompleted: false,
    completedAt: null,
    isCountdown: false,
  },
  {
    id: 'mock-5',
    title: '季度总结报告',
    startTime: daysFromTodayAt(3, 9, 0),
    endTime: daysFromTodayAt(3, 12, 0),
    category: 'work',
    quadrant: 'important-not-urgent',
    note: '整理本季度工作成果、关键数据、下季度计划，提交给主管。',
    source: 'mock',
    createdAt: daysFromTodayAt(-7, 10, 0),
    updatedAt: daysFromTodayAt(-1, 16, 0),
    isCompleted: false,
    completedAt: null,
    isCountdown: true,
  },
  {
    id: 'mock-6',
    title: '朋友生日聚会',
    startTime: daysFromTodayAt(5, 18, 0),
    endTime: daysFromTodayAt(5, 21, 0),
    category: 'life',
    quadrant: 'urgent-important',
    note: '记得提前准备礼物，地点在三里屯餐厅。',
    source: 'mock',
    createdAt: daysFromTodayAt(-10, 12, 0),
    updatedAt: daysFromTodayAt(-4, 20, 0),
    isCompleted: false,
    completedAt: null,
    isCountdown: true,
  },
];
