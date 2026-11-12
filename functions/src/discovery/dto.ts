import type { TaskDiscoveryItemDto, TaskDiscoveryQuery } from '@team517/contracts';
import type { Task, Location } from '../domain/task';
import { approximateLocation, distanceKm } from './geo';
export function taskDiscoveryDto(task: Task, location?: Location, query: TaskDiscoveryQuery = {}): TaskDiscoveryItemDto {
    const approximate = approximateLocation(location?.careContextId === task.careContextId ? location : undefined);
    const distance = query.latitude !== undefined && query.longitude !== undefined && approximate.latitude !== undefined && approximate.longitude !== undefined
      ? Math.round(distanceKm({ latitude: query.latitude, longitude: query.longitude }, { latitude: approximate.latitude, longitude: approximate.longitude })) : undefined;
    // Public instructions only; no private/legacy instructions, identity IDs, labels or addresses.
    return { id: task.id, title: task.title!, helpType: task.helpType!, startAt: task.startAt!.toDate().toISOString(), endAt: task.endAt!.toDate().toISOString(),
      status: task.status as 'OPEN' | 'HAS_OFFERS', urgency: task.urgency!, compensationType: task.compensationType!,
      publicInstructions: task.publicInstructions, pointReward: task.pointReward, cashAmount: task.cashAmount, currency: task.currency,
      approximateLocation: approximate, distanceKm: distance, offerCount: task.offerCount };
  }
