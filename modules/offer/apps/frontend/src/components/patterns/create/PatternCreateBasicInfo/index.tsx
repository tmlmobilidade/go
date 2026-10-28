'use client';

import { usePatternCreateContext } from '@/components/patterns/create/PatternCreate.context';
import { PatternSchema } from '@tmlmobilidade/go-types-offer';
import { Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

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
			<StandardFormController
				control={patternCreateContext.form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Código"
						placeholder="Ex: 1001_0_1"
						readOnly={!patternCreateContext.capabilities.editEnabled}
						required={!PatternSchema.shape.code.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={patternCreateContext.form.control}
				name="origin"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Origem"
						placeholder="Ex: Reboleira (Estação)"
						readOnly={!patternCreateContext.capabilities.editEnabled}
						required={!PatternSchema.shape.origin.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={patternCreateContext.form.control}
				name="destination"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Destino"
						placeholder="Ex: Reboleira (Estação)"
						readOnly={!patternCreateContext.capabilities.editEnabled}
						required={!PatternSchema.shape.destination.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={patternCreateContext.form.control}
				name="headsign"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Bandeira/Headsign"
						placeholder="Ex: Reboleira (Estação)"
						readOnly={!patternCreateContext.capabilities.editEnabled}
						required={!PatternSchema.shape.headsign.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>
		</Section>
	);

	//
}
