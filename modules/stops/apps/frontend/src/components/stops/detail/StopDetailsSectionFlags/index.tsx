'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { StopDetailsSectionFlagItem } from '@/components/stops/detail/StopDetailsSectionFlagItem';
import { Button, Collapsible, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionFlags() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	//
	// C. Handle actions

	const handleAddLegacyId = () => {
		if (!stopDetailContext.data.form.getValues().flags) {
			stopDetailContext.data.form.setFieldValue('flags', []);
		}
		stopDetailContext.data.form.insertListItem('flags', {
			agency_ids: [],
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
			defaultOpen
		>

			<Section gap="md">

				<Grid columns="abc" gap="md">
					<ValueDisplay label="Código Único da Paragem" value={stopDetailContext.data.stop?._id ?? 'N/A'} bordered />
				</Grid>

				{stopDetailContext.data.form.getValues().flags?.map((flag, index) => (
					<StopDetailsSectionFlagItem
						key={`flag-${index}-${flag.agency_ids.join('-')}`}
						agencyIds={flag.agency_ids}
						index={index}
						shortName={flag.short_name}
						stopId={flag.stop_id}
					/>
				))}

				<Section flexDirection="row" gap="md" padding="none">
					<Button label="Adicionar Novo Postalete" onClick={handleAddLegacyId} />
					{/* TODO: Notas e regras de validação */}
				</Section>

			</Section>

		</Collapsible>
	);

	//
}
