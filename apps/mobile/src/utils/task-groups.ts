import {taskStatusPresentation} from './coordination';
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
  if(!['OPEN','HAS_OFFERS','AWAITING_CONFIRMATION','COMPLETION_PENDING','ARRANGED','IN_PROGRESS'].includes(task.status))return undefined;
  const value=taskStatusPresentation({status:task.status,scheduleChanged:task.requiresHelperReconfirmation});
  if(task.status==='OPEN' && task.urgency==='URGENT')return 'Urgent · '+value.title;
  return value.title+(task.status==='HAS_OFFERS'?' · '+value.nextActionLabel:'');
}
