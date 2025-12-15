'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { Collapsible, Section, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionContacts() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.detail.Contacts' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="lg">
				<TagsInput
					key={agencyDetailContext.data.form.key('contact_emails_pto')}
					description={t('fields.contact_emails_pto')}
					label={t('fields.contact_emails_pto_label')}
					w="100%"
					{...agencyDetailContext.data.form.getInputProps('contact_emails_pto')}
				/>
				<TagsInput
					key={agencyDetailContext.data.form.key('contact_emails_pta')}
					description={t('fields.contact_email_pta')}
					label={t('fields.contact_email_pta_label')}
					w="100%"
					{...agencyDetailContext.data.form.getInputProps('contact_emails_pta')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
