'use client';

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function TypologiesListPlaceholder() {
	const { t } = useTranslation();

	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('default:typologies.list.select')} />
		</Surface>
	);
}
