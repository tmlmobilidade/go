'use client';

/* * */

import { NoDataLabel, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export default function Page() {
	//

	//
	// A . Setup Variables

	const { t } = useTranslation();

	//
	// B . Render Component

	return (
		<Surface align="center" justify="center" variant="transparent">
			<NoDataLabel text={t('auth:agencies.NoDataLabel.text')} />
		</Surface>
	);

	//
}
