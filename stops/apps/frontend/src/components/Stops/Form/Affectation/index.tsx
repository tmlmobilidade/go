'use client';

import { useLocationsContext } from '@/contexts/Locations.context';
import { useStopDetailContext } from '@/contexts/StopDetails.context';

/* * */

import { Collapsible, MultiSelect, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function Affectation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const locationsContext = useLocationsContext();

	const zonesOptions = useMemo(() => {
		if (!locationsContext.data.zones) return [];

		return locationsContext.data.zones.map(zone => ({
			label: zone.municipality.name,
			value: zone.id,
		}));
	}, [locationsContext.data.zones]);

	//
	// B. Render components

	return (
		<Collapsible
			description="Configuração dos passes aceites por esta paragem. É possível alterar estas definições para cada pattern."
			title="Afetação"
		>
			<Section>
				<MultiSelect
					key={stopDetailContext.data.form.key('')}
					data={zonesOptions}
					label="Aceitação de Passes pré-definida"
					selected={stopDetailContext.data.form.values || []}
					{...stopDetailContext.data.form.getInputProps('')}
				/>

			</Section>

		</Collapsible>
	);

	//
}
