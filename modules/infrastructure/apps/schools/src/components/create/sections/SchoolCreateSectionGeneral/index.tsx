'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	//
	// C. Transform data

	//
	// D. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionGeneral.description')}
			title={t('schools:create.SchoolCreateSectionGeneral.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">
					<p>oops</p>
				</Grid>
			</Section>
		</Collapsible>
	);
}
