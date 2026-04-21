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

	if (currentEnvironment === 'prd') {
		return <Tag label="prd" variant="danger" />;
	}

	if (currentEnvironment === 'stg') {
		return <Tag label="stg" variant="warning" />;
	}

	if (currentEnvironment === 'dev') {
		return <Tag label="dev" variant="success" />;
	}

	return null;

	//
}
