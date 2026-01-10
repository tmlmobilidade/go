'use client';

/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, Grid, Section, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionContacts() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth');

	//
	// B. Render components

	return (
		<Collapsible
			description={t('agencies.detail.SectionContacts.description')}
			title={t('agencies.detail.SectionContacts.title')}
		>
			<Section gap="lg">
				<Grid>
					<TagsInput
						key={agencyDetailContext.data.form.key('contact_emails_pto')}
						description={t('agencies.detail.SectionContacts.fields.contact_emails_pto.label')}
						label={t('agencies.detail.SectionContacts.fields.contact_emails_pto.title')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						{...agencyDetailContext.data.form.getInputProps('contact_emails_pto')}
					/>
					<TagsInput
						key={agencyDetailContext.data.form.key('contact_emails_pta')}
						description={t('agencies.detail.SectionContacts.fields.contact_emails_pta.label')}
						label={t('agencies.detail.SectionContacts.fields.contact_emails_pta.title')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						w="100%"
						{...agencyDetailContext.data.form.getInputProps('contact_emails_pta')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
