'use client';

import { usePatternCreateContext } from '@/components/patterns/create/PatternCreate.context';
import { PatternSchema } from '@tmlmobilidade/types';
import { Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PatternCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const patternCreateContext = usePatternCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<TextInput
				key={patternCreateContext.data.form.key('code')}
				label="Código"
				placeholder="Ex: 1001_0_1"
				required={!PatternSchema.shape.code.isOptional()}
				w="100%"
				{...patternCreateContext.data.form.getInputProps('code')}
			/>

			<TextInput
				key={patternCreateContext.data.form.key('origin')}
				label="Origem"
				placeholder="Ex: Reboleira (Estação)"
				required={!PatternSchema.shape.origin.isOptional()}
				w="100%"
				{...patternCreateContext.data.form.getInputProps('origin')}
			/>

			<TextInput
				key={patternCreateContext.data.form.key('destination')}
				label="Destino"
				placeholder="Ex: Reboleira (Estação)"
				required={!PatternSchema.shape.destination.isOptional()}
				w="100%"
				{...patternCreateContext.data.form.getInputProps('destination')}
			/>

			<TextInput
				key={patternCreateContext.data.form.key('headsign')}
				label="Bandeira/Headsign"
				placeholder="Ex: Reboleira (Estação)"
				required={!PatternSchema.shape.headsign.isOptional()}
				w="100%"
				{...patternCreateContext.data.form.getInputProps('headsign')}
			/>
		</Section>
	);

	//
}
