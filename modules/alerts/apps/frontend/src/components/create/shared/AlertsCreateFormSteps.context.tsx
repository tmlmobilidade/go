'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useContextFormWatch, useDataAgencies, useMeContext, useMultiStep, type UseMultiStepReturnType } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useAlertsCreateFormContext } from './AlertsCreateForm.context';

/* * */

const AlertsCreateFormStepsContext = createContext<undefined | UseMultiStepReturnType>(undefined);

export function useAlertsCreateFormStepsContext() {
	const context = useContext(AlertsCreateFormStepsContext);
	if (!context) throw new Error('useAlertsCreateFormStepsContext must be used within a AlertsCreateFormStepsContextProvider');
	return context;
}

/* * */

export function AlertsCreateFormStepsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	const { form: createAlertForm } = useAlertsCreateFormContext();

	const agencyIdValue = useContextFormWatch({ control: createAlertForm.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: createAlertForm.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: createAlertForm.control, name: 'effect' });
	const activePeriodEndDateValue = useContextFormWatch({ control: createAlertForm.control, name: 'active_period_end_date' });
	const referenceTypeValue = useContextFormWatch({ control: createAlertForm.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: createAlertForm.control, name: 'references' });
	const titleValue = useContextFormWatch({ control: createAlertForm.control, name: 'title' });
	const descriptionValue = useContextFormWatch({ control: createAlertForm.control, name: 'description' });

	//
	// C. Fetch data

	const { filtered: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// E. Multi-step setup

	const hasCreateDatesPermission = useMemo(() => {
		return meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates);
	}, [meContext.actions]);

	const steps = useMemo(() => [
		{
			id: 'agency',
			isEnabled: true,
			isValid: !!agencyIdValue,
			isVisible: agenciesData?.length > 1,
			label: 'Operador',
			order: 0,
			validate: () => !!createAlertForm.getValues('agency_id'),
		},
		{
			id: 'cause',
			isEnabled: !!agencyIdValue,
			isValid: !!causeValue,
			isVisible: true,
			label: 'Causa',
			order: 1,
			validate: () => !!createAlertForm.getValues('cause'),
		},
		{
			id: 'effect',
			isEnabled: !!agencyIdValue && !!causeValue,
			isValid: !!effectValue,
			isVisible: true,
			label: 'Efeito',
			order: 2,
			validate: () => !!createAlertForm.getValues('effect'),
		},
		{
			id: 'dates',
			isEnabled: !!agencyIdValue && !!causeValue && !!effectValue,
			isValid: !!activePeriodEndDateValue,
			isVisible: hasCreateDatesPermission,
			label: 'Datas',
			order: 3,
			validate: () => !!createAlertForm.getValues('active_period_end_date'),
		},
		{
			id: 'references',
			isEnabled: !!agencyIdValue && !!causeValue && !!effectValue && !!activePeriodEndDateValue,
			isValid: !!referenceTypeValue && !!referencesValue?.length,
			isVisible: true,
			label: 'Referências',
			order: 4,
			validate: () => !!createAlertForm.getValues('reference_type') && !!createAlertForm.getValues('references')?.length,
		},
		{
			id: 'summary',
			isEnabled: !!causeValue && !!effectValue && !!activePeriodEndDateValue && !!referenceTypeValue && !!referencesValue?.length,
			isValid: !!titleValue && !!descriptionValue,
			isVisible: true,
			label: 'Resumo',
			order: 5,
			validate: () => !!createAlertForm.getValues('title')?.length && !!createAlertForm.getValues('description')?.length,
		},
	], [agencyIdValue, agenciesData?.length, causeValue, effectValue, activePeriodEndDateValue, hasCreateDatesPermission, referenceTypeValue, referencesValue?.length, titleValue, descriptionValue, createAlertForm]);

	const multiStep = useMultiStep({ steps });

	//
	// H. Return state

	return (
		<AlertsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</AlertsCreateFormStepsContext.Provider>
	);
}
