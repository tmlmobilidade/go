'use client';

import { usePeriodsContext } from '@/contexts/Periods.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { useForm } from '@mantine/form';
import { buildParameterSummary, computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/dates';
import { type Path, PopulatedPath, StopsParameter, StopsParameterSchema } from '@tmlmobilidade/types';
import { type UseFormReturnType } from '@tmlmobilidade/ui';
import { zodResolver } from 'mantine-form-zod-resolver';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeCreateParameterModal } from './ParameterCreate.modal';

/* * */

export type StopsParameterExtendedWithStats = StopsParameterExtended & {
	avgCommercialSpeed: null | number
	pureDwellSeconds: number
	totalDistance: number
};

interface ParameterCreateContextState {
	actions: {
		applyDefaultSpeeds: () => void
		applyFixedSpeed: (speedKmh: number) => void
		applySpeedFactor: (factor: number) => void
		deleteParameter?: () => void
		submitParameter: () => void
	}
	data: {
		defaultParameter?: StopsParameter
		form: UseFormReturnType<StopsParameter>
		mergedPath?: MergedPathItem[]
		parameterForUI: StopsParameterExtendedWithStats
		path?: PopulatedPath[]
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

export const ParameterCreateContextProvider = ({ children, defaultParameter, initialValues, onDelete, onSubmit, path }: PropsWithChildren<{ defaultParameter?: StopsParameter, initialValues?: StopsParameter, onDelete?: () => void, onSubmit: (rule: StopsParameter) => void, path?: PopulatedPath[] }>) => {
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
		stop_sequence: [],
		vehicle_type: '',
		weekdays: [],
		year_period_ids: [],
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

		const totalDistance = (mergedPath || []).reduce((sum, item) => sum + (item.distance_delta ?? 0), 0);
		const totalTripSeconds = travelTimes.totalTripSecondsWithStops.raw;
		const pureDwellSeconds = travelTimes.totalTripSecondsWithStops.raw - travelTimes.totalTripSecondsWithoutStops.raw;
		const avgCommercialSpeed = totalTripSeconds > 0 ? Math.round((totalDistance / 1000) / (totalTripSeconds / 3600) * 10) / 10 : null;

		return { ...form.values, avgCommercialSpeed, name: long, pureDwellSeconds, shortName: short, totalDistance, travelTimes };
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

	const handleApplyDefaultSpeeds = useCallback(() => {
		if (!defaultParameter) return;
		const currentPath = form.getValues().path;
		const defaultPathMap = new Map(defaultParameter.path.map(p => [p.stop_id, p]));
		const newPath = currentPath.map((p) => {
			const def = defaultPathMap.get(p.stop_id);
			if (!def) return p;
			return { ...p, avg_speed: def.avg_speed, dwell_time: def.dwell_time };
		});
		form.setFieldValue('path', newPath);
	}, [defaultParameter, form]);

	const handleApplyFixedSpeed = useCallback((speedKmh: number) => {
		const currentPath = form.getValues().path;
		const newPath = currentPath.map(p => ({ ...p, avg_speed: speedKmh }));
		form.setFieldValue('path', newPath);
	}, [form]);

	const handleApplySpeedFactor = useCallback((factor: number) => {
		const currentPath = form.getValues().path;
		const newPath = currentPath.map(p => ({
			...p,
			avg_speed: Math.round(p.avg_speed * factor * 10) / 10,
		}));
		form.setFieldValue('path', newPath);
	}, [form]);

	//
	// E. Define context value

	const contextValue: ParameterCreateContextState = useMemo(() => ({
		actions: {
			applyDefaultSpeeds: handleApplyDefaultSpeeds,
			applyFixedSpeed: handleApplyFixedSpeed,
			applySpeedFactor: handleApplySpeedFactor,
			deleteParameter: onDelete ? handleDeleteParameter : undefined,
			submitParameter: handleSubmitParameter,
		},
		data: {
			defaultParameter,
			form,
			mergedPath,
			parameterForUI,
			path,
		},
		flags: {
			isEditing: Boolean(initialValues),
		},
	}), [defaultParameter, form, handleApplyDefaultSpeeds, handleApplyFixedSpeed, handleApplySpeedFactor, handleDeleteParameter, handleSubmitParameter, initialValues, mergedPath, onDelete, parameterForUI, path]);

	//
	// H. Render components

	return (
		<ParameterCreateContext.Provider value={contextValue}>
			{children}
		</ParameterCreateContext.Provider>
	);

	//
};
