'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Translations } from '@/lib/translations';
import { ScopeOption } from '@/types/proposed-changes';
import { AvailabilityStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, ProposedChangesWrapper, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionShelter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopDetailContext = useStopDetailContext();
	const scopeOption: ScopeOption = 'stop';

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: t(`${Translations.AVAILABILITY_STATUS}.${value}`),
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description={t('stops:stops.detail.StopDetailsSectionShelter.description')}
			title={t('stops:stops.detail.StopDetailsSectionShelter.title')}
		>
			<Section>
				<Grid columns="abc" gap="md">
					<ProposedChangesWrapper
						inputName="has_shelter"
						label={t('stops:stops.detail.StopDetailsSectionShelter.fields.has_shelter.label')}
						relatedId={stopDetailContext.data.stop?._id}
						scope={scopeOption}
					>
						<Select
							key={stopDetailContext.data.form.key('has_shelter')}
							data={availabilityStatusOptions}
							readOnly={stopDetailContext.flags.isReadOnly}
							{...stopDetailContext.data.form.getInputProps('has_shelter')}
						/>
					</ProposedChangesWrapper>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_code')}
						label={t('stops:stops.detail.StopDetailsSectionShelter.fields.shelter_code.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_maintainer')}
						label={t('stops:stops.detail.StopDetailsSectionShelter.fields.shelter_maintainer.label')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<TextInput
					key={stopDetailContext.data.form.key('shelter_material')}
					label={t('stops:stops.detail.StopDetailsSectionShelter.fields.shelter_material.label')}
					placeholder="Ex: madeira"
					readOnly={stopDetailContext.flags.isReadOnly}
					{...stopDetailContext.data.form.getInputProps('shelter_material')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
