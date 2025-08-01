'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, PillsInput, Section } from '@tmlmobilidade/ui';
import { isEmail } from '@tmlmobilidade/utils';

/* * */

export function AgencySectionContacts() {
	//

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
				<PillsInput
					description="Notificações serão enviadas para os emails de contacto da agência."
					label="Emails de contacto da agência"
					values={agencyDetailContext.data.form.values.contact_emails}
					withAsterisk={!CreateAgencySchema.shape.contact_emails.isOptional()}
					onChange={(value) => {
						console.log(value);
						agencyDetailContext.data.form.setFieldValue('contact_emails', value);
					}}
					validate={{
						message: 'Insira um email válido',
						validator: isEmail,
					}}
				/>
				<PillsInput
					description="Notificações serão enviadas para os emails de contacto da TML."
					label="Emails de contacto da TML"
					values={agencyDetailContext.data.form.values.tml_contact_emails}
					withAsterisk={!CreateAgencySchema.shape.tml_contact_emails.isOptional()}
					onChange={(value) => {
						console.log(value);
						agencyDetailContext.data.form.setFieldValue('tml_contact_emails', value);
					}}
					validate={{
						message: 'Insira um email válido',
						validator: isEmail,
					}}
				/>
			</Section>
		</Collapsible>
	);

	//
}
