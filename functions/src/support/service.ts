import type { CalendarDto, CalendarQuery, CalendarTaskDto, CreateReviewRequest, NotificationDto, ReviewDto, TaskTimelineDto, VerificationStatusDto } from '@team517/contracts';
import type { Notification, Review } from '../domain/support';
import { SupportRepository } from '../repositories/support';
import { MarketplaceRepository, offerId } from '../repositories/marketplace';
import { initialized, managesTask, timelineScope } from '../permissions/support';
import { ApiFailure } from '../shared/errors';
export const notificationDto = (n: Notification): NotificationDto => ({ id: n.id, type: n.type, resourceType: n.resourceType, resourceId: n.resourceId, title: n.title, body: n.body, readAt: n.readAt?.toDate().toISOString(), createdAt: n.createdAt.toDate().toISOString() });
export const reviewDto = (r: Review): ReviewDto => ({ id: r.id, rating: r.rating, comment: r.comment, reviewerLabel: 'Requester', createdAt: r.createdAt.toDate().toISOString() });
const labels: Record<string, string> = { OFFER_AVAILABILITY_UPDATED:'Helper updated availability', AVAILABILITY_RECONFIRMED:'Updated availability accepted', TASK_CREATED: 'Draft created', TASK_UPDATED: 'Draft updated', TASK_PUBLISHED: 'Task posted', TASK_CANCELLED: 'Task cancelled', OFFER_CREATED: 'Offer received', OFFER_WITHDRAWN: 'Offer withdrawn', HELPER_SELECTED: 'Helper selected', ASSIGNMENT_CONFIRMED: 'Assignment confirmed', ASSIGNMENT_DECLINED: 'Assignment declined', ASSIGNMENT_CANCELLED: 'Arrangement cancelled', TASK_STARTED: 'Task started', COMPLETION_REQUESTED: 'Completion requested', TASK_COMPLETED: 'Task completed', COMPLETION_DISPUTED: 'Completion disputed' };
export class SupportService {
  constructor(private repo = new SupportRepository(), private market = new MarketplaceRepository()) {}
  async verification(uid: string): Promise<VerificationStatusDto> {
    const user = await initialized(this.repo.reader(), uid); const status = user.verificationStatus ?? 'UNVERIFIED';
    return { status, canDiscover: user.roles.includes('HELPER') && status === 'VERIFIED', message: status === 'VERIFIED' ? 'Verification recorded. External discovery also requires the HELPER role.' : status === 'PENDING' ? 'Verification is pending. Trusted-circle tasks may still be available.' : status === 'FAILED' ? 'Verification was not approved. External discovery is unavailable.' : 'External discovery requires verification. Development uses explicit emulator fixtures; no identity upload is available yet.' };
  }
  async notifications(uid: string) { const list = await this.repo.notifications(uid); return { notifications: list.items.map(notificationDto), limit: 50, truncated: list.truncated }; }
  async read(uid: string, id: string) { return notificationDto(await this.repo.readNotification(uid, id)); }
  async notification(uid: string, id: string) { return notificationDto(await this.repo.notification(uid, id)); }
  async readAll(uid: string) { return this.repo.readAll(uid); }
  async submitReview(uid: string, id: string, body: CreateReviewRequest) { return reviewDto(await this.repo.submitReview(uid, id, body)); }
  async rating(uid: string, helperId: string) { await initialized(this.repo.reader(), uid); return this.repo.rating(helperId); }
  async reviews(uid: string, helperId: string) { await initialized(this.repo.reader(), uid); const [list, summary] = await Promise.all([this.repo.reviews(helperId), this.repo.rating(helperId)]); return { reviews: list.items.map(reviewDto), summary, limit: 20, truncated: list.truncated }; }
  async timeline(uid: string, taskId: string): Promise<TaskTimelineDto> {
    const task = await this.market.task(taskId); if (!task) throw new ApiFailure(404, 'NOT_FOUND', 'Task not found.');
    const own = await this.market.offer(offerId(taskId, uid));
    const scope = await timelineScope(this.repo.reader(), uid, task, Boolean(own));
    const history = await this.repo.timeline(taskId);
    const items = history.items.filter(e => scope === 'CIRCLE' ||
      (e.createdAt.toMillis() >= own!.createdAt.toMillis() && !['TASK_CREATED', 'TASK_UPDATED'].includes(e.type) &&
        (!['OFFER_AVAILABILITY_UPDATED','AVAILABILITY_RECONFIRMED','OFFER_CREATED', 'OFFER_WITHDRAWN', 'HELPER_SELECTED'].includes(e.type) || e.actorId === uid || e.metadata?.helperId === uid)));
    return { events: items.filter(e => labels[e.type]).reverse().map(e => ({ type: e.type, label: labels[e.type], createdAt: e.createdAt.toDate().toISOString() })), limit: 100, truncated: history.truncated };
  }
  async calendar(uid: string, query: CalendarQuery): Promise<CalendarDto> {
    await initialized(this.repo.reader(), uid);
    const [members, relationships] = await Promise.all([this.repo.memberships(uid), this.repo.helperRelationships(uid)]);
    const result = new Map<string, CalendarTaskDto>(); let truncated = members.truncated || relationships.truncated;
    for (const member of members.items.filter(m => m.status === 'ACTIVE')) {
      const tasks = await this.repo.scheduled(member.careContextId, query.start, query.end); truncated ||= tasks.truncated;
      for (const task of tasks.items) {
        if (!task.startAt || !task.endAt || ['DRAFT', 'CANCELLED'].includes(task.status) || !await managesTask(this.repo.reader(), uid, task)) continue;
        const a = task.activeAssignmentId ? await this.market.assignment(task.activeAssignmentId) : undefined;
        result.set(task.id, { taskId: task.id, title: task.title, startAt: task.startAt.toDate().toISOString(), endAt: task.endAt.toDate().toISOString(), status: task.status, roleInTask: 'REQUESTER', assignmentId: a?.id, helperId: a?.helperId });
      }
    }
    for (const a of relationships.items.filter(a => ['PENDING_CONFIRMATION', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED'].includes(a.status))) {
      const task = await this.market.task(a.taskId);
      if (!task?.startAt || !task.endAt || task.activeAssignmentId !== a.id || task.startAt.toMillis() < Date.parse(query.start) || task.startAt.toMillis() >= Date.parse(query.end)) continue;
      result.set(task.id, { taskId: task.id, title: task.title, startAt: task.startAt.toDate().toISOString(), endAt: task.endAt.toDate().toISOString(), status: task.status, roleInTask: 'HELPER', assignmentId: a.id, helperId: uid });
    }
    const tasks = [...result.values()].sort((a, b) => a.startAt.localeCompare(b.startAt));
    return { tasks: tasks.slice(0, 100), limit: 100, truncated: truncated || tasks.length > 100 };
  }
}
