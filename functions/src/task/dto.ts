import type { LocationDto, TaskSummaryDto, TaskDetailDto } from '@team517/contracts';
import type { Location, Task } from '../domain/task';

export const locationDto = (location: Location): LocationDto => ({
  id: location.id, careContextId: location.careContextId, label: location.label,
  formattedAddress: location.formattedAddress, latitude: location.latitude, longitude: location.longitude,
});
export const taskSummaryDto = (task: Task): TaskSummaryDto => ({
  id: task.id, careContextId: task.careContextId, title: task.title, status: task.status,
  startAt: task.startAt?.toDate().toISOString(), urgency: task.urgency,
});
export const taskDetailDto = (task: Task): TaskDetailDto => ({
  ...taskSummaryDto(task), createdBy: task.createdBy, helpType: task.helpType, instructions: task.instructions, publicInstructions: task.publicInstructions, privateInstructions: task.privateInstructions,
  endAt: task.endAt?.toDate().toISOString(), locationId: task.locationId, visibility: task.visibility,
  compensationType: task.compensationType, pointReward: task.pointReward, cashAmount: task.cashAmount,
  currency: task.currency, createdAt: task.createdAt.toDate().toISOString(), updatedAt: task.updatedAt.toDate().toISOString(),
  publishedAt: task.publishedAt?.toDate().toISOString(),
});
