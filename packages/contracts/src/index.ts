export type UserRole = 'CARE_RECEIVER' | 'CARE_MANAGER' | 'HELPER';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED';
export interface UserDto { id: string; roles: UserRole[]; primaryOnboardingRole: UserRole; lastActiveRole?: UserRole; verificationStatus?: VerificationStatus; onboardingStatus: 'STARTED' | 'COMPLETE'; createdAt: string; updatedAt: string }
export interface InitializeUserRequest { primaryOnboardingRole: UserRole }
export interface CreateCareContextRequest { name: string }
export interface CareContextDto { id: string; name: string; createdBy: string; careReceiverUserId?: string; status: 'ACTIVE' | 'ARCHIVED'; createdAt: string; updatedAt: string }
export interface ValidationField { field: string; message: string }
export interface ApiError { error: { code: string; message: string; fields?: ValidationField[] } }
export interface HealthDto { status: 'ok'; service: string }

export type TaskUrgency = 'PLANNED' | 'URGENT';
export type TaskVisibility = 'CARE_CIRCLE' | 'VERIFIED_HELPERS';
export type TaskCompensationType = 'VOLUNTEER' | 'POINTS' | 'PAID';
export type TaskStatus = 'DRAFT' | 'OPEN' | 'HAS_OFFERS' | 'AWAITING_CONFIRMATION' | 'ARRANGED' | 'IN_PROGRESS' | 'COMPLETION_PENDING' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
// Null explicitly clears an optional draft field; omitted fields are unchanged.
export interface TaskDraftFields {
  title?: string | null;
  helpType?: string | null;
  instructions?: string | null; // Legacy private field; never automatically published.
  publicInstructions?: string | null;
  privateInstructions?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  locationId?: string | null;
  urgency?: TaskUrgency | null;
  visibility?: TaskVisibility | null;
  compensationType?: TaskCompensationType | null;
  pointReward?: number | null;
  cashAmount?: number | null;
  currency?: string | null;
}
export type CreateTaskDraftRequest = TaskDraftFields;
export type UpdateTaskDraftRequest = TaskDraftFields;
export interface CreateLocationRequest {
  label: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}
