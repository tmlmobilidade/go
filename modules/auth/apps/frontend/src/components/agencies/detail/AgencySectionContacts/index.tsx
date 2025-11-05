'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { CreateAgencySchema } from '@tmlmobilidade/go-types';
import { Collapsible, PillsInput, Section } from '@tmlmobilidade/ui';
import { isEmail } from '@tmlmobilidade/go-utils';

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

				<PillsInput
					description="Notificações serão enviadas para os emails de contacto da agência."
					label="Emails de contacto do Operador"
					values={agencyDetailContext.data.form.values.contact_emails_pto}
					withAsterisk={!CreateAgencySchema.shape.contact_emails_pto.isOptional()}
					onChange={(value) => {
						agencyDetailContext.data.form.setFieldValue('contact_emails_pto', value);
					}}
					validate={{
						message: 'Insira um email válido',
						validator: isEmail,
					}}
				/>
				<PillsInput
					description="Notificações serão enviadas para os emails de contacto da TML."
					label="Emails de contacto da Autoridade"
					values={agencyDetailContext.data.form.values.contact_emails_pta}
					withAsterisk={!CreateAgencySchema.shape.contact_emails_pta.isOptional()}
					onChange={(value) => {
						agencyDetailContext.data.form.setFieldValue('contact_emails_pta', value);
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
