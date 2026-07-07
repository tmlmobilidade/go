import { type SeverityLevel } from '@/gtfs-validation/severity-level.js';

/***/

export interface RuleConfig {
	severity: SeverityLevel
}

export type WithOptions<T> = T & {
	options: string[]
};

export type WithCompare<T> = T & {
	compare: { key: string, value: string }[]
};
