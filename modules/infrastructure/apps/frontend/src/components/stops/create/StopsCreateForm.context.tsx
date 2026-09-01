'use client';

import { StopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { useStandardForm, type UseStandardFormReturnType, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

/* * */

const StopsCreateFormContext = createContext<undefined | UseStandardFormReturnType<StopsCreateRequest>>(undefined);

export function useStopsCreateFormContext() {
	const context = useContext(StopsCreateFormContext);
	if (!context) throw new Error('useStopsCreateFormContext must be used within a StopsCreateFormContextProvider');
	return context;
}

/* * */

export function StopsCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup form

	const formDefaultValues = useMemo<StopsCreateRequest>(() => ({
		latitude: undefined,
		longitude: undefined,
		name: '',
	}), []);

	const { form, isDirty, isValid, unblock } = useStandardForm<StopsCreateRequest, typeof StopsCreateRequestSchema>({
		defaultValues: formDefaultValues,
		schema: StopsCreateRequestSchema,
	});

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });
	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Return state

	return (
		<StopsCreateFormContext.Provider value={{ form, isDirty, isValid, unblock }}>
			{children}
		</StopsCreateFormContext.Provider>
	);
}
