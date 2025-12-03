'use client';

/* * */

import { useAgencyDetailContext } from '@/contexts/AgencyDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

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
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('name')}
						label="Nome do Operador"
						maxLength={255}
						placeholder="Carris Metropolitana"
						withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('name')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('short_name')}
						label="Nome Curto"
						maxLength={3}
						placeholder="CM"
						withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('public_email')}
						label="Email da agência"
						placeholder="email@example.com"
						type="email"
						withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('public_email')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('phone')}
						label="Telemóvel da agência"
						placeholder="912345678"
						type="tel"
						withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('phone')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('website_url')}
						label="URL da agência"
						placeholder="https://www.carrismetropolitana.pt"
						type="url"
						withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('website_url')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('fare_url')}
						label="URL de tarifário da agência"
						placeholder="https://www.carrismetropolitana.pt/tarifas"
						type="url"
						withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('fare_url')}
					/>
					<Combobox
						key={agencyDetailContext.data.form.key('timezone')}
						data={Dates.TIMEZONE_LIST as unknown as string[]}
						label="Timezone da agência"
						{...agencyDetailContext.data.form.getInputProps('timezone')}
						searchable
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
