'use client';

import { usePeriodsContext } from '@/contexts/Periods.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { useForm } from '@mantine/form';
import { buildParameterSummary, computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/dates';
import { type Path, StopsParameter, StopsParameterSchema } from '@tmlmobilidade/types';
import { type UseFormReturnType } from '@tmlmobilidade/ui';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeCreateParameterModal } from './ParameterCreate.modal';

/* * */

interface ParameterCreateContextState {
	actions: {
		deleteParameter?: () => void
		submitParameter: () => void
	}
	data: {
		form: UseFormReturnType<StopsParameter>
		mergedPath?: MergedPathItem[]
		parameterForUI: StopsParameterExtended
		path?: Path[]
	}
	flags: {
		isEditing: boolean
	}
}

/* * */

/**
 * A merged row used by the UI:
 * - Keeps the base Path info (distance_delta, stop, stop_id, etc.)
 * - Adds editable operational fields (avg_speed, dwell_time)
 */
type MergedPathItem = Path & {
	avg_speed?: null | number // km/h
	dwell_time?: null | number // seconds
};

/* * */

const ParameterCreateContext = createContext<ParameterCreateContextState | undefined>(undefined);

export function useParameterCreateContext() {
	const context = useContext(ParameterCreateContext);
	if (!context) {
		throw new Error('useParameterCreateContext must be used within a ParameterCreateContextProvider');
	}
	return context;
}

/* * */

export const ParameterCreateContextProvider = ({ children, initialValues, onDelete, onSubmit, path }: PropsWithChildren<{ initialValues?: StopsParameter, onDelete?: () => void, onSubmit: (rule: StopsParameter) => void, path?: Path[] }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();

	//
	// B. Fetch data

	//
	// C. Setup form

	const defaultValues = {
		business_periods: [],
		kind: 'override',
		path: (path || []).map(pathItem => ({
			...pathItem,
			avg_speed: 0,
			dwell_time: 30,
			stop_id: pathItem.stop_id,
		})),
		year_period_ids: [],
		stop_sequence: [],
		vehicle_type: '',
		weekdays: [],
	} as StopsParameter;

	const form = useForm<StopsParameter>({
		initialValues: initialValues || defaultValues,
		mode: 'controlled',
		validate: zodResolver(StopsParameterSchema),
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	//
	// Merge base `path` (source of truth for distance_delta/stop/etc)
	// with form edits (avg_speed/dwell_time)
	//
	const mergedPath = useMemo(() => getMergedPath(path || [], form.values.path), [path, form.values.path]);

	const parameterForUI = useMemo(() => {
		const periods = periodsContext.data.raw || [];
		const travelTimes = computeSegmentTravelTimes(mergedPath || []);
		const { long, short } = buildParameterSummary(form.values, { periods });

		return { ...form.values, name: long, shortName: short, travelTimes };
	}, [form.values, mergedPath, periodsContext.data.raw]);

	//
	// D. Handle actions

	const handleSubmitParameter = useCallback(() => {
		// Validate form
		const validation = form.validate();
		if (validation.hasErrors) {
			return;
		}

		// Get the rule values
		const ruleValues = form.getValues();

		// Call the onSubmit callback
		onSubmit(ruleValues);

		// Close the modal
		closeCreateParameterModal();
	}, [form, onSubmit]);

	const handleDeleteParameter = useCallback(() => {
		if (onDelete) {
			onDelete();
			closeCreateParameterModal();
		}
	}, [onDelete]);

	//
	// E. Define context value

	const contextValue: ParameterCreateContextState = useMemo(() => ({
		actions: {
			deleteParameter: onDelete ? handleDeleteParameter : undefined,
			submitParameter: handleSubmitParameter,
		},
		data: {
			form,
			mergedPath,
			parameterForUI,
			path,
		},
		flags: {
			isEditing: Boolean(initialValues),
		},
	}), [form, handleDeleteParameter, handleSubmitParameter, initialValues, mergedPath, onDelete, parameterForUI, path]);

	//
	// H. Render components

	return (
		<ParameterCreateContext.Provider value={contextValue}>
			{children}
		</ParameterCreateContext.Provider>
	);

	//
};
