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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionBasicInfo.description')}
			title={t('default:agencies.detail.SectionBasicInfo.title')}
			defaultOpen
		>
			<Section gap="lg">
				<Grid columns="aab" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('name')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.name.label')}
						maxLength={255}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.name.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('name')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('short_name')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.short_name.label')}
						maxLength={CreateAgencySchema.shape.short_name.maxLength}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.short_name.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						withAsterisk={!CreateAgencySchema.shape.short_name.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('short_name')}
					/>
				</Grid>
				<Grid columns="abc" gap="lg">
					<TextInput
						key={agencyDetailContext.data.form.key('public_email')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.email.label')}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.email.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="email"
						withAsterisk={!CreateAgencySchema.shape.public_email.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('public_email')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('phone')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.phone.label')}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.phone.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="tel"
						withAsterisk={!CreateAgencySchema.shape.phone.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('phone')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('website_url')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.website.label')}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.website.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.website_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('website_url')}
					/>
					<TextInput
						key={agencyDetailContext.data.form.key('fareUrl')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.label')}
						placeholder={t('default:agencies.detail.SectionBasicInfo.fields.fare_url.placeholder')}
						readOnly={agencyDetailContext.flags.isReadOnly}
						type="url"
						withAsterisk={!CreateAgencySchema.shape.fare_url.isOptional()}
						{...agencyDetailContext.data.form.getInputProps('fare_url')}
					/>
					<Select
						key={agencyDetailContext.data.form.key('timezone')}
						label={t('default:agencies.detail.SectionBasicInfo.fields.timezone.label')}
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
