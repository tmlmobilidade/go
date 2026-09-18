'use client';

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { Divider, Section, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepNames() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsCreateFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Transform data

	const automaticShortName = useMemo(() => {
		if (!nameValue) return '';
		return getStopShortName(nameValue);
	}, [nameValue]);

	const automaticTtsName = useMemo(() => {
		if (!nameValue) return '';
		return getStopTtsName(nameValue);
	}, [nameValue]);

	//
	// C. Render components

	return (
		<>

			<Section gap="sm">
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							description={t('default:stops.create.StepNames.fields.name.description')}
							error={fieldState.error?.message}
							label={t('default:stops.create.StepNames.fields.name.label')}
							onChange={field.onChange}
							value={field.value ?? ''}
							w="100%"
							data-autofocus
							required
						/>
					)}
				/>
			</Section>

			<Divider />

			<Section gap="sm">
				<TextInput
					description={t('default:stops.create.StepNames.fields.short_name.description')}
					label={t('default:stops.create.StepNames.fields.short_name.label')}
					value={automaticShortName}
					w="100%"
					readOnly
				/>
				<TextInput
					description={t('default:stops.create.StepNames.fields.tts_name.description')}
					label={t('default:stops.create.StepNames.fields.tts_name.label')}
					value={automaticTtsName}
					w="100%"
					readOnly
				/>
			</Section>

		</>
	);
}
