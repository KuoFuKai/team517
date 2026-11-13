import { config } from '../config';
import { allowMakerDay3, makerDay3Person } from './maker-day3-policy';
export const makerDay3 = allowMakerDay3(config, process.env.EXPO_PUBLIC_DEMO_SCENARIO);
export const demoPerson = (id?: string) => makerDay3Person(id, makerDay3);
export const displayPerson = (id: string | undefined, fallback: string) => demoPerson(id)?.name ?? fallback;
