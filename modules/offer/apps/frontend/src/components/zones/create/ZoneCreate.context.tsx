/* * */

import { closeCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateZoneDto, CreateZoneSchema, Zone } from '@tmlmobilidade/go-types-offer';
import { fetchApiData, keepUrlParams, type UseFormReturnType, useHandleAction, useTypicalForm } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface ZoneCreateContextState {
	actions: {
		create: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateZoneDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const ZoneCreateContext = createContext<undefined | ZoneCreateContextState>(undefined);

export function useZoneCreateContext() {
	const context = useContext(ZoneCreateContext);
	if (!context) {
		throw new Error('useZoneCreateContext must be used within a ZoneCreateContextProvider');
	}
	return context;
}

/* * */

export const ZoneCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Fetch data

	const { mutate: allZonesMutate } = useSWR<Zone[]>(API_ROUTES.offer.ZONES_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateZoneDto>(CreateZoneSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleAction({
		fetchFn: async () => await fetchApiData<Zone>({ body: form.getValues(), method: 'POST', url: API_ROUTES.offer.ZONES_LIST }),
		onSuccess: ({ data }) => {
			form.resetDirty();
			allZonesMutate();
			closeCreateZoneModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_DETAIL(data._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: ZoneCreateContextState = useMemo(() => {
		return {
			actions: {
				create: handleCreate,
			},
			data: {
				form,
			},
			flags: {
				isSaving,
			},
		};
	}, [
		form,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<ZoneCreateContext.Provider value={contextValue}>
			{children}
		</ZoneCreateContext.Provider>
	);

	//
};
