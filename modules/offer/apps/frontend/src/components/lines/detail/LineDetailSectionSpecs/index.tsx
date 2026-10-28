/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Grid, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';

/* * */

export function LineDetailSectionSpecs() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Especificações da Linha">
			<Section gap="sm">
				<Grid columns="ab">
					<StandardFormController
						control={lineDetailContext.form.control}
						name="is_circular_line"
						render={({ field, fieldState }) => (
							<Switch
								checked={!!field.value}
								error={fieldState.error?.message}
								label="Linha Circular"
								onChange={event => field.onChange(event.currentTarget.checked)}
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.is_circular_line.isOptional()}
								w="fit-content"
							/>
						)}
					/>

					<StandardFormController
						control={lineDetailContext.form.control}
						name="is_school_line"
						render={({ field, fieldState }) => (
							<Switch
								checked={!!field.value}
								error={fieldState.error?.message}
								label="Linha Escolar"
								onChange={event => field.onChange(event.currentTarget.checked)}
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.is_school_line.isOptional()}
								w="fit-content"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
