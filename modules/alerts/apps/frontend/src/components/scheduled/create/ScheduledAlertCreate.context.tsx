'use client';

/* * */

import { closeCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Alert, CreateAlertDto, CreateAlertSchema } from '@tmlmobilidade/types';
import { keepUrlParams, UseFormReturnType, useToast, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

/* * */

interface ScheduledAlertCreateContextState {
	actions: {
		saveAlert: () => void
	}
	data: {
		form: UseFormReturnType<CreateAlertDto>
	}
	flags: {
		isSaving: boolean
	}
}

/* * */

const ScheduledAlertCreateContext = createContext<ScheduledAlertCreateContextState | undefined>(undefined);

export function useScheduledAlertCreateContext() {
	const context = useContext(ScheduledAlertCreateContext);
	if (!context) {
		throw new Error('useScheduledAlertCreateContext must be used within a ScheduledAlertCreateContextProvider');
	}
	return context;
}

/* * */

export const ScheduledAlertCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const [isSaving, setIsSaving] = useState(false);

	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create' });

	//
	// B. Fetch data

	const { mutate: allAlertsMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	//
	// D. Handle actions

	const handleCreateAlert = async () => {
		setIsSaving(true);
		const response = await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues());
		if (response.error) {
			if (typeof response.error === 'string') {
				useToast.error({ message: response.error, title: t('error_message_title_create') });
				setIsSaving(false);
				return;
			}
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({ message: error.message, title: t('error_message_title_create') });
			}
			setIsSaving(false);
			return;
		}
		form.reset();
		allAlertsMutate();
		setIsSaving(false);
		closeCreateScheduledAlertModal();
		useToast.success({ message: t('success_message_create'), title: t('success_message_title_create') });
		if (response.data?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_DETAIL(response.data._id)));
	};

	//
	// E. Define context value

	const contextValue: ScheduledAlertCreateContextState = useMemo(() => ({
		actions: {
			saveAlert: handleCreateAlert,
		},
		data: {
			form,
		},
		flags: {
			isSaving,
		},
	}), [
		form,
		isSaving,
	]);

	//
	// F. Render components

	return (
		<ScheduledAlertCreateContext.Provider value={contextValue}>
			{children}
		</ScheduledAlertCreateContext.Provider>
	);

	//
};
