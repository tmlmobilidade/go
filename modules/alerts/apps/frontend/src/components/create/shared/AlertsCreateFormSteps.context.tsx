'use client';

import { isValidOptionalAlertCoordinates } from '@/lib/alert-coordinates';
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
			isValid: () => !!createAlertForm.getValues('agency_id'),
			isVisible: agenciesData?.length > 1,
			label: 'Operador',
			order: 0,
		},
		{
			id: 'cause',
			isEnabled: !!agencyIdValue,
			isValid: () => !!createAlertForm.getValues('cause'),
			isVisible: true,
			label: 'Causa',
			order: 1,
		},
		{
			id: 'effect',
			isEnabled: !!agencyIdValue && !!causeValue,
			isValid: () => !!createAlertForm.getValues('effect'),
			isVisible: true,
			label: 'Efeito',
			order: 2,
		},
		{
			id: 'dates',
			isEnabled: !!agencyIdValue && !!causeValue && !!effectValue,
			isValid: () => !!createAlertForm.getValues('active_period_end_date'),
			isVisible: hasCreateDatesPermission,
			label: 'Datas',
			order: 3,
		},
		{
			id: 'references',
			isEnabled: !!agencyIdValue && !!causeValue && !!effectValue && !!activePeriodEndDateValue,
			isValid: () => !!createAlertForm.getValues('reference_type') && !!createAlertForm.getValues('agency_id') && !!createAlertForm.getValues('references')?.length,
			isVisible: true,
			label: 'Referências',
			order: 4,
		},
		{
			id: 'summary',
			isEnabled: !!agencyIdValue && !!causeValue && !!effectValue && !!activePeriodEndDateValue && !!referenceTypeValue && !!referencesValue?.length,
			isValid: () => !!createAlertForm.getValues('cause') && !!createAlertForm.getValues('effect') && !!createAlertForm.getValues('active_period_end_date') && !!createAlertForm.getValues('reference_type') && !!createAlertForm.getValues('agency_id') && !!createAlertForm.getValues('references')?.length && !!createAlertForm.getValues('title')?.length && !!createAlertForm.getValues('description')?.length && isValidOptionalAlertCoordinates(createAlertForm.getValues('coordinates')),
			isVisible: true,
			label: 'Resumo',
			order: 5,
		},
	], [agenciesData?.length, agencyIdValue, causeValue, effectValue, hasCreateDatesPermission, activePeriodEndDateValue, referenceTypeValue, referencesValue?.length, createAlertForm]);

	const multiStep = useMultiStep({ steps });

	//
	// H. Return state

	return (
		<AlertsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</AlertsCreateFormStepsContext.Provider>
	);
}
