'use client';

import { usePatternCreateContext } from '@/components/patterns/create/PatternCreate.context';
import { PatternSchema } from '@tmlmobilidade/go-types-offer';
import { Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
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
						label={t('patterns:create.PatternCreateBasicInfo.code')}
						placeholder={t('patterns:create.PatternCreateBasicInfo.code_example')}
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
						label={t('patterns:create.PatternCreateBasicInfo.origin')}
						placeholder={t('patterns:create.PatternCreateBasicInfo.destination_example')}
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
						label={t('patterns:create.PatternCreateBasicInfo.destination')}
						placeholder={t('patterns:create.PatternCreateBasicInfo.destination_example')}
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
						label={t('patterns:create.PatternCreateBasicInfo.headsign')}
						placeholder={t('patterns:create.PatternCreateBasicInfo.destination_example')}
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
