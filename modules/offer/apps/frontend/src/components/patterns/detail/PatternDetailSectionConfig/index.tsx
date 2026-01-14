/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { directionOptions, PatternSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Configuração do Pattern">
			<Section gap="sm">
				<TextInput
					key={patternDetailContext.data.form.key('code')}
					disabled={patternDetailContext.flags.isReadOnly}
					label="Código"
					placeholder="Ex: 1234_0"
					required={!PatternSchema.shape.code.isOptional()}
					w="100%"
					{...patternDetailContext.data.form.getInputProps('code')}
				/>

				<Grid columns="ab" gap="sm">
					<TextInput
						key={patternDetailContext.data.form.key('origin')}
						label="Origem"
						placeholder="Ex: Reboleira (Estação)"
						required={!PatternSchema.shape.origin.isOptional()}
						w="100%"
						{...patternDetailContext.data.form.getInputProps('origin')}
					/>

					<TextInput
						key={patternDetailContext.data.form.key('destination')}
						label="Destino"
						placeholder="Ex: Reboleira (Estação)"
						required={!PatternSchema.shape.destination.isOptional()}
						w="100%"
						{...patternDetailContext.data.form.getInputProps('destination')}
					/>
				</Grid>

				<Select
					key={patternDetailContext.data.form.key('direction')}
					data={directionOptions}
					label="Direção"
					required={!PatternSchema.shape.direction.isOptional()}
					w="100%"
					{...patternDetailContext.data.form.getInputProps('direction')}
				/>

				<TextInput
					key={patternDetailContext.data.form.key('headsign')}
					label="Bandeira/Headsign"
					placeholder="Ex: Reboleira (Estação)"
					required={!PatternSchema.shape.headsign.isOptional()}
					w="100%"
					{...patternDetailContext.data.form.getInputProps('headsign')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
