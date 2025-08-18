'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { jurisdictionSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionAdministrative() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const jurisdictionItems = jurisdictionSchema.options.map(value => ({
		label: Translations.JURISDICATION[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações sobre a localização administrativa e responsabilidade de gestão desta paragem."
			title="Informação Administrativa"
		>
			<Section>
				<Grid columns="ab" gap="sm">
					<ValueDisplay label="Distrito" value={stopDetailContext.data.districtName} raised />

					<ValueDisplay label="Municipio" value={stopDetailContext.data.municipalityName} raised />

					<ValueDisplay label="Freguesia" value={stopDetailContext.data.parishName} raised />

					<ValueDisplay label="Localidade" value={stopDetailContext.data.localityName} raised />
				</Grid>
			</Section>
			<Section>
				<Combobox
					data={jurisdictionItems}
					defaultValue={Translations.JURISDICATION.unknown}
					label="Jusrisdição"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('jurisdiction')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
