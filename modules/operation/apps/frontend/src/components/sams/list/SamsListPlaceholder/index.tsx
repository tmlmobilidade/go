'use client';

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SamsListPlaceholder() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('default:sams.list.Placeholder.text')} />
		</Surface>
	);
}
