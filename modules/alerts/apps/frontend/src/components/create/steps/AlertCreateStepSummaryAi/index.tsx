/* * */

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { StandardFormController, Divider, Inline, Label, LoadingThinking, Section, Surface, Switch, Text, TextInput, useStandardFormWatch, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAlertsCreateFormContext } from '../../shared/AlertsCreateForm.context';
import { useAlertsComposeData } from './use-alerts-compose-data';

/* * */

export function AlertCreateStepSummaryAi() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();

	const { form: alertsCreateForm } = useAlertsCreateFormContext();

	const { data: composeData, isLoading: isLoadingComposeData, isValidating: isValidatingComposeData } = useAlertsComposeData();

	const agencyIdValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'agency_id' });
	const referenceTypeValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'reference_type' });
	const autoTextsValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'auto_texts' });
	const titleValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'title' });
	const descriptionValue = useStandardFormWatch({ control: alertsCreateForm.control, name: 'description' });

	//
	// B. Transform data

	const hasPermissionToCreate = useMemo(() => meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]), [agencyIdValue, meContext.actions, referenceTypeValue]);

	const hasPermissionToUpdateTexts = useMemo(() => meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: agencyIdValue,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update_texts,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: referenceTypeValue,
		},
	]), [agencyIdValue, meContext.actions, referenceTypeValue]);

	const isProposalAccepted = useMemo(() => {
		const isSameTitle = composeData?.pt?.title === titleValue;
		const isSameDescription = composeData?.pt?.description === descriptionValue;
		return isSameTitle && isSameDescription;
	}, [composeData?.pt?.description, composeData?.pt?.title, descriptionValue, titleValue]);

	//
	// C. Handle actions

	const handleAcceptProposal = () => {
		alertsCreateForm.setValue('title', composeData?.pt?.title);
		alertsCreateForm.setValue('description', composeData?.pt?.description);
	};

	//
	// D. Render components

	return (
		<Section gap="md">
			<Surface variant="bordered" withBackground>

				<Section gap="md">
					{(hasPermissionToCreate || hasPermissionToUpdateTexts) && (
						<StandardFormController
							control={alertsCreateForm.control}
							name="auto_texts"
							render={({ field }) => (
								<Switch
									checked={field.value ?? false}
									disabled={!hasPermissionToUpdateTexts}
									label={t('alerts:create.summary.auto_texts.label')}
									onChange={e => field.onChange(e.currentTarget.checked)}
								/>
							)}
						/>
					)}
					{(autoTextsValue && hasPermissionToCreate) && (
						<StandardFormController
							control={alertsCreateForm.control}
							name="user_instructions"
							render={({ field }) => (
								<TextInput
									label={t('alerts:create.summary.user_instructions.label')}
									loading={isLoadingComposeData}
									onBlur={field.onBlur}
									onChange={e => field.onChange(e.currentTarget.value)}
									placeholder={t('alerts:create.summary.user_instructions.placeholder')}
									value={field.value ?? ''}
									w="100%"
								/>
							)}
						/>
					)}
				</Section>

				{(autoTextsValue && hasPermissionToCreate) && (
					<>

						<Divider lineStyle="dashed" />

						<Section>

							{composeData && (
								<Section gap="sm" padding="none">
									<Label size="md" variant="muted" caps>Proposta</Label>
									<Text weight="semibold">{composeData.pt.title}</Text>
									<Text>{composeData.pt.description}</Text>
									{!isProposalAccepted && <Inline onClick={handleAcceptProposal} dotted>Aceitar proposta</Inline>}
								</Section>
							)}

							<LoadingThinking
								size="md"
								text="Generating summary..."
								visible={isLoadingComposeData || isValidatingComposeData}
							/>

						</Section>

					</>
				)}

			</Surface>
		</Section>
	);
}
