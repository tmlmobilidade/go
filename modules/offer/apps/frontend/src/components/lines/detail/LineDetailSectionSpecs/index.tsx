/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Grid, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function LineDetailSectionSpecs() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineDetailContext = useLineDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('lines:detail.LineDetailSectionSpecs.line_specs')}>
			<Section gap="sm">
				<Grid columns="ab">
					<StandardFormController
						control={lineDetailContext.form.control}
						name="is_circular_line"
						render={({ field, fieldState }) => (
							<Switch
								checked={!!field.value}
								error={fieldState.error?.message}
								label={t('lines:detail.LineDetailSectionSpecs.circular_line')}
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
								label={t('lines:detail.LineDetailSectionSpecs.school_line')}
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
