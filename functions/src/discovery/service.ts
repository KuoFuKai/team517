import type { TaskDiscoveryItemDto, TaskDiscoveryQuery, TaskDiscoveryListDto } from '@team517/contracts';
import type { Task, Location } from '../domain/task';
import { MarketplaceRepository } from '../repositories/marketplace';
import { authorizeMarketplace, isOfferable } from '../permissions/marketplace';
import { ApiFailure } from '../shared/errors';
import { taskDiscoveryDto } from './dto';

export class DiscoveryService {
  static readonly candidateLimit = 100;
  static readonly resultLimit = 30;
  constructor(private repo = new MarketplaceRepository()) {}
  private eligible(task: Task, uid: string) {
    return isOfferable(task) && task.visibility === 'VERIFIED_HELPERS' && task.createdBy !== uid;
  }
  async discover(uid: string, query: TaskDiscoveryQuery): Promise<TaskDiscoveryListDto> {
    await authorizeMarketplace(this.repo.reader(), uid, 'DISCOVER_TASK');
    const candidates = await this.repo.candidates(DiscoveryService.candidateLimit);
    const locations = await this.repo.locations(candidates.flatMap(task => task.locationId ? [task.locationId] : []));
    const items = candidates.filter(task => this.eligible(task, uid))
      .filter(task => (!query.urgency || task.urgency === query.urgency) && (!query.compensationType || task.compensationType === query.compensationType))
      .map(task => taskDiscoveryDto(task, task.locationId ? locations.get(task.locationId) : undefined, query))
      .filter(item => query.radiusKm === undefined || (item.distanceKm !== undefined && item.distanceKm <= query.radiusKm));
    if (query.latitude !== undefined) items.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return { tasks: items.slice(0, DiscoveryService.resultLimit), candidateLimit: DiscoveryService.candidateLimit, resultLimit: DiscoveryService.resultLimit,
      truncated: candidates.length === DiscoveryService.candidateLimit || items.length > DiscoveryService.resultLimit };
  }
  async get(uid: string, id: string) {
    await authorizeMarketplace(this.repo.reader(), uid, 'DISCOVER_TASK');
    const task = await this.repo.task(id);
    if (!task || !this.eligible(task, uid)) throw new ApiFailure(404, 'TASK_NOT_OFFERABLE', 'Task is not available in discovery.');
    const locations = await this.repo.locations(task.locationId ? [task.locationId] : []);
    return taskDiscoveryDto(task, task.locationId ? locations.get(task.locationId) : undefined);
  }
}
