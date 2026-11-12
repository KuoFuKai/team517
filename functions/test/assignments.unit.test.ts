import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authorizeAssignment } from '../src/permissions/assignments';
import type { PermissionReader } from '../src/permissions/authorize';
import type { Task } from '../src/domain/task';
import type { Assignment } from '../src/domain/marketplace';
const task = { id: 't', createdBy: 'owner', careContextId: 'c' } as Task;
const assignment = { helperId: 'helper' } as Assignment;
const reader = { user: async () => ({ roles: ['CARE_MANAGER'], lastActiveRole: 'HELPER' }), member: async () => ({ status: 'ACTIVE', role: 'CARE_MANAGER' }) } as unknown as PermissionReader;
test('Assignment identity overrides UI role preference and manager membership for Helper-only actions', async () => {
  for (const action of ['CONFIRM_ASSIGNMENT', 'DECLINE_ASSIGNMENT', 'START_TASK', 'REQUEST_COMPLETION', 'VIEW_EXECUTION_DETAILS'] as const) {
    await assert.rejects(authorizeAssignment(reader, 'owner', action, task, assignment), { code: 'FORBIDDEN' });
    assert.equal(await authorizeAssignment(reader, 'helper', action, task, assignment), 'HELPER');
  }
});
test('A manager Helper cannot approve or dispute their own work', async () => {
  for (const action of ['CONFIRM_COMPLETION', 'DISPUTE_COMPLETION'] as const) {
    await assert.rejects(authorizeAssignment(reader, 'helper', action, task, assignment), { code: 'FORBIDDEN' });
    assert.equal(await authorizeAssignment(reader, 'manager', action, task, assignment), 'REQUESTER');
  }
});
