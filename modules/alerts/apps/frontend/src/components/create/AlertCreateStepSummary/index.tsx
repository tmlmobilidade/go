/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { IconLink } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type I18nCode, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, CoordinatesInput, Grid, Section, Switch, Textarea, TextInput, useHandleUpdate, useMeContext } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

type DescribeAlertReturnType = Record<I18nCode, {
	description: string
	title: string
}>;

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const alertCreateContext = useAlertCreateContext();

	const [userInstructions, setUserInstructions] = useState<string>('');

	//
	// B. Transform data

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertCreateContext.data.form.getValues().reference_type,
		},
	]);

	//
	// C. Handle actions

	const { action: generateText, isLoading: isLoadingGeneratingText } = useHandleUpdate<DescribeAlertReturnType>({
		fetchFn: async () => {
			// Skip if auto texts is not enabled
			if (!alertCreateContext.data.form.getValues().auto_texts) return;
			// Skip if required fields for templating are not filled
			if (!alertCreateContext.data.form.getValues().cause) return;
			if (!alertCreateContext.data.form.getValues().effect) return;
			if (!alertCreateContext.data.form.getValues().reference_type) return;
			if (!alertCreateContext.data.form.getValues().references?.length) return;
			// Generate alert templating and set title and description based on i
			return await fetchData<DescribeAlertReturnType>(API_ROUTES.alerts.ALERTS_DESCRIBE, 'POST', {
				active_period_end_date: alertCreateContext.data.form.getValues().active_period_end_date,
				active_period_start_date: alertCreateContext.data.form.getValues().active_period_start_date,
				agency_id: alertCreateContext.data.form.getValues().agency_id,
				cause: alertCreateContext.data.form.getValues().cause,
				effect: alertCreateContext.data.form.getValues().effect,
				reference_type: alertCreateContext.data.form.getValues().reference_type,
				references: alertCreateContext.data.form.getValues().references,
				user_instructions: userInstructions,
			});
		},
		onError: (error) => {
			// eslint-disable-next-line no-console
			console.error('Error generating alert description', { error });
		},
		onSuccess: (data) => {
			alertCreateContext.data.form.setFieldValue('description', data.pt.description);
			alertCreateContext.data.form.setFieldValue('title', data.pt.title);
		},
	});

	const initialGeneration = useRef(false);

	useEffect(() => {
		if (initialGeneration.current) return;
		initialGeneration.current = true;
		(async () => await generateText())();
	// Run only once:
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//
	// C. Render components

	return (
		<Section gap="md">
			{hasPermissionToEdit && (
				<Switch
					key={alertCreateContext.data.form.key('auto_texts')}
					label={t('default:alerts.create.summary.auto_texts.label')}
					{...alertCreateContext.data.form.getInputProps('auto_texts', { type: 'checkbox' })}
				/>
			)}
			<Grid gap="md">
				<TextInput
					key={alertCreateContext.data.form.key('title')}
					label={t('default:alerts.create.summary.title.label')}
					readOnly={!hasPermissionToEdit}
					{...alertCreateContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={alertCreateContext.data.form.key('description')}
					disabled={isLoadingGeneratingText}
					label={t('default:alerts.create.summary.description.label')}
					minRows={4}
					readOnly={!hasPermissionToEdit}
					autosize
					{...alertCreateContext.data.form.getInputProps('description')}
				/>
				<Button label="Gerar Texto" loading={isLoadingGeneratingText} onClick={generateText} />
				<TextInput
					label={t('default:alerts.create.summary.title.label')}
					onChange={event => setUserInstructions(event.currentTarget.value)}
					readOnly={!hasPermissionToEdit || isLoadingGeneratingText}
					value={userInstructions}
				/>
				<CoordinatesInput
					key={alertCreateContext.data.form.key('coordinates')}
					label={t('default:alerts.create.summary.coordinates.label')}
					{...alertCreateContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					key={alertCreateContext.data.form.key('info_url')}
					description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
					label={t('default:alerts.create.summary.info_url.label')}
					leftSection={<IconLink />}
					placeholder="https://www.cm-setubal.com/..."
					{...alertCreateContext.data.form.getInputProps('info_url')}
				/>
			</Grid>
		</Section>
	);

	//
}
