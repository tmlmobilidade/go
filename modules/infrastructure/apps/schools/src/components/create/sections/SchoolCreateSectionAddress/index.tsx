'use client';

import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionAddress() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAddress.description')}
			title={t('schools:create.SchoolCreateSectionAddress.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					{/* {schoolAddressFields.map(name => (
						// <SchoolCreateTextField key={name} form={form} label={t(`schools:create.SchoolCreateSectionAddress.fields.${name}`)} name={name} />
						<p key={name}>oops</p>
					))} */}
					<p>oops</p>
				</Grid>
			</Section>
		</Collapsible>
	);
}
