'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, MultiSelect, Section } from '@tmlmobilidade/ui';

/* * */

export function Affectation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const operationalStatusItems = operationalStatusSchema.options.map (value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Configuração dos passes aceites por esta paragem. É possível alterar estas definições para cada pattern."
			title="Afetação"
		>
			<Section>
				<MultiSelect
					key={stopDetailContext.data.form.key('operational_status')}
					data={operationalStatusItems}
					label="Aceitação de Passes pré-definida"
					selected={stopDetailContext.data.form.values.operational_status}
					{...stopDetailContext.data.form.getInputProps('operational_status')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
