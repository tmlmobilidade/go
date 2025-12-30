'use client';

/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { CreateAgencySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencyDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const agencyDetailContext = useAgencyDetailContext();
	const { t } = useTranslation('auth', { keyPrefix: 'agencies.detail.BasicInfo' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
			defaultOpen
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('name')}
						label={t('fields.name')}
						maxLength={255}
						placeholder={t('fields.namePlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('name')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('short_name')}
						label={t('fields.shortName')}
						maxLength={3}
						placeholder={t('fields.shortNamePlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('public_email')}
						label={t('fields.email')}
						placeholder={t('fields.emailPlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="email"
						withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('public_email')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('phone')}
						label={t('fields.phone')}
						placeholder={t('fields.phonePlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="tel"
						withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('phone')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('website_url')}
						label={t('fields.website')}
						placeholder={t('fields.websitePlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('website_url')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('fareUrl')}
						label={t('fields.fareUrl')}
						placeholder={t('fields.fareUrlPlaceholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('fare_url')}
					/>
					<Select
						key={agencyDetailContext.data.form.key('timezone')}
						label={t('fields.timezone')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						data={Dates.TIMEZONE_LIST.map(tz => ({
							label: tz,
							value: tz,
						}))}
						{...agencyDetailContext.data.form.getInputProps('timezone')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
