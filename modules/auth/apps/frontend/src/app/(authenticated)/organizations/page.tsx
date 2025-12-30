'use client';

/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export default function Page() {
	const { t } = useTranslation('auth', { keyPrefix: 'organizations.noDataLabel' });

	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('text')} />
		</Surface>
	);
}
