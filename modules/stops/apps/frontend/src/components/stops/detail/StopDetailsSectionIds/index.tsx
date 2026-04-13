'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Button, Collapsible, DeleteButton, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionIds() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	//
	// C. Handle actions

	const handleAddLegacyId = () => {
		console.log('Adding legacy ID', stopDetailContext.data.stop);
		stopDetailContext.data.form.insertListItem('legacy_ids', {
			agency_id: '',
			is_merged: false,
			legacy_id: '',
		});
	};

	const handleDeleteLegacyId = (index: number) => {
		stopDetailContext.data.form.removeListItem('legacy_ids', index);
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="Gestão de IDs desta paragem."
			title="Stop IDs"
			defaultOpen
		>

			<Section>
				<Grid columns="abc" gap="md">
					<ValueDisplay label="Código Único da Paragem" value={stopDetailContext.data.stop?._id ?? 'N/A'} bordered />
				</Grid>
			</Section>

			<Section>
				{stopDetailContext.data.form.getValues().legacy_ids?.map((legacyId, index) => (
					<Section key={legacyId.agency_id} padding="none">
						<Agency>
						<DeleteButton onDelete={() => handleDeleteLegacyId(index)} />
					</Section>
				))}
				<Button label="Adicionar Código Legacy" onClick={handleAddLegacyId} />
			</Section>

		</Collapsible>
	);

	//
}
