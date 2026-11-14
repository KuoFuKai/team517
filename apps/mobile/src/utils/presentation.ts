import { displayPerson } from '../demo/maker-day3';
import type { UserRole } from '@team517/contracts';
export const statusLabels: Record<string, string> = {
  READ: 'Read', UNREAD: 'New', DRAFT: 'Draft', OPEN: 'Open for offers', HAS_OFFERS: 'Offers received', AWAITING_CONFIRMATION: 'Waiting for helper confirmation',
  PENDING_CONFIRMATION: 'Waiting for helper confirmation', ARRANGED: 'Scheduled', CONFIRMED: 'Scheduled', IN_PROGRESS: 'In progress',
  COMPLETION_PENDING: 'Waiting for completion review', COMPLETED: 'Completed', CANCELLED: 'Cancelled', DISPUTED: 'Issue reported',
  ACTIVE: 'Available', WITHDRAWN: 'Withdrawn', SELECTED: 'Selected', NOT_SELECTED: 'Not selected', EXPIRED: 'Expired', DECLINED: 'Declined',
  CANCELLED_BY_HELPER: 'Cancelled by helper', CANCELLED_BY_REQUESTER: 'Cancelled by requester', UNVERIFIED: 'Not verified', PENDING: 'Verification in review', VERIFIED: 'Verified', FAILED: 'Verification not approved',
  PLANNED: 'Planned', URGENT: 'Urgent', VOLUNTEER: 'Volunteer', POINTS: 'Points', PAID: 'Paid', CARE_CIRCLE: 'My care circle', VERIFIED_HELPERS: 'Verified helpers', REQUESTER: 'Requester',
};
export const statusLabel = (status: string) => statusLabels[status] ?? status.toLowerCase().replace(/_/g, ' ');
export const roleLabel = (role: UserRole) => ({ CARE_MANAGER: 'Family & care manager', CARE_RECEIVER: 'Care receiver', HELPER: 'Helper' })[role];
export const personLabel = (id: string) => displayPerson(id, 'Helper ' + id.slice(-4).toUpperCase()); // Ordinary sessions retain identifier aliases; explicit LOCAL presentation uses documented fictional identities.
export const countLabel = (count: number, singular: string, plural = singular + 's') => `${count} ${count === 1 ? singular : plural}`;
export function scheduledTime(value?: string) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}
export function workPriority(status: string) {
  const order = ['PENDING_CONFIRMATION', 'IN_PROGRESS', 'CONFIRMED', 'COMPLETION_PENDING', 'COMPLETED'];
  const index = order.indexOf(status); return index < 0 ? order.length : index;
}
export function assignmentNextAction(status: string, helper: boolean) {
  const copy: Record<string, string> = {
    PENDING_CONFIRMATION: helper ? 'Review the task, then confirm or decline.' : 'Waiting for the helper to confirm. Backup offers remain available.',
    CONFIRMED: helper ? 'Arrival details are unlocked. Start when you begin helping.' : 'Your helper has confirmed. The task is scheduled.',
    IN_PROGRESS: helper ? 'When the work is done, request completion review.' : 'Your helper is working on this task.',
    COMPLETION_PENDING: helper ? 'Waiting for the requester to approve completion.' : 'Review the outcome, then approve completion or report an issue.',
    COMPLETED: 'All done. Thank you for making care possible.',
    DISPUTED: 'An issue has been reported. Resolution is not available in this version.',
  };
  return copy[status] ?? 'This arrangement has ended. Check the task for its current status.';
}
export const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
export function localDateKey(value: string | Date, timeZone = deviceTimeZone()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type)!.value).join('-');
}
// Calendar inputs represent device-local midnight; the API still receives ISO instants.
export function localDayInstant(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return localDateKey(date) === value ? date.toISOString() : undefined;
}
export function dateLabel(value?: string) {
  if (!value) return 'Time to be arranged';
  const date = new Date(value); if (!Number.isFinite(date.getTime())) return 'Time to be arranged';
  return date.toLocaleString(undefined, { timeZone: deviceTimeZone(), timeZoneName: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
export function friendlyError(value: unknown): string {
  const code = (value as { code?: string })?.code;
  if (code === 'INSUFFICIENT_POINTS') {
    const message=(value as {message?:string})?.message ?? '';
    if (message === 'The task creator needs more available points before this task can be published.') return message;
    return /^You need \d+ points to publish this task\. You currently have \d+ available\.$/.test(message) ? message : 'You do not have enough available points to publish this task. Your draft is saved.';
  }
  if (code === 'POINTS_RESERVATION_MISSING' || code === 'POINTS_CONFLICT') return 'This task reward needs checking. Refresh your points before trying again.';
  const messages: Record<string, string> = {
    AVAILABILITY_STALE: 'Availability changed. Reload the latest version and review again.', REQUESTER_RECONFIRMATION_REQUIRED: 'The requester needs to review the updated availability before confirmation.', OFFER_NOT_EDITABLE: 'Only an active or pending offer can be edited. Arranged tasks keep their commitment.', ASSIGNMENT_NOT_REVIEWABLE: 'This pending selection has changed. Refresh the task.', HELPER_NOT_FOUND: 'This helper profile is no longer available.',
    OFFER_LIST_LIMIT: 'This task has too many historical offers for one comparison. Contact your care coordinator.',
    MESSAGE_EMPTY: 'Write a message before sending.',
    MESSAGE_TOO_LONG: 'Keep your message within 2000 characters.',
    CONVERSATION_NOT_ALLOWED: 'Messaging requires an active shared circle or a valid helper/requester Task relationship.',
    MESSAGING_RELATIONSHIP_INACTIVE: 'This conversation is now read-only. Your current relationship no longer allows new messages.',
    CLIENT_MESSAGE_ID_CONFLICT: 'That send ID belongs to different text. Refresh and start a new message.',
    COMMUNITY_VERIFICATION_REQUIRED: 'Verified status is needed for public Community. Select your care circle to view trusted-circle posts.',
    VISIBILITY_MISMATCH: 'This content cannot be shared outside its original circle.',
    RESOURCE_UNAVAILABLE: 'This resource is no longer available to your account.',
    HELPER_NOT_VERIFIED: 'Verification is needed to find tasks outside your circle. Check your verification status in Me.',
    FORBIDDEN: 'This action is not available for your account or current relationship. Refresh to check your access.',
    AUTH_REQUIRED: 'Please sign in to continue.', UNAUTHENTICATED: 'Please sign in again.',
    NETWORK_ERROR: 'We could not connect. Check your connection, then refresh before trying a saved action again.',
    BACKEND_UNAVAILABLE: 'The service is temporarily unavailable. Please try again shortly.',
    AI_NOT_CONFIGURED: 'The writing assistant is not available yet. You can keep editing your task manually.',
    AI_UNAVAILABLE: 'The assistant is temporarily unavailable. Your draft is safe; continue manually.',
    AI_INVALID_RESPONSE: 'We could not use that suggestion. Your draft has not changed.',
    OFFER_ALREADY_ACTIVE: 'Your offer is already available for this task.', OFFER_NOT_ACTIVE: 'This offer has changed. Refresh to see the latest status.',
    REVIEW_ALREADY_EXISTS: 'You have already reviewed this assignment. Thank you.', REVIEW_NOT_ELIGIBLE: 'Reviews are available after completion is approved.',
    LOCATION_NOT_VISIBLE: 'Operational details are available only for your current confirmed work.',
  };
  if (code && messages[code]) return messages[code];
    if (code === 'TASK_NOT_READY') return 'Complete the required task details before publishing.';
    if (code === 'VALIDATION_ERROR') return 'Check the information below, then try again.';
  if (code && /NOT_|EXISTS|STATE|CONFLICT|STALE/.test(code)) return 'This item has changed or the action is not available yet. Refresh before trying again.';
  // Do not surface arbitrary exception/vendor text in product screens.
  return 'We could not finish that action. Please refresh and try again.';
}

export const fieldLabel = (field: string) => ({ title: 'Title', helpType: 'Help type', instructions: 'Task instructions', publicInstructions: 'Public instructions', privateInstructions: 'Operational notes', startAt: 'Start time', endAt: 'End time', locationId: 'Location', urgency: 'Priority', visibility: 'Who can offer', compensationType: 'Compensation', pointReward: 'Point reward', cashAmount: 'Amount', currency: 'Currency' } as Record<string, string>)[field] ?? 'Form';
export function validationSummary(fields?: { field: string; message: string }[]) {
  const hints: Record<string, string> = {
    title: 'Enter a short task title.', helpType: 'Enter the kind of help you need.',
    startAt: 'Enter a full date and time with a timezone.', endAt: 'Enter a full date and time with a timezone.',
    locationId: 'Choose a location.', urgency: 'Choose Planned or Urgent.', visibility: 'Choose your circle or verified helpers.',
    compensationType: 'Choose Volunteer, Points or Paid.', pointReward: 'Check the reward amount.', cashAmount: 'Check the amount.', currency: 'Use a three-letter currency code.',
  };
  // Server fields identify the input; validator/vendor messages are not product copy.
  return fields?.map(({ field }) => `${fieldLabel(field)}: ${hints[field] ?? 'Check the length and format.'}`).join('\n') ?? '';
}
