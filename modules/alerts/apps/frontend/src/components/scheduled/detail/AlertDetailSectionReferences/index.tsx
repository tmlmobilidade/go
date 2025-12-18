'use client';

/* * */

import { ReferencesGroup } from '@/components/common/references/ReferencesGroup';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { useLocationsContext } from '@/contexts/Locations.context';
import { Collapsible, MultiSelect, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionReferences() {
	//
	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const alertDetailContext = useAlertDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.detail.sectionReferences' });

	//
	// B. Transform data

	const references = useMemo(() => alertDetailContext.data.form.values.references, [
		alertDetailContext.data.form.values.references,
	]);

	const municipalitiesOptions = useMemo(() => {
		if (!locationsContext.data.municipalities) return [];

		return locationsContext.data.municipalities.map(municipality => ({
			label: municipality.name,
			value: municipality.id,
		}));
	}, [locationsContext.data.municipalities]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="md">
				<MultiSelect
					data={municipalitiesOptions}
					description={t('municipalities_description')}
					label={t('municipalities_label')}
					onChange={ids => alertDetailContext.data.form.setFieldValue('municipality_ids', ids)}
					value={alertDetailContext.data.form.values.municipality_ids}
				/>

				<ReferencesGroup
					keys={alertDetailContext.data.form.values.reference_type}
					municipality_ids={alertDetailContext.data.form.values.municipality_ids}
					onSetFieldValue={alertDetailContext.data.form.setFieldValue}
					reference_type={alertDetailContext.data.form.values.reference_type}
					references={references}
				/>
			</Section>
		</Collapsible>
	);
}
