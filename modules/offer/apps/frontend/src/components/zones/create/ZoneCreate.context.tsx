/* * */

import { closeCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CreateZoneDto, CreateZoneSchema, Zone } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useHandleUpdate, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext } from 'react';
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

	const { formRef } = useTypicalForm<CreateZoneDto>(CreateZoneSchema);

	//
	// D. Handle actions

	const { action: handleCreate, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Zone>(API_ROUTES.offer.ZONES_LIST, 'POST', formRef.current.getValues()),
		onSuccess: (createdItem) => {
			formRef.current.resetDirty();
			allZonesMutate();
			closeCreateZoneModal();
			router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_DETAIL(createdItem._id)));
		},
	});

	//
	// E. Define context value

	const contextValue: ZoneCreateContextState = {
		actions: {
			create: handleCreate,
		},
		data: {
			form: formRef.current,
		},
		flags: {
			isSaving,
		},
	};

	//
	// F. Render components

	return (
		<ZoneCreateContext.Provider value={contextValue}>
			{children}
		</ZoneCreateContext.Provider>
	);

	//
};