export interface LocationDto extends CreateLocationRequest { id: string; careContextId: string }
export interface TaskSummaryDto {
  id: string;
  careContextId: string;
  title?: string;
  status: TaskStatus;
  startAt?: string;
  urgency?: TaskUrgency;
}
export interface TaskDetailDto extends TaskSummaryDto {
  createdBy: string;
  helpType?: string;
  instructions?: string; // Legacy private field.
  publicInstructions?: string;
  privateInstructions?: string;
  endAt?: string;
  locationId?: string;
  visibility?: TaskVisibility;
  compensationType?: TaskCompensationType;
  pointReward?: number;
  cashAmount?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type AiProviderMode = 'MOCK' | 'REAL';
export interface GenerateTaskSuggestionRequest {
  careContextId: string;
  text: string;
  timezone: string;
  currentTaskId?: string;
}
export interface ImproveTaskSuggestionRequest {
  text: string;
  timezone: string;
}
export interface TaskDraftSuggestionDto {
  fields: TaskDraftFields;
  locationText?: string;
  summary?: string;
  missingFields: string[];
  warnings: string[];
  providerMode: AiProviderMode;
  generatedAt: string;
  sourceTaskUpdatedAt?: string;
}
export interface AiTaskSummaryDto {
  summary: string;
  warnings: string[];
  providerMode: AiProviderMode;
  generatedAt: string;
  taskUpdatedAt: string;
}

export type OfferStatus = 'ACTIVE' | 'WITHDRAWN' | 'SELECTED' | 'NOT_SELECTED' | 'EXPIRED';
export interface OfferHelpRequest { message?: string }
export interface SelectOfferRequest { offerId: string }
export interface OfferDto {
  id: string; taskId: string; helperId: string; message?: string; status: OfferStatus;
  createdAt: string; updatedAt: string; assignmentId?: string;
}
export interface OfferSummaryDto extends OfferDto { verificationStatus: VerificationStatus; averageRating?: number; reviewCount?: number }
export interface AssignmentDto {
  id: string; taskId: string; offerId: string; helperId: string; selectedBy: string;
  status: AssignmentStatus; selectedAt: string; confirmedAt?: string; startedAt?: string; completionRequestedAt?: string; completedAt?: string; createdAt: string; updatedAt: string;
}
export interface TaskOfferStateDto { id: string; status: TaskStatus; offerCount: number; activeAssignmentId?: string }
export interface OfferListDto { offers: OfferSummaryDto[]; task: TaskOfferStateDto }
export interface MyOfferDto { offer: OfferDto | null; taskStatus: TaskStatus }
export interface SelectOfferResponse { task: TaskOfferStateDto; assignment: AssignmentDto }
export interface TaskDiscoveryQuery {
  latitude?: number; longitude?: number; radiusKm?: number;
  urgency?: TaskUrgency; compensationType?: TaskCompensationType;
}
export interface ApproximateLocationDto { areaLabel: string; latitude?: number; longitude?: number }
export interface TaskDiscoveryItemDto {
  id: string; title: string; helpType: string; startAt: string; endAt: string;
  status: 'OPEN' | 'HAS_OFFERS'; urgency: TaskUrgency; compensationType: TaskCompensationType;
  pointReward?: number; cashAmount?: number; currency?: string;
  publicInstructions?: string;
  approximateLocation: ApproximateLocationDto; distanceKm?: number; offerCount: number;
}
export interface TaskDiscoveryListDto { tasks: TaskDiscoveryItemDto[]; candidateLimit: number; resultLimit: number; truncated: boolean }
export interface UpdateRolePreferenceRequest { lastActiveRole: UserRole }

export type AssignmentStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETION_PENDING' | 'COMPLETED' | 'DECLINED' | 'CANCELLED_BY_HELPER' | 'CANCELLED_BY_REQUESTER' | 'DISPUTED';
export type AssignmentSummaryDto = AssignmentDto;
export interface AssignmentExecutionDto {
  assignmentId: string; taskId: string; title?: string; helpType?: string; startAt?: string; endAt?: string;
  publicInstructions?: string; privateInstructions?: string;
  location: { label: string; formattedAddress: string; latitude?: number; longitude?: number };
}
export interface MyAssignmentsDto { assignments: AssignmentSummaryDto[]; limit: number; truncated: boolean }
export interface MyOffersDto { offers: OfferDto[]; limit: number; truncated: boolean }
export interface CancelAssignmentRequest {}
export interface DisputeCompletionRequest { reason?: string }

export interface CalendarQuery { start: string; end: string }
export interface CalendarTaskDto { taskId: string; title?: string; startAt: string; endAt: string; status: TaskStatus; roleInTask: 'REQUESTER' | 'HELPER'; assignmentId?: string; helperId?: string }
export interface CalendarDto { tasks: CalendarTaskDto[]; truncated: boolean; limit: number }
export type NotificationType = 'OFFER_RECEIVED' | 'HELPER_SELECTED' | 'ASSIGNMENT_CONFIRMED' | 'ASSIGNMENT_DECLINED' | 'ASSIGNMENT_CANCELLED' | 'TASK_STARTED' | 'COMPLETION_REQUESTED' | 'TASK_COMPLETED' | 'COMPLETION_DISPUTED' | 'NEW_MESSAGE';
export interface NotificationDto { id: string; type: NotificationType; resourceType: 'TASK' | 'ASSIGNMENT' | 'CONVERSATION'; resourceId: string; title: string; body: string; readAt?: string; createdAt: string }
export interface NotificationsDto { notifications: NotificationDto[]; limit: number; truncated: boolean }
export interface RegisterDeviceTokenRequest { token: string; platform: 'android'; deviceId?: string; appVersion?: string; deliveryEnabled?: boolean }
export interface DeviceTokenDto { id: string; platform: 'android'; enabled: boolean; registrationId: string; lastSeenAt: string }
export interface DisableDeviceTokenRequest { registrationId: string }
export interface CreateReviewRequest { rating: number; comment?: string }
export interface ReviewDto { id: string; rating: number; comment?: string; reviewerLabel: string; createdAt: string }
export interface HelperRatingSummaryDto { averageRating?: number; reviewCount: number }
export interface HelperReviewsDto { reviews: ReviewDto[]; summary: HelperRatingSummaryDto; limit: number; truncated: boolean }
export interface TaskTimelineEventDto { type: string; label: string; createdAt: string }
export interface TaskTimelineDto { events: TaskTimelineEventDto[]; limit: number; truncated: boolean }
export interface VerificationStatusDto { status: VerificationStatus; canDiscover: boolean; message: string }
export interface AssignmentPublicTaskDto { taskId: string; title?: string; publicInstructions?: string }

export type CommunityVisibility = 'PUBLIC_VERIFIED' | 'CARE_CIRCLE';
export type CommunityPostType = 'NEED' | 'RESOURCE' | 'SHARE';
export interface CommunityScope { visibility: CommunityVisibility; careContextId?: string }
export type CreateCommunityPostRequest = CommunityScope & { body: string; title?: string } & ({ type: 'NEED'; taskId: string } | { type: 'RESOURCE'; resourceId: string } | { type: 'SHARE'; originalPostId: string });
export interface CreateResourceRequest extends CommunityScope { title: string; summary: string; category: string; url?: string }
export interface CreateCommentRequest { body: string }
export interface CommunityFeedQuery { type?: CommunityPostType; careContextId?: string }
export interface ResourceDto { id: string; title: string; summary: string; category: string; url?: string; status: 'ACTIVE'; saved: boolean; createdAt: string }
export interface CommunityPostDto {
  id: string; authorId: string; authorLabel: string; type: CommunityPostType; title?: string; body: string; visibility: CommunityVisibility;
  likeCount: number; commentCount: number; liked: boolean; createdAt: string; updatedAt: string;
  taskId?: string; taskPreview?: TaskDiscoveryItemDto; resource?: ResourceDto;
  originalPostId?: string; originalAuthorId?: string; original?: CommunityPostDto; unavailable?: boolean;
}
export interface CommunityFeedDto { posts: CommunityPostDto[]; limit: number; truncated: boolean }
export interface CommunityCommentDto { id: string; authorId: string; authorLabel: string; body: string; createdAt: string }
export interface CommunityCommentsDto { comments: CommunityCommentDto[]; limit: number; truncated: boolean }
export interface CommunityPostDetailDto { post: CommunityPostDto; comments: CommunityCommentsDto }
export interface SavedResourcesDto { resources: ResourceDto[]; limit: number; truncated: boolean }
export interface SharePostRequest extends CommunityScope { body: string; title?: string }

export type CreateConversationRequest = { otherUserId: string } & ({ scope: 'CARE_CONTEXT'; careContextId: string } | { scope: 'TASK'; taskId: string });
export interface SendMessageRequest { text: string; clientMessageId: string }
export interface ConversationSummaryDto { id: string; scope: 'CARE_CONTEXT' | 'TASK'; careContextId?: string; taskId?: string; otherParticipant: { id: string; label: string }; lastMessagePreview?: string; lastMessageAt?: string; unreadCount: number; canSend: boolean; createdAt: string }
export interface ConversationsDto { conversations: ConversationSummaryDto[]; limit: number; truncated: boolean }
export interface MessageDto { id: string; conversationId: string; senderId: string; text: string; clientMessageId: string; sequence: number; createdAt: string; readAt?: string }
export interface MessagesDto { messages: MessageDto[]; limit: number; truncated: boolean; nextBefore?: number }
export interface ConversationDetailDto { conversation: ConversationSummaryDto; messages: MessagesDto }
export interface MessagingMemberDto { id: string; label: string }
export interface MessagingMembersDto { members: MessagingMemberDto[]; limit: number; truncated: boolean }
