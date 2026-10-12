'use client';

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { Divider, ErrorDisplay, MultiSelect, Section, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepNames() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { agencies, agenciesValid, form } = useStopsCreateFormContext();

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

	const agenciesMessage = agencies.isLoading
		? t('default:stops.create.StepNames.fields.agency_ids.loading')
		: agencies.error || !agencies.data
			? t('default:stops.create.StepNames.fields.agency_ids.unavailable')
			: !agencies.ids.length
				? t('default:stops.create.StepNames.fields.agency_ids.empty')
				: null;

	//
	// C. Render components

	return (
		<>

			<Section gap="sm">
				{agenciesMessage && <ErrorDisplay message={agenciesMessage} />}
				{!agenciesMessage && agencies.ids.length > 1 && (
					<StandardFormController
						control={form.control}
						name="agency_ids"
						render={({ field }) => (
							<MultiSelect
								data={agencies.options}
								description={t('default:stops.create.StepNames.fields.agency_ids.description')}
								error={!agenciesValid ? t('default:stops.create.StepNames.fields.agency_ids.required') : undefined}
								label={t('default:stops.create.StepNames.fields.agency_ids.label')}
								onChange={field.onChange}
								value={field.value ?? []}
								w="100%"
								required
							/>
						)}
					/>
				)}
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
