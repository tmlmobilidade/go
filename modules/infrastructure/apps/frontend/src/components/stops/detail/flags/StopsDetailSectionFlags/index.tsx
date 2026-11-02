'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { Button, Collapsible, Grid, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StopsDetailSectionFlagItem } from '../StopsDetailSectionFlagItem';

/* * */

export function StopsDetailSectionFlags() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data } = useStopsDetailData();

	const { form } = useStopsDetailFormContext();

	const flagsValues = useStandardFormWatch({ control: form.control, name: 'flags' });

	//
	// B. Transform data

	const allNonUniqueIds = useMemo(() => {
		// Group flag and legacy IDs together,
		// remove values that are equal to the unique ID,
		// remove duplicates, remove empty values and sort.
		const flagIds = flagsValues?.map(flag => flag.stop_id) ?? [];
		const legacyIds = data?.legacy_ids ?? [];
		const uniqueId = data?._id;
		return Array
			.from(new Set([...flagIds, ...legacyIds]))
			.filter(id => id && id !== String(uniqueId))
			.sort();
	}, [flagsValues, data?._id, data?.legacy_ids]);

	//
	// C. Handle actions

	const handleAddLegacyId = () => {
		const latestValues = form.getValues('flags');
		const newValues = [...(latestValues ?? []), {
			agency_ids: [],
			is_harmonized: false,
			short_name: '',
			stop_id: '',
		}];
		form.setValue('flags', newValues, { shouldDirty: true });
	};

	//
	// D. Render components

	return (
		<Collapsible
			description={t('stops:detail.StopsDetailSectionFlags.description')}
			title={t('stops:detail.StopsDetailSectionFlags.title')}
		>

			<Section gap="md">

				<Grid columns="abb" gap="md">
					<ValueDisplay
						label={t('stops:detail.StopsDetailSectionFlags.fields.unique_id.label')}
						value={data?._id ?? t('stops:detail.StopsDetailSectionFlags.not_available')}
						variant="primary"
						elevated
						strong
					/>
					<ValueDisplay
						label={t('stops:detail.StopsDetailSectionFlags.fields.legacy_ids.label')}
						value={allNonUniqueIds.length > 0 ? allNonUniqueIds.join(', ') : t('stops:detail.StopsDetailSectionFlags.not_available')}
					/>
				</Grid>

				{flagsValues?.map((_, index) => (
					<StopsDetailSectionFlagItem key={`flag-${index}`} index={index} />
				))}

				<Button label={t('stops:detail.StopsDetailSectionFlags.add_flag_button.label')} onClick={handleAddLegacyId} />

			</Section>

		</Collapsible>
	);
}
