'use client';

import { TypologySchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, ColorInput, Grid, LineDisplay, Section, Spacer, StandardFormController, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesDetailFormContext } from '../TypologiesDetailForm.context';

/* * */

export function TypologyDetailSectionStyles() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useTypologiesDetailFormContext();
	const values = useStandardFormWatch({ control: form.control });

	//
	// B. Render components

	return (
		<Collapsible title={t('default:typologies.sections.styles')}>
			<Section gap="sm">
				<LineDisplay color={values.color} longName={t('default:typologies.preview')} shortName="1234" textColor={values.text_color} />
				<Spacer />
				<Grid columns="ab" gap="lg">

					<StandardFormController
						control={form.control}
						name="color"
						render={({ field, fieldState }) => (
							<ColorInput
								error={fieldState.error?.message}
								label={t('default:typologies.fields.color.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								w="100%"
								withAsterisk={!TypologySchema.shape.color.isOptional()}
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="text_color"
						render={({ field, fieldState }) => (
							<ColorInput
								error={fieldState.error?.message}
								label={t('default:typologies.fields.text_color.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								w="100%"
								withAsterisk={!TypologySchema.shape.text_color.isOptional()}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
