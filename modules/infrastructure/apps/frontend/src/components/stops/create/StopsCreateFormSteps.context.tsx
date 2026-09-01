'use client';

import { hasPermission } from '@tmlmobilidade/go-types-permissions';
import { useMeData, useMultiStep, type UseMultiStepReturnType, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useStopsCreateFormContext } from './StopsCreateForm.context';

/* * */

const StopsCreateFormStepsContext = createContext<undefined | UseMultiStepReturnType>(undefined);

export function useStopsCreateFormStepsContext() {
	const context = useContext(StopsCreateFormStepsContext);
	if (!context) throw new Error('useStopsCreateFormStepsContext must be used within a StopsCreateFormStepsContextProvider');
	return context;
}

/* * */

export function StopsCreateFormStepsContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// E. Multi-step setup

	const hasCreateDatesPermission = useMemo(() => {
		return hasPermission(meData?.permissions, {
			action: 'update_dates',
			scope: 'stops',
		});
	}, [meData?.permissions]);

	const steps = useMemo(() => [
		{
			id: 'location',
			isEnabled: true,
			isValid: !!latitudeValue && !!longitudeValue,
			isVisible: true,
			label: 'Localização',
			order: 0,
			validate: () => !!form.getValues('latitude') && !!form.getValues('longitude'),
		},
		{
			id: 'cause',
			isEnabled: !!latitudeValue && !!longitudeValue,
			isValid: !!nameValue,
			isVisible: true,
			label: 'Causa',
			order: 1,
			validate: () => !!form.getValues('name'),
		},
		{
			id: 'summary',
			isEnabled: !!nameValue,
			isValid: !!nameValue,
			isVisible: true,
			label: 'Resumo',
			order: 2,
			validate: () => !!form.getValues('name'),
		},
	], [form, latitudeValue, longitudeValue, nameValue]);

	const multiStep = useMultiStep({ steps });

	//
	// H. Return state

	return (
		<StopsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</StopsCreateFormStepsContext.Provider>
	);
}
