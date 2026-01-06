'use client';

/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersListIdle() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('auth');

	//
	// B. Render Components
	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('users.list.Idle.text')} />
		</Surface>
	);
}
