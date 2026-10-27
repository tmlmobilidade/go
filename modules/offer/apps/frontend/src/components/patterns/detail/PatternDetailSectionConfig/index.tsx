/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { directionOptions, PatternSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PatternDetailSectionConfig() {
	//
	// A. Setup variables

	const { capabilities, form } = usePatternDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Configuração do Pattern">
			<Section gap="sm">
				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							{...field}
							error={fieldState.error?.message}
							label="Código"
							placeholder="Ex: 1234_0"
							readOnly={!capabilities.editEnabled}
							required={!PatternSchema.shape.code.isOptional()}
							value={field.value ?? ''}
							w="100%"
						/>
					)}
				/>
				<Grid columns="ab" gap="sm">
					<StandardFormController
						control={form.control}
						name="origin"
						render={({ field, fieldState }) => (
							<TextInput
								{...field}
								error={fieldState.error?.message}
								label="Origem"
								placeholder="Ex: Reboleira (Estação)"
								readOnly={!capabilities.editEnabled}
								required={!PatternSchema.shape.origin.isOptional()}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="destination"
						render={({ field, fieldState }) => (
							<TextInput
								{...field}
								error={fieldState.error?.message}
								label="Destino"
								placeholder="Ex: Reboleira (Estação)"
								readOnly={!capabilities.editEnabled}
								required={!PatternSchema.shape.destination.isOptional()}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
				</Grid>
				<StandardFormController
					control={form.control}
					name="direction"
					render={({ field, fieldState }) => (
						<Select
							{...field}
							data={directionOptions}
							error={fieldState.error?.message}
							label="Direção"
							readOnly={!capabilities.editEnabled}
							required={!PatternSchema.shape.direction.isOptional()}
							value={field.value ?? ''}
							w="100%"
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="headsign"
					render={({ field, fieldState }) => (
						<TextInput
							{...field}
							error={fieldState.error?.message}
							label="Bandeira/Headsign"
							placeholder="Ex: Reboleira (Estação)"
							readOnly={!capabilities.editEnabled}
							required={!PatternSchema.shape.headsign.isOptional()}
							value={field.value ?? ''}
							w="100%"
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);

	//
}
