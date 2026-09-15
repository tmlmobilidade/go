'use client';

import { Button, Collapsible, Grid, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
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
			description={t('default:stops.detail.SectionFlags.description')}
			title={t('default:stops.detail.SectionFlags.title')}
			defaultOpen
		>

			<Section gap="md">

				<Grid columns="abb" gap="md">
					<ValueDisplay
						label={t('default:stops.detail.SectionFlags.fields.unique_id.label')}
						value={data?._id ?? t('default:stops.shared.not_available')}
						variant="primary"
						elevated
						strong
					/>
					<ValueDisplay
						label={t('default:stops.detail.SectionFlags.fields.legacy_ids.label')}
						value={allNonUniqueIds.length > 0 ? allNonUniqueIds.join(', ') : t('default:stops.shared.not_available')}
					/>
				</Grid>

				{flagsValues?.map((_, index) => (
					<StopsDetailSectionFlagItem key={`flag-${index}`} index={index} />
				))}

				<Button label={t('default:stops.detail.SectionFlags.AddFlagButton.label')} onClick={handleAddLegacyId} />

			</Section>

		</Collapsible>
	);
}
