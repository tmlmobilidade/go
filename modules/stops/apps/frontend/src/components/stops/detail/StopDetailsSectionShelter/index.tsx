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

	const stopDetailContext = useStopDetailContext();
	const scopeOption: ScopeOption = 'stop';
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.shelter' });
	const { t: tTypes } = useTranslation('stops', { keyPrefix: Translations.AVAILABILITY_STATUS });

	//
	// B. Transform data

	const availabilityStatusOptions = AvailabilityStatusSchema.options.map(value => ({
		label: tTypes(value),
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section>
				<Grid columns="abc" gap="md">
					<ProposedChangesWrapper
						inputName="has_shelter"
						label={t('fields.hasShelter')}
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
						label={t('fields.shelterCode')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('shelter_code')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('shelter_maintainer')}
						label={t('fields.shelterMaintainer')}
						readOnly={stopDetailContext.flags.isReadOnly}
						{...stopDetailContext.data.form.getInputProps('shelter_maintainer')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<TextInput
					key={stopDetailContext.data.form.key('shelter_material')}
					label={t('fields.shelterMaterial')}
					placeholder="2023-02-10"
					readOnly={stopDetailContext.flags.isReadOnly}
					{...stopDetailContext.data.form.getInputProps('last_shelter_installation')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
