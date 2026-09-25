import type { SupportedLanguage } from '../types/index.js';

/* * */
export interface GtfsValidatorOptions {
	/** Working directory for the validation process */
	cwd?: string
	/** Additional environment variables */
	env?: Record<string, string>
	/** Language for validation messages (e.g., 'en', 'pt') */
	lang?: SupportedLanguage
	/** Log level for validation messages */
	log_level?: 'debug' | 'error' | 'info'
	/** Output file path for detailed validation results */
	out_file?: string
	/** Path to custom validation rules file */
	rules_path?: string
	/** Timeout in milliseconds (default: 30 minutes) */
	timeout?: number
}
