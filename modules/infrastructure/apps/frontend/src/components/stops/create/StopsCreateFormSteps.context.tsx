'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { useMeData, useMultiStep, type UseMultiStepReturnType, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();

	const { data: meData } = useMeData();

	const { form } = useStopsCreateFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Fetch data

	const { data: locationData } = useStopsGetLocationData({
		latitude: latitudeValue,
		longitude: longitudeValue,
	});

	//
	// C. Setup flags

	const hasCreateStopsPermission = useMemo(() => {
		// Return false if municipality is not available
		if (!locationData?.municipality?._id) return false;
		// Check if the user is allowed to create stops in the municipality
		return PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.create,
			permissions: meData?.permissions,
			resource_key: 'municipality_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: locationData.municipality._id,
		});
	}, [locationData?.municipality?._id, meData?.permissions]);

	//
	// D. Setup steps

	const steps = useMemo(() => [
		{
			id: 'location',
			isEnabled: true,
			isValid: !!latitudeValue && !!longitudeValue && hasCreateStopsPermission,
			isVisible: true,
			label: t('default:stops.create.steps.location.label'),
			order: 0,
			validate: () => !!form.getValues('latitude') && !!form.getValues('longitude') && hasCreateStopsPermission,
		},
		{
			id: 'names',
			isEnabled: !!latitudeValue && !!longitudeValue,
			isValid: !!nameValue,
			isVisible: true,
			label: t('default:stops.create.steps.names.label'),
			order: 1,
			validate: () => !!form.getValues('name'),
		},
		{
			id: 'summary',
			isEnabled: !!nameValue,
			isValid: !!nameValue,
			isVisible: true,
			label: t('default:stops.create.steps.summary.label'),
			order: 2,
			validate: () => !!form.getValues('name'),
		},
	], [form, hasCreateStopsPermission, latitudeValue, longitudeValue, nameValue, t]);

	const multiStep = useMultiStep({ steps });

	//
	// E. Render components

	return (
		<StopsCreateFormStepsContext.Provider value={multiStep}>
			{children}
		</StopsCreateFormStepsContext.Provider>
	);
}
