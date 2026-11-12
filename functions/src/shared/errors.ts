import type { ValidationField } from '@team517/contracts';
export class ApiFailure extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: ValidationField[]) { super(message); }
}
