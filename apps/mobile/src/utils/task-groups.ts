import type { TaskSummaryDto, TaskStatus } from '@team517/contracts';
import { scheduledTime } from './presentation';
export type TaskListFilter = 'current' | 'drafts' | 'history';
const sections: { title: string; statuses: TaskStatus[] }[] = [
  { title: 'Needs completion review', statuses: ['COMPLETION_PENDING'] },
  { title: 'Needs your choice', statuses: ['HAS_OFFERS'] },
  { title: 'Needs help', statuses: ['OPEN'] },
  { title: 'Awaiting confirmation', statuses: ['AWAITING_CONFIRMATION'] },
  { title: 'In progress', statuses: ['IN_PROGRESS'] },
  { title: 'Arranged', statuses: ['ARRANGED'] },
  { title: 'Drafts', statuses: ['DRAFT'] },
  { title: 'Completed', statuses: ['COMPLETED'] },
  { title: 'Issues reported', statuses: ['DISPUTED'] },
  { title: 'Cancelled', statuses: ['CANCELLED'] },
];
export function groupTasks(tasks: TaskSummaryDto[], filter: TaskListFilter) {
  const history: TaskStatus[] = ['COMPLETED', 'CANCELLED', 'DISPUTED'];
  const included = tasks.filter(task => filter === 'drafts' ? task.status === 'DRAFT' : filter === 'history' ? history.includes(task.status) : task.status !== 'DRAFT' && !history.includes(task.status));
  return sections.map(section => ({ title: section.title, tasks: included.filter(task => section.statuses.includes(task.status)).sort((a, b) => scheduledTime(a.startAt) - scheduledTime(b.startAt) || a.id.localeCompare(b.id)) })).filter(section => section.tasks.length);
}
export function taskRowNote(task: TaskSummaryDto) {
  if (task.status === 'OPEN') return task.urgency === 'URGENT' ? 'Urgent · No helper yet' : 'Waiting for offers';
  if (task.status === 'HAS_OFFERS') return 'Offers received · Choose a helper';
  if (task.status === 'AWAITING_CONFIRMATION') return 'Waiting for helper confirmation';
  if (task.status === 'COMPLETION_PENDING') return 'Review completed help';
  return undefined;
}
