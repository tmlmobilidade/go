'use client';

/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AgencyDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Detalhes como nome, email, telefone, URL e timezone da agência."
			title="Informações gerais"
			defaultOpen
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('name')}
						label="Nome do Operador"
						maxLength={255}
						placeholder="Carris Metropolitana"
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('name')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('short_name')}
						label="Nome Curto"
						maxLength={3}
						placeholder="CM"
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('public_email')}
						label="Email da agência"
						placeholder="email@example.com"
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="email"
						withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('public_email')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('phone')}
						label="Telemóvel da agência"
						placeholder="912345678"
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="tel"
						withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('phone')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('website_url')}
						label="URL da agência"
						placeholder="https://www.carrismetropolitana.pt"
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('website_url')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('fare_url')}
						label="URL de tarifário da agência"
						placeholder="https://www.carrismetropolitana.pt/tarifas"
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('fare_url')}
					/>
					<Select
						key={agencyDetailContext.data.form.key('timezone')}
						data={Dates.TIMEZONE_LIST.map(tz => ({ label: tz, value: tz }))}
						label="Timezone da agência"
						readOnly={agencyDetailContext.flags.isReadOnly}
						{...agencyDetailContext.data.form.getInputProps('timezone')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
