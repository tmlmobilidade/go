'use client';

/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionIds() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const legacyStopIds = stopDetailContext.data.stop?.legacy_ids ?? [];

	//
	// C. Render components

	return (
		<Collapsible
			description="Gestão de IDs desta paragem."
			title="IDs"
		>

			<Section>
				<Grid columns="abc" gap="md">
					<ValueDisplay label="Código Único da Paragem" value={stopDetailContext.data.stop?._id ?? 'N/A'} bordered />
				</Grid>
			</Section>

			<Section>
				{stopDetailContext.data.stop?.legacy_ids && (
					<Grid columns="abc" gap="md">
						{legacyStopIds.map((legacyId, index) => (
							<ValueDisplay
								key={index}
								label={`Código Legacy ${index + 1}`}
								value={legacyId}
								bordered
							/>
						))}
					</Grid>
				)}
			</Section>

		</Collapsible>
	);

	//
}
