'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { StopDetailsSectionFlagItem } from '@/components/stops/detail/StopDetailsSectionFlagItem';
import { Button, Collapsible, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopDetailsSectionFlags() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const allNonUniqueIds = useMemo(() => {
		// Group flag and legacy IDs together,
		// remove values that are equal to the unique ID,
		// remove duplicates, remove empty values and sort.
		const flagIds = stopDetailContext.data.form.getValues().flags?.map(flag => flag.stop_id) ?? [];
		const legacyIds = stopDetailContext.data.stop?.legacy_ids ?? [];
		const uniqueId = stopDetailContext.data.stop?._id;
		return Array
			.from(new Set([...flagIds, ...legacyIds]))
			.filter(id => id && id !== String(uniqueId))
			.sort();
	}, [stopDetailContext.data.form, stopDetailContext.data.stop]);

	//
	// C. Handle actions

	const handleAddLegacyId = () => {
		if (!stopDetailContext.data.form.getValues().flags) {
			stopDetailContext.data.form.setFieldValue('flags', []);
		}
		stopDetailContext.data.form.insertListItem('flags', {
			agency_ids: [],
			is_harmonized: false,
			is_harmonized_name: false,
			short_name: '',
			stop_id: '',
		});
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="Gestão de IDs desta paragem."
			title="Identificadores e Postaletes"
		>

			<Section gap="md">

				<Grid columns="abb" gap="md">
					<ValueDisplay
						label="Código Único da Paragem"
						value={stopDetailContext.data.stop?._id ?? 'N/A'}
						variant="primary"
						elevated
						strong
					/>
					<ValueDisplay
						label="Outros IDs (Antigos)"
						value={allNonUniqueIds.length > 0 ? allNonUniqueIds.join(', ') : 'N/A'}
					/>
				</Grid>

				{stopDetailContext.data.form.getValues().flags?.map((flag, index) => (
					<StopDetailsSectionFlagItem key={`flag-${index}`}index={index} />
				))}

				<Button label="Adicionar Novo Postalete" onClick={handleAddLegacyId} />

			</Section>

		</Collapsible>
	);
}
