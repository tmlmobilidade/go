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
	if (!context) {
		throw new Error('useAlertsCreateFormStepsContext must be used within a AlertsCreateFormStepsContextProvider');
	}
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
	const referenceTypeValue = useContextFormWatch({ control: createAlertForm.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: createAlertForm.control, name: 'references' });
	const activePeriodEndDateValue = useContextFormWatch({ control: createAlertForm.control, name: 'active_period_end_date' });
	const coordinatesValue = useContextFormWatch({ control: createAlertForm.control, name: 'coordinates' });
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

	const steps = useMemo(() => [
		{
			id: 'agency',
			isValid: () => !!agencyIdValue,
			isVisible: agenciesData?.length > 1,
			label: 'Operador',
			order: 0,
		},
		{
			id: 'cause',
			isEnabled: () => !!agencyIdValue,
			isValid: () => !!causeValue,
			isVisible: true,
			label: 'Causa',
			order: 1,
		},
		{
			id: 'effect',
			isEnabled: () => !!agencyIdValue && !!causeValue,
			isValid: () => !!effectValue,
			isVisible: true,
			label: 'Efeito',
			order: 2,
		},
		{
			id: 'dates',
			isEnabled: () => !!agencyIdValue && !!causeValue && !!effectValue,
			isValid: () => !!activePeriodEndDateValue,
			isVisible: meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates),
			label: 'Datas',
			order: 3,
		},
		{
			id: 'references',
			isEnabled: () => !!causeValue && !!effectValue && !!agencyIdValue && !!activePeriodEndDateValue,
			isValid: () => !!referenceTypeValue && !!agencyIdValue && !!referencesValue?.length,
			isVisible: true,
			label: 'Referências',
			order: 4,
		},
		{
			id: 'summary',
			isEnabled: () => !!causeValue && !!effectValue && !!activePeriodEndDateValue && !!referenceTypeValue && !!agencyIdValue && !!referencesValue?.length,
			isValid: () => (
				!!causeValue
				&& !!effectValue
				&& !!activePeriodEndDateValue
				&& !!referenceTypeValue
				&& !!agencyIdValue
				&& !!referencesValue?.length
				&& !!titleValue?.length
				&& !!descriptionValue?.length
				&& isValidOptionalAlertCoordinates(coordinatesValue)
			),
			isVisible: true,
			label: 'Resumo',
			order: 5,
		},
	], [agenciesData?.length, meContext.actions, agencyIdValue, causeValue, effectValue, activePeriodEndDateValue, referenceTypeValue, referencesValue?.length, titleValue?.length, descriptionValue?.length, coordinatesValue]);

	const multiStep = useMultiStep({ steps });

	//
	// H. Return state

	return (
		<AlertsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</AlertsCreateFormStepsContext.Provider>
	);
}
