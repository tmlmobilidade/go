// 'use client';

// import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
// import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
// import { type CreateStopDto, type Stop, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
// import { CreateContextStateTemplate, fetchApiData, keepUrlParams, useHandleUpdate, useLocationsContext, useMultiStep, UseMultiStepReturnType, useStandardForm, useStandardFormWatch } from '@tmlmobilidade/ui';
// import { useRouter } from 'next/navigation';
// import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
// import useSWR from 'swr';

// import { closeStopCreateModal } from './StopsCreate.modal';

// /* * */

// interface StopCreateContextState extends CreateContextStateTemplate<CreateStopDto> {
// 	form: CreateContextStateTemplate<CreateStopDto>['form'] & {
// 		multi_step: UseMultiStepReturnType
// 	}
// }

// /* * */

// const StopCreateContext = createContext<StopCreateContextState | undefined>(undefined);

// export function useStopCreateContext() {
// 	const context = useContext(StopCreateContext);
// 	if (!context) {
// 		throw new Error('useStopCreateContext must be used within a StopCreateContextProvider');
// 	}
// 	return context;
// }

// /* * */

// export const StopCreateContextProvider = ({ children }: PropsWithChildren) => {
// 	//

// 	//
// 	// A. Setup variables

// 	const locationsContext = useLocationsContext();
// 	const router = useRouter();

// 	//
// 	// B. Setup form

// 	const { form, unblock } = useStandardForm<CreateStopDto, typeof StopSchema>({
// 		// schema: CreateStopSchema,
// 	});

// 	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });
// 	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
// 	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

// 	const [loadingLocations, setLoadingLocations] = useState(false);

// 	//
// 	// C. Fetch data

// 	const { mutate: allStopsMutate } = useSWR<Stop[]>(API_ROUTES.infrastructure.STOPS_LIST);

// 	//
// 	// D. Side Effects

// 	/**
// 	 * Sets the abbreviated and TTS names when the name changes.
// 	 */
// 	useEffect(() => {
// 		// Reset the fields if the name is not a string
// 		if (typeof nameValue !== 'string') {
// 			form.resetField('short_name');
// 			form.resetField('tts_name');
// 			return;
// 		}

// 		// Build the abbreviated and TTS names
// 		const shortName = getStopShortName(nameValue);
// 		const ttsName = getStopTtsName(nameValue);

// 		// Set the form values
// 		form.setValue('short_name', shortName);
// 		form.setValue('tts_name', ttsName);
// 	}, [nameValue, form]);

// 	/**
// 	 * Fetches Location data when the latitude and longitude change.
// 	 */
// 	useEffect(() => {
// 		if (!latitudeValue || !longitudeValue) return;
// 		setLoadingLocations(true);
// 		locationsContext.actions.queryLocation(latitudeValue, longitudeValue).then((location) => {
// 			if (!location) return;
// 			form.setValue('district_id', location.district?._id);
// 			form.setValue('municipality_id', location.municipality?._id);
// 			form.setValue('parish_id', location.parish?._id);
// 			form.setValue('locality_id', location.locality?._id);
// 		}).finally(() => setLoadingLocations(false));
// 	}, [latitudeValue, longitudeValue]);

// 	//
// 	// E. Multi-step setup
// 	// Steps are memoized so useMultiStep only recalculates when agencies or permissions change,
// 	// not on every form value change.

// 	const steps = useMemo(() => [
// 		{
// 			id: 'location',
// 			isEnabled: true,
// 			isValid: !!form.getValues('latitude') && !!form.getValues('longitude') && !!form.getValues('district_id') && !!form.getValues('municipality_id') && !!form.getValues('parish_id'),
// 			isVisible: true,
// 			label: 'Localização',
// 			order: 0,
// 			validate: () => !!form.getValues('latitude') && !!form.getValues('longitude') && !!form.getValues('district_id') && !!form.getValues('municipality_id') && !!form.getValues('parish_id'),
// 		},
// 		{
// 			id: 'names',
// 			isEnabled: true,
// 			isValid: !!form.getValues('name') && !!form.getValues('short_name') && !!form.getValues('tts_name'),
// 			isVisible: true,
// 			label: 'Nomes',
// 			order: 1,
// 			validate: () => !!form.getValues('name') && !!form.getValues('short_name') && !!form.getValues('tts_name'),
// 		},
// 		{
// 			id: 'summary',
// 			isEnabled: true,
// 			isValid: true,
// 			isVisible: true,
// 			label: 'Resumo',
// 			order: 2,
// 			validate: () => true,
// 		},
// 	], [form]);

// 	const multiStep = useMultiStep({ steps });

// 	//
// 	// F. Submit action

// 	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
// 		fetchFn: async () => await fetchApiData<Stop>({ body: form.getValues(), method: 'POST', url: API_ROUTES.infrastructure.STOPS_CREATE }),
// 		onSuccess: ({ data }) => {
// 			form.reset();
// 			unblock();
// 			allStopsMutate();
// 			if (data?._id) router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(data._id))));
// 			closeStopCreateModal();
// 		},
// 	});

// 	const contextValue = useMemo<StopCreateContextState>(() => ({
// 		actions: {
// 			create: handleCreate,
// 		},
// 		flags: {
// 			canCreate: true,
// 			error: undefined,
// 			isCreating: isCreating,
// 			isLoading: loadingLocations,
// 		},
// 		form: {
// 			instance: form,
// 			multi_step: multiStep,
// 		},
// 	}), [form, handleCreate, isCreating, loadingLocations, multiStep]);

// 	//
// 	// E. Render components

// 	return (
// 		<StopCreateContext.Provider value={contextValue}>
// 			{children}
// 		</StopCreateContext.Provider>
// 	);

// 	//
// };
