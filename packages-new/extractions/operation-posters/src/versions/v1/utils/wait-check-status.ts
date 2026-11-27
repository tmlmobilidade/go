import { PDF_STATUS_POLL_INTERVAL_MS } from '../types/consts.js';

/* * */

export function waitCheckStatus(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, PDF_STATUS_POLL_INTERVAL_MS));
}
