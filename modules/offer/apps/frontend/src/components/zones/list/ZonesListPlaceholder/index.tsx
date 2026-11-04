'use client';

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ZonesListPlaceholder() {
	const { t } = useTranslation();

	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('default:zones.list.select')} />
		</Surface>
	);
}
