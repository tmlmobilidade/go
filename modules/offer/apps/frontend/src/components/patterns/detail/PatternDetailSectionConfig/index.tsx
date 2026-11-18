/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { PatternDirectionValues, PatternSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternDetailSectionConfig() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = usePatternDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('patterns:detail.PatternDetailSectionConfig.pattern_config')}>
			<Section gap="sm">
				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							{...field}
							error={fieldState.error?.message}
							label={t('patterns:detail.PatternDetailSectionConfig.code')}
							placeholder={t('patterns:detail.PatternDetailSectionConfig.code_example')}
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
								label={t('patterns:detail.PatternDetailSectionConfig.origin')}
								placeholder={t('patterns:detail.PatternDetailSectionConfig.destination_example')}
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
								label={t('patterns:detail.PatternDetailSectionConfig.destination')}
								placeholder={t('patterns:detail.PatternDetailSectionConfig.destination_example')}
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
							data={PatternDirectionValues.map(value => ({ label: t(`patterns:detail.PatternDetailSectionConfig.direction_options.${value}`), value }))}
							error={fieldState.error?.message}
							label={t('patterns:detail.PatternDetailSectionConfig.direction')}
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
							label={t('patterns:detail.PatternDetailSectionConfig.headsign')}
							placeholder={t('patterns:detail.PatternDetailSectionConfig.destination_example')}
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
