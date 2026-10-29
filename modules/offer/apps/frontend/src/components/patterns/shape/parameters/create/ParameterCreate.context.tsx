'use client';

import { usePeriodsContext } from '@/contexts/Periods.context';
import { StopsParameterExtended } from '@/utils/stops-parameters';
import { PatternsDetailPathItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type Path, StopsParameter, StopsParameterSchema } from '@tmlmobilidade/go-types-offer';
import { buildParameterSummary, computeSegmentTravelTimes, getMergedPath } from '@tmlmobilidade/go-utils-offer';
import { type StandardFormContextValue, useStandardForm, useStandardFormCapabilities, useStandardFormWatch } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';

import { closeCreateParameterModal } from './ParameterCreate.modal';

/* * */

export type StopsParameterExtendedWithStats = StopsParameterExtended & {
	avgCommercialSpeed: null | number
	pureDwellSeconds: number
	totalDistance: number
};

interface ParameterCreateContextState extends StandardFormContextValue<StopsParameter> {
	actions: StandardFormContextValue<StopsParameter>['actions'] & {
		applyDefaultSpeeds: () => void
		applyFixedDwellTime: (dwellTimeSeconds: number) => void
		applyFixedSpeed: (speedKmh: number) => void
		applySpeedFactor: (factor: number) => void
		deleteParameter?: () => void
		submitParameter: () => void
	}
	data: {
		defaultParameter?: StopsParameter
		mergedPath?: MergedPathItem[]
		parameterForUI: StopsParameterExtendedWithStats
		path?: PatternsDetailPathItem[]
		values: StopsParameter
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

export const ParameterCreateContextProvider = ({ children, defaultParameter, initialValues, onDelete, onSubmit, path }: PropsWithChildren<{ defaultParameter?: StopsParameter, initialValues?: StopsParameter, onDelete?: () => void, onSubmit: (rule: StopsParameter) => void, path?: PatternsDetailPathItem[] }>) => {
	//

	//
	// A. Setup variables

	const periodsContext = usePeriodsContext();

	//
	// B. Setup form

	const defaultValues = useMemo<StopsParameter>(() => initialValues ?? {
		kind: 'override',
		path: (path ?? []).map(item => ({ avg_speed: 0, dwell_time: 30, stop_id: item.stop_id })),
		vehicle_type: '',
		weekdays: [],
		year_period_ids: [],
	}, [initialValues, path]);
	const { form, isDirty, isValid, unblock } = useStandardForm<StopsParameter, typeof StopsParameterSchema>({
		defaultValues,
		schema: StopsParameterSchema,
	});
	const values = useStandardFormWatch({ compute: values => values, control: form.control });

	//
	// C. Transform data

	// Merge base `path` (source of truth for distance_delta/stop/etc)
	// with form edits (avg_speed/dwell_time)
	//
	const mergedPath = useMemo(() => getMergedPath(path || [], values.path), [path, values.path]);

	const parameterForUI = useMemo(() => {
		const periods = periodsContext.data.raw || [];
		const travelTimes = computeSegmentTravelTimes(mergedPath || []);
		const { long, short } = buildParameterSummary(values, { periods });

		const totalDistance = (mergedPath || []).reduce((sum, item) => sum + (item.distance_delta ?? 0), 0);
		const totalTripSeconds = travelTimes.totalTripSecondsWithStops.raw;
		const pureDwellSeconds = travelTimes.totalTripSecondsWithStops.raw - travelTimes.totalTripSecondsWithoutStops.raw;
		const avgCommercialSpeed = totalTripSeconds > 0 ? Math.round((totalDistance / 1000) / (totalTripSeconds / 3600) * 10) / 10 : null;

		return { ...values, avgCommercialSpeed, name: long, pureDwellSeconds, shortName: short, totalDistance, travelTimes };
	}, [values, mergedPath, periodsContext.data.raw]);

	//
	// D. Handle actions

	const handleSubmitParameter = useCallback(async () => {
		await form.handleSubmit((data) => {
			onSubmit(data);
			unblock();
			closeCreateParameterModal();
		})();
	}, [form, onSubmit, unblock]);

	const handleDeleteParameter = useCallback(() => {
		if (onDelete) {
			onDelete();
			unblock();
			closeCreateParameterModal();
		}
	}, [onDelete, unblock]);

	const handleApplyDefaultSpeeds = useCallback(() => {
		if (!defaultParameter) return;
		const currentPath = form.getValues().path;
		const defaultPathMap = new Map(defaultParameter.path.map(p => [p.stop_id, p]));
		const newPath = currentPath.map((p) => {
			const def = defaultPathMap.get(p.stop_id);
			if (!def) return p;
			return { ...p, avg_speed: def.avg_speed, dwell_time: def.dwell_time };
		});
		form.setValue('path', newPath, { shouldDirty: true, shouldValidate: true });
	}, [defaultParameter, form]);

	const handleApplyFixedSpeed = useCallback((speedKmh: number) => {
		const currentPath = form.getValues().path;
		const newPath = currentPath.map(p => ({ ...p, avg_speed: speedKmh }));
		form.setValue('path', newPath, { shouldDirty: true, shouldValidate: true });
	}, [form]);

	const handleApplyFixedDwellTime = useCallback((dwellTimeSeconds: number) => {
		const currentPath = form.getValues().path;
		const newPath = currentPath.map(p => ({ ...p, dwell_time: dwellTimeSeconds }));
		form.setValue('path', newPath, { shouldDirty: true, shouldValidate: true });
	}, [form]);

	const handleApplySpeedFactor = useCallback((factor: number) => {
		const currentPath = form.getValues().path;
		const newPath = currentPath.map(p => ({
			...p,
			avg_speed: Math.round(p.avg_speed * factor * 10) / 10,
		}));
		form.setValue('path', newPath, { shouldDirty: true, shouldValidate: true });
	}, [form]);

	//
	// E. Define context value

	const capabilities = useStandardFormCapabilities({
		create: { hasPermission: true },
		form: { isDirty, isValid },
	});

	const contextValue: ParameterCreateContextState = useMemo(() => ({
		actions: {
			applyDefaultSpeeds: handleApplyDefaultSpeeds,
			applyFixedDwellTime: handleApplyFixedDwellTime,
			applyFixedSpeed: handleApplyFixedSpeed,
			applySpeedFactor: handleApplySpeedFactor,
			deleteParameter: onDelete ? handleDeleteParameter : undefined,
			submitParameter: handleSubmitParameter,
		},
		capabilities,
		data: {
			defaultParameter,
			mergedPath,
			parameterForUI,
			path,
			values,
		},
		flags: {
			isEditing: Boolean(initialValues),
		},
		form,
		isDirty,
		isValid,
		status: {},
		unblock,
	}), [capabilities, isDirty, isValid, unblock, values, defaultParameter, form, handleApplyDefaultSpeeds, handleApplyFixedDwellTime, handleApplyFixedSpeed, handleApplySpeedFactor, handleDeleteParameter, handleSubmitParameter, initialValues, mergedPath, onDelete, parameterForUI, path]);

	//
	// F. Render components

	return (
		<ParameterCreateContext.Provider value={contextValue}>
			{children}
		</ParameterCreateContext.Provider>
	);

	//
};
