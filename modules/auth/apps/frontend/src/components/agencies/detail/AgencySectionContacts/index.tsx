'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { Collapsible, Section, TagsInput } from '@tmlmobilidade/ui';

/* * */

export function AgencySectionContacts() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação de contatos da agência"
			title="Informação de contatos"
		>
			<Section gap="lg">
				<TagsInput
					key={agencyDetailContext.data.form.key('contact_emails_pto')}
					description="Notificações serão enviadas para os emails de contacto da agência."
					label="Emails de contacto do Operador"
					w="100%"
					{...agencyDetailContext.data.form.getInputProps('contact_emails_pto')}
				/>
				<TagsInput
					key={agencyDetailContext.data.form.key('contact_emails_pta')}
					description="Notificações serão enviadas para os emails de contacto da TML."
					label="Emails de contacto da Autoridade"
					w="100%"
					{...agencyDetailContext.data.form.getInputProps('contact_emails_pta')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
