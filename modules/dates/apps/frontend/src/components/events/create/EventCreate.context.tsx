/* * */

import { closeCreateEventModal } from '@/components/events/create/EventCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type CreateEventDto, CreateEventSchema, type Event } from '@tmlmobilidade/types';
import { keepUrlParams, type UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import useSWR from 'swr';

/* * */

interface EventCreateContextState {
	actions: {
		createEvent: () => Promise<void>
	}
	data: {
		form: UseFormReturnType<CreateEventDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const EventCreateContext = createContext<EventCreateContextState | undefined>(undefined);

export function useEventCreateContext() {
	const context = useContext(EventCreateContext);
	if (!context) {
		throw new Error('useEventCreateContext must be used within a EventCreateContextProvider');
	}
	return context;
}

/* * */

export const EventCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	//
	// B. Fetch data

	const { mutate: allEventsMutate } = useSWR<Event[]>(API_ROUTES.dates.EVENTS_LIST);

	//
	// C. Setup form

	const { formRef } = useTypicalForm<CreateEventDto>(CreateEventSchema);

	//
	// D. Handle actions

	const handleCreateEvent = async () => {
		setIsSaving(true);
		const response = await fetchData<Event>(API_ROUTES.dates.EVENTS_LIST, 'POST', formRef.current.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: 'Erro ao criar Evento' });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: 'Erro ao criar Evento' });
			}
			setIsSaving(false);
			return;
		}
		formRef.current.reset();
		allEventsMutate();
		setIsSaving(false);
		closeCreateEventModal();
		useToast.success({ message: 'Evento criada com sucesso', title: 'Sucesso' });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.dates.EVENTS_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: EventCreateContextState = {
		actions: {
			createEvent: handleCreateEvent,
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
		<EventCreateContext.Provider value={contextValue}>
			{children}
		</EventCreateContext.Provider>
	);

	//
};
