'use client';

import { Routes } from '@/lib/routes';
import { Permissions } from '@tmlmobilidade/lib';
import { Agency, AgencySchema, CreateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';
import { FormValidateInput, useForm, UseFormReturnType, useToast, zodResolver } from '@tmlmobilidade/ui';
import { fetchData, swrFetcher } from '@tmlmobilidade/utils';
import { convertObject, Dates } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';

export enum AgencyDetailMode {
	CREATE = 'create',
	EDIT = 'edit',
}

export const availablePermissions = Object.entries(Permissions).map(([scope, value]) => ({
	children: Object.entries(value.actions).map(([action]) => ({
		label: action,
		value: `${scope}-${action}`,
	})),
	label: scope,
	value: scope,
}));

interface AgencyDetailContextState {
	actions: {
		deleteAgency: () => void
		saveAgency: () => void
	}
	data: {
		form: UseFormReturnType<CreateAgencyDto>
		id: string | undefined
	}
	flags: {
		canSave: boolean
		isReadOnly: boolean
		isSaving: boolean
		loading: boolean
		mode: AgencyDetailMode
	}
}

const emptyAgency: CreateAgencyDto = {
	_id: '',
	email: '',
	fare_url: '',
	is_locked: false,
	lang: '',
	name: '',
	operation_start_date: Dates.now('Europe/Lisbon').operational_date,
	phone: '',
	price_per_km: 0,
	timezone: '',
	total_vkm_per_year: 0,
	url: '',
};

const AgencyDetailContext = createContext<AgencyDetailContextState | undefined>(undefined);

export function useAgencyDetailContext() {
	const context = useContext(AgencyDetailContext);
	if (!context) {
		throw new Error('useAgencyDetailContext must be used within a AgencyDetailContextProvider');
	}
	return context;
}

export const AgencyDetailContextProvider = ({ agency_id, children }: { agency_id: string, children: React.ReactNode }) => {
	//
	// A. Setup variables
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isReadOnly] = useState(false);
	const [canSave, setCanSave] = useState(false);

	const { data: agency, isLoading } = useSWR<Agency>(agency_id === 'new' ? null : Routes.API(Routes.AGENCY_DETAIL(agency_id)), swrFetcher);

	//
	// B. Define form
	const form = useForm<CreateAgencyDto>({
		initialValues: agency || emptyAgency,
		validate: zodResolver(AgencySchema) as unknown as FormValidateInput<CreateAgencyDto>,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	// Update form
	useEffect(() => {
		if (!agency) return;

		setLoading(true);

		form.initialize(agency);

		setLoading(false);
	}, [agency]);

	//
	// C. Transform Data
	// Validate form on change
	useEffect(() => {
		form.validate();
		setCanSave(form.isValid());
	}, [form.values]);

	//
	// D. Handle actions
	const handleSaveAgency = async () => {
		setIsSaving(true);
		const method = agency_id === 'new' ? 'POST' : 'PUT';
		const url = agency_id === 'new' ? Routes.API(Routes.AGENCY_LIST) : Routes.API(Routes.AGENCY_DETAIL(agency_id));
		const body = agency_id === 'new' ? form.values : convertObject(form.values, UpdateAgencySchema);
		const response = await fetchData<Agency>(url, method, body);

		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao salvar utilizador',
				});
			}

			return;
		}

		useToast.success({
			message: 'Utilizador salvo com sucesso',
			title: 'Sucesso',
		});

		if (agency_id === 'new' && response.data?._id) {
			router.replace(Routes.AGENCY_DETAIL(response.data._id));
		}

		setIsSaving(false);
	};

	const handleDeleteAgency = async () => {
		if (agency_id === 'new') return;

		const response = await fetchData<Agency>(Routes.API(Routes.AGENCY_DETAIL(agency_id)), 'DELETE', agency);
		if (response.error) {
			const errors = JSON.parse(response.error);
			for (const error of errors) {
				useToast.error({
					message: error.message,
					title: 'Erro ao apagar utilizador',
				});
			}
			return;
		}

		useToast.success({
			message: 'Utilizador apagado com sucesso',
			title: 'Sucesso',
		});

		router.replace(Routes.AGENCY_LIST);
	};

	//
	// E. Define context value
	const contextValue: AgencyDetailContextState = {
		actions: {
			deleteAgency: handleDeleteAgency,
			saveAgency: handleSaveAgency,
		},
		data: {
			form,
			id: agency_id === 'new' ? undefined : agency_id,
		},
		flags: {
			canSave,
			isReadOnly,
			isSaving,
			loading: isLoading || loading,
			mode: agency_id === 'new' ? AgencyDetailMode.CREATE : AgencyDetailMode.EDIT,
		},
	};

	//
	// F. Render components
	return (
		<AgencyDetailContext.Provider value={contextValue}>
			{children}
		</AgencyDetailContext.Provider>
	);
};
