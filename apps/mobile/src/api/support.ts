import type { CalendarDto, CalendarQuery, NotificationsDto, NotificationDto, CreateReviewRequest, ReviewDto, HelperReviewsDto, HelperRatingSummaryDto, TaskTimelineDto, VerificationStatusDto, AssignmentPublicTaskDto } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createSupportApi(request: ApiRequest) {
  const id = encodeURIComponent;
  return {
    getCalendar: (q: CalendarQuery) => request<CalendarDto>('/me/calendar?start=' + id(q.start) + '&end=' + id(q.end)),
    getNotifications: () => request<NotificationsDto>('/me/notifications'),
    markNotificationRead: (value: string) => request<NotificationDto>('/notifications/' + id(value) + '/read', {}),
    markAllNotificationsRead: () => request<{ marked: number; limit: number; truncated: boolean }>('/me/notifications/read-all', {}),
    submitReview: (assignmentId: string, body: CreateReviewRequest) => request<ReviewDto>('/assignments/' + id(assignmentId) + '/reviews', body),
    getHelperReviews: (helperId: string) => request<HelperReviewsDto>('/helpers/' + id(helperId) + '/reviews'),
    getHelperRatingSummary: (helperId: string) => request<HelperRatingSummaryDto>('/helpers/' + id(helperId) + '/rating'),
    getTaskTimeline: (taskId: string) => request<TaskTimelineDto>('/tasks/' + id(taskId) + '/timeline'),
    getVerificationStatus: () => request<VerificationStatusDto>('/me/verification'),
    getAssignmentPublicTask: (assignmentId: string) => request<AssignmentPublicTaskDto>('/assignments/' + id(assignmentId) + '/task'),
  };
}
