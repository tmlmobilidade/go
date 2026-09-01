'use client';

import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { useMeData, useMultiStep, type UseMultiStepReturnType, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useStopsGetLocationData } from '../shared/use-stops-get-location-data';
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

	const { data: locationData } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// E. Multi-step setup

	const hasCreateStopsPermission = useMemo(() => {
		// Return false is municipality is not available
		if (!locationData?.municipality?._id) return false;
		// Check if the user is allowed to create stops in the municipality
		return hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'create', scope: 'stops' },
			requiredValue: locationData.municipality._id,
			resourceKey: 'municipality_ids',
		});
	}, [locationData?.municipality?._id, meData?.permissions]);

	const steps = useMemo(() => [
		{
			id: 'location',
			isEnabled: true,
			isValid: !!latitudeValue && !!longitudeValue && hasCreateStopsPermission,
			isVisible: true,
			label: 'Localização',
			order: 0,
			validate: () => !!form.getValues('latitude') && !!form.getValues('longitude') && hasCreateStopsPermission,
		},
		{
			id: 'names',
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
	], [form, hasCreateStopsPermission, latitudeValue, longitudeValue, nameValue]);

	const multiStep = useMultiStep({ steps });

	//
	// H. Return state

	return (
		<StopsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</StopsCreateFormStepsContext.Provider>
	);
}
