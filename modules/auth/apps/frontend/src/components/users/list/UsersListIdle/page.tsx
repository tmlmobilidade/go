'use client';

/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListIdle() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('auth', { keyPrefix: 'users.list.idle' });

	//
	// B. Render Components
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('text')} />
		</Surface>
	);
}
