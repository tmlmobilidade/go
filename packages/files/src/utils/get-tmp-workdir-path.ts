/* * */

import { isBrowser } from '@/utils/is-browser.js';
import { generateRandomString } from '@tmlmobilidade/strings';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Gets the temporary working directory path for a given ID.
 * @param id The ID to get the temporary working directory path for.
 * @returns The temporary working directory path.
 */
export function getTmpWorkdirPath(id?: string): string {
	//

	if (isBrowser) {
		throw new Error('getTmpWorkdirPath is not supported in the browser');
	}

	//
	// Use the system temporary directory and create
	// a subdirectory based on the ID, if any was provided.
	// Otherwise, use a random ID for the subdirectory.

	const osTmpDir = tmpdir();

	const workdirName = id ? generateRandomString() : 'default';

	const workdirPath = join(osTmpDir, encodeURIComponent(workdirName));

	//
	// Return the temporary working directory path.

	return workdirPath;
}
