'use client';

import { API_ROUTES, HttpException } from '@tmlmobilidade/consts';
import { type CalculateVkmDto, type OperationalDate, type VkmCalculationMethod, type VkmCalculationResult, type VkmExtensionSource } from '@tmlmobilidade/types';
import { useForm } from '@tmlmobilidade/ui';
import { type UseFormReturnType, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export interface VkmModalFormValues {
	agency_id: null | string
	calculation_method: VkmCalculationMethod
	end_date: null | OperationalDate
	extension_source: VkmExtensionSource
	start_date: null | OperationalDate
}

interface VkmModalContextState {
	actions: {
		calculateVkm: () => void
		setCalculationMethod: (value: VkmCalculationMethod) => void
	}
	data: {
		form: UseFormReturnType<VkmModalFormValues>
		result: null | VkmCalculationResult
	}
	flags: {
		canSave: boolean
		loading: boolean
	}
}

/* * */

const VkmModalContext = createContext<undefined | VkmModalContextState>(undefined);

export function useVkmModalContext() {
	const context = useContext(VkmModalContext);
	if (!context) {
		throw new Error('useVkmModalContext must be used within a VkmModalContextProvider');
	}
	return context;
}

/* * */

export const VkmModalContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const form = useForm<VkmModalFormValues>({
		initialValues: {
			agency_id: null,
			calculation_method: 'rolling_year',
			end_date: null,
			extension_source: 'go',
			start_date: null,
		},
		mode: 'controlled',
	});

	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<null | VkmCalculationResult>(null);

	//
	// B. Handle actions

	const setCalculationMethod = useCallback((value: VkmCalculationMethod) => {
		form.setValues({
			calculation_method: value,
			...(value === 'rolling_year' ? { end_date: null } : {}),
		});
	}, [form]);

	const calculateVkm = useCallback(async () => {
		const values = form.getValues();

		if (!values.agency_id || !values.start_date) return;
		if (values.calculation_method === 'fixed_range' && !values.end_date) return;

		const payload: CalculateVkmDto = {
			agency_id: values.agency_id,
			calculation_method: values.calculation_method,
			end_date: values.calculation_method === 'fixed_range' ? values.end_date : null,
			extension_source: values.extension_source,
			start_date: values.start_date,
		};

		try {
			setLoading(true);
			setResult(null);

			const response = await fetchData<VkmCalculationResult>(API_ROUTES.offer.VKM_CALCULATE, 'POST', payload);

			if (response.error || !response.data) {
				throw new HttpException(response.statusCode, response.error ?? 'Erro ao calcular VKM');
			}

			setResult(response.data);
		} catch (error) {
			useToast.error({ message: error instanceof Error ? error.message : 'Erro ao calcular VKM', title: 'Erro' });
		} finally {
			setLoading(false);
		}
	}, [form]);

	//
	// C. Setup flags

	const canSave = !!form.values.agency_id && !!form.values.start_date && (form.values.calculation_method === 'rolling_year' || !!form.values.end_date);

	//
	// D. Reset stale result

	useEffect(() => {
		setResult(null);
	}, [form.values.agency_id, form.values.calculation_method, form.values.end_date, form.values.extension_source, form.values.start_date]);

	//
	// E. Define context value

	const contextValue: VkmModalContextState = useMemo(() => ({
		actions: {
			calculateVkm,
			setCalculationMethod,
		},
		data: {
			form,
			result,
		},
		flags: {
			canSave,
			loading,
		},
	}), [calculateVkm, canSave, form, loading, result, setCalculationMethod]);

	//
	// F. Render components

	return (
		<VkmModalContext.Provider value={contextValue}>
			{children}
		</VkmModalContext.Provider>
	);

	//
};
