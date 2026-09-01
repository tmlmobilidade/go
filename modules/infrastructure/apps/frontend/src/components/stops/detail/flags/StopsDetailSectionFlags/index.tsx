'use client';

import { Button, Collapsible, Grid, Section, useStandardFormWatch, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';
import { StopsDetailSectionFlagItem } from '../StopsDetailSectionFlagItem';

/* * */

export function StopsDetailSectionFlags() {
	//

	//
	// A. Setup variables

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
			description="Gestão de IDs desta paragem."
			title="Identificadores e Postaletes"
			defaultOpen
		>

			<Section gap="md">

				<Grid columns="abb" gap="md">
					<ValueDisplay
						label="Código Único da Paragem"
						value={data?._id ?? 'N/A'}
						variant="primary"
						elevated
						strong
					/>
					<ValueDisplay
						label="Outros IDs (Antigos)"
						value={allNonUniqueIds.length > 0 ? allNonUniqueIds.join(', ') : 'N/A'}
					/>
				</Grid>

				{flagsValues?.map((_, index) => (
					<StopsDetailSectionFlagItem key={`flag-${index}`} index={index} />
				))}

				<Button label="Adicionar Novo Postalete" onClick={handleAddLegacyId} />

			</Section>

		</Collapsible>
	);
}
