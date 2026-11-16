'use client';

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { Divider, Pane, Section, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStopsDetailUpdateNameFormContext } from '../StopsDetailUpdateNameForm.context';
import { StopsDetailUpdateNameModalHeader } from '../StopsDetailUpdateNameModalHeader';

/* * */

export function StopsDetailUpdateNameModal() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsDetailUpdateNameFormContext();

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
	// C. Sync automatic values into the form so they are submitted

	useEffect(() => {
		form.setValue('short_name', automaticShortName, { shouldDirty: true });
		form.setValue('tts_name', automaticTtsName, { shouldDirty: true });
	}, [automaticShortName, automaticTtsName, form]);

	//
	// D. Render components

	return (
		<Pane header={[<StopsDetailUpdateNameModalHeader key="header" />]}>

			<Section>
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							description={t('stops:detail.StopsDetailUpdateNameModal.fields.name.description')}
							disabled={field.disabled}
							error={fieldState.error?.message}
							label={t('stops:detail.StopsDetailUpdateNameModal.fields.name.label')}
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
					description={t('stops:detail.StopsDetailUpdateNameModal.fields.short_name.description')}
					label={t('stops:detail.StopsDetailUpdateNameModal.fields.short_name.label')}
					value={automaticShortName}
					w="100%"
					readOnly
				/>
				<TextInput
					description={t('stops:detail.StopsDetailUpdateNameModal.fields.tts_name.description')}
					label={t('stops:detail.StopsDetailUpdateNameModal.fields.tts_name.label')}
					value={automaticTtsName}
					w="100%"
					readOnly
				/>
			</Section>

		</Pane>
	);
}
