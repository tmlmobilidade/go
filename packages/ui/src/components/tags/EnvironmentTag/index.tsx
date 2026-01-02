/* * */

import { getCurrentEnvironment } from '@tmlmobilidade/types';

import { Tag } from '../Tag';

/* * */

export function EnvironmentTag() {
	//

	//
	// A. Setup variables

	const currentEnvironment = getCurrentEnvironment();

	//
	// B. Render components

	if (currentEnvironment === 'development') {
		return <Tag label="dev" variant="danger" />;
	}

	if (currentEnvironment === 'staging') {
		return <Tag label="staging" variant="warning" />;
	}

	return null;

	//
}
