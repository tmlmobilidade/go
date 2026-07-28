/* * */

export interface NumberAnimationConfig {
	duration_ms: number
	enabled: boolean
	timing_function: string
}

/* * */

export const DEFAULT_NUMBER_ANIMATION_CONFIG = {
	duration_ms: 800,
	enabled: true,
	timing_function: 'ease-out',
} as const satisfies NumberAnimationConfig;

/* * */

export function getNumberAnimationDuration(config: NumberAnimationConfig) {
	return config.enabled ? config.duration_ms : 0;
}
