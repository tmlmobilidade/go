'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

/* * */

export function SchoolCreateSectionAdministrative() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAdministrative.description')}
			title={t('schools:create.SchoolCreateSectionAdministrative.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{/* {schoolAdministrativeFields.map(name => (
						<SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionAdministrative.fields.${name}`)} name={name} />
					))} */}
					<p>oops</p>
				</Grid>
			</Section>
		</Collapsible>
	);
}
