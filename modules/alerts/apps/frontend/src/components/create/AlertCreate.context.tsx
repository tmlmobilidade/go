'use client';

/* * */

import { type Line, type Stop } from '@carrismetropolitana/api-types/network';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { Agency, type Alert, alertCauseEffectReferenceTypeMap, type CreateAlertDto, CreateAlertSchema, PermissionCatalog, RideNormalized } from '@tmlmobilidade/types';
import { type CreateContextStateTemplate, keepUrlParams, useDataAgencies, type UseFormReturnType, useHandleUpdate, useMeContext, useMultiStep, type UseMultiStepReturnType, useTypicalForm, useTypicalFormWatch } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

interface AlertCreateContextState extends CreateContextStateTemplate {
	data: {
		auto_texts: boolean
		enabled_reference_types: Alert['reference_type'][]
		form: UseFormReturnType<CreateAlertDto>
		multi_step: UseMultiStepReturnType
		set_auto_texts: (value: boolean) => void
	}
};

/* * */

const AlertCreateContext = createContext<AlertCreateContextState | undefined>(undefined);

export function useAlertCreateContext() {
	const context = useContext(AlertCreateContext);
	if (!context) {
		throw new Error('useAlertCreateContext must be used within a AlertCreateContextProvider');
	}
	return context;
}

interface AgencyData {
	display_name: string
	id: string
	name: string
}

interface StopData {
	id: string
	lines: LineData[]
	long_name: string
}

interface LineData {
	id: string
	long_name: string
	short_name: string
	stops: StopData[]
}

/* * */

export const AlertCreateContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const searchParams = useSearchParams();

	const meContext = useMeContext();
	const copyAlertId = searchParams.get('copy');

	const [autoTexts, setAutoTexts] = useState(true);
	const [selectedReferencesData, setSelectedReferencesData] = useState<AgencyData[] | LineData[] | RideNormalized[] | StopData[]>([]);
	const [hasAppliedCopyData, setHasAppliedCopyData] = useState(false);

	//
	// B. Fetch data

	const { mutate: alertsListMutate } = useSWR<Alert[]>(API_ROUTES.alerts.ALERTS_LIST);
	const { data: copyAlertData, isLoading: copyAlertLoading } = useSWR<Alert>(copyAlertId ? API_ROUTES.alerts.ALERTS_DETAIL(copyAlertId) : null);

	const { options: agenciesOptions, raw: agenciesData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.create],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Setup form

	const { form } = useTypicalForm<CreateAlertDto>(CreateAlertSchema);

	const watchedFormValues = useTypicalFormWatch(form, [
		'cause',
		'effect',
		'agency_id',
		'active_period_start_date',
		'active_period_end_date',
		'reference_type',
		'references',
		'publish_status',
	]);

	const multiStep = useMultiStep({
		steps: [
			{
				id: 'cause',
				isValid: () => !!watchedFormValues.cause,
				isVisible: true,
				label: 'Causa',
				order: 0,
			},
			{
				id: 'effect',
				isEnabled: () => !!watchedFormValues.cause,
				isValid: () => !!watchedFormValues.effect,
				isVisible: true,
				label: 'Efeito',
				order: 1,
			},
			{
				id: 'agency',
				isEnabled: () => !!watchedFormValues.cause && !!watchedFormValues.effect,
				isValid: () => !!watchedFormValues.agency_id,
				isVisible: agenciesOptions?.length > 1,
				label: 'Operador',
				order: 2,
			},
			{
				id: 'dates',
				isEnabled: () => !!watchedFormValues.agency_id,
				isValid: () => !!watchedFormValues.active_period_start_date,
				isVisible: meContext.actions.hasPermission(PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.update_dates),
				label: 'Datas',
				order: 3,
			},
			{
				id: 'references',
				isEnabled: () => !!watchedFormValues.cause && !!watchedFormValues.effect && !!watchedFormValues.active_period_start_date,
				isValid: () => !!watchedFormValues.reference_type && !!watchedFormValues.agency_id && !!watchedFormValues.references?.length,
				isVisible: true,
				label: 'Referências',
				order: 4,
			},
			{
				id: 'summary',
				isEnabled: () => !!watchedFormValues.cause && !!watchedFormValues.effect && !!watchedFormValues.active_period_start_date && !!watchedFormValues.reference_type && !!watchedFormValues.agency_id && !!watchedFormValues.references?.length,
				isVisible: true,
				label: 'Resumo',
				order: 5,
			},
		],
	});

	//
	// D. Handle actions

	const enabledReferenceTypes = useMemo(() => {
		return alertCauseEffectReferenceTypeMap[watchedFormValues.cause]?.[watchedFormValues.effect] ?? [];
	}, [watchedFormValues.cause, watchedFormValues.effect]);

	useEffect(() => {
		if (watchedFormValues.agency_id) return;
		if (agenciesOptions?.length === 1) form.setFieldValue('agency_id', agenciesOptions[0].value);
	}, [watchedFormValues.agency_id, agenciesOptions, form]);

	useEffect(() => {
		if (copyAlertId) return;
		if (!autoTexts) return;
		if (multiStep.progress.current?.index !== multiStep.progress.steps.length - 1) return; // Only run when on the last step | if we go back and again to last step, this will run again
		if (!form.getValues().cause || !form.getValues().effect || !form.getValues().reference_type || !form.getValues().references) return;
		const references = form.getValues().references;
		const alertTemplating = describeAlert({
			cause: form.getValues().cause,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data: selectedReferencesData as any[],
			effect: form.getValues().effect,
			reference_type: form.getValues().reference_type,
			references: references,
			type: form.getValues().reference_type,
		});
		if (!alertTemplating) return;
		form.setFieldValue('description', alertTemplating.description.pt);
		form.setFieldValue('title', alertTemplating.title.pt);
	}, [copyAlertId, autoTexts, multiStep.progress.current?.index, multiStep.progress, form, selectedReferencesData]);

	useEffect(() => {
		if (!copyAlertId || !copyAlertData || hasAppliedCopyData) return;
		const copyAlertAsCreateData = CreateAlertSchema.parse(copyAlertData);
		form.reset();
		form.setValues(copyAlertAsCreateData);
		form.validate();
		form.resetDirty();
		multiStep.actions.goTo('summary');
		setHasAppliedCopyData(true);
	}, [copyAlertData, copyAlertId, form, hasAppliedCopyData, multiStep.actions]);

	useEffect(() => {
		if (!watchedFormValues.publish_status) {
			form.setFieldValue('publish_status', 'published');
		}
	}, [watchedFormValues.publish_status, form]);

	useEffect(() => {
		if (!watchedFormValues.active_period_start_date) {
			// Set active period start date to 5 minutes ago
			form.setFieldValue('active_period_start_date', Dates.now('Europe/Lisbon').minus({ minutes: 5 }).set({ millisecond: 0, second: 0 }).unix_timestamp);
			// Set publish start date to start of today to ensure alert is visible immediately
			form.setFieldValue('publish_start_date', Dates.now('Europe/Lisbon').startOf('day').unix_timestamp);
		}
	}, [watchedFormValues.active_period_start_date, form]);

	useEffect(() => {
		if (!watchedFormValues.active_period_end_date) {
			// Set active period end date to the end today
			form.setFieldValue('active_period_end_date', Dates.now('Europe/Lisbon').plus({ hours: 4 }).unix_timestamp);
			// Set publish end date to end of today
			form.setFieldValue('publish_end_date', Dates.now('Europe/Lisbon').endOf('day').unix_timestamp);
		}
	}, [watchedFormValues.active_period_end_date, form]);

	useEffect(() => {
		// Skip if reference type is already set
		if (form.getValues().reference_type) return;
		// Get permission definition for reference types
		const createPermission = PermissionCatalog.get(meContext.data.user.permissions, PermissionCatalog.all.alerts.scope, PermissionCatalog.all.alerts.actions.create);
		// Set the reference type based on alert cause/effect when possible
		if (createPermission?.resources.reference_types.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			if (enabledReferenceTypes.includes('lines')) return form.setFieldValue('reference_type', 'lines');
			if (enabledReferenceTypes.includes('stops')) return form.setFieldValue('reference_type', 'stops');
			if (enabledReferenceTypes.includes('rides')) return form.setFieldValue('reference_type', 'rides');
			if (enabledReferenceTypes.includes('agency')) return form.setFieldValue('reference_type', 'agency');
			return console.warn('No enabled reference types available to set as default.');
		}
		// Set the reference type based on permissions
		if (enabledReferenceTypes.includes('lines') && createPermission?.resources.reference_types.includes('lines')) return form.setFieldValue('reference_type', 'lines');
		if (enabledReferenceTypes.includes('stops') && createPermission?.resources.reference_types.includes('stops')) return form.setFieldValue('reference_type', 'stops');
		if (enabledReferenceTypes.includes('rides') && createPermission?.resources.reference_types.includes('rides')) return form.setFieldValue('reference_type', 'rides');
		if (enabledReferenceTypes.includes('agency') && createPermission?.resources.reference_types.includes('agency')) return form.setFieldValue('reference_type', 'agency');
	}, [watchedFormValues.reference_type, enabledReferenceTypes, form, meContext.data.user.permissions]);

	useEffect(() => {
		// Skip if reference type is not agency
		if (watchedFormValues.reference_type !== 'agency') return;
		// Skip if no agency_id selected
		if (!watchedFormValues.agency_id) return;
		// Set selected references to the selected agency
		form.setFieldValue('references', [{ child_ids: [], parent_id: watchedFormValues.agency_id }]);
	}, [watchedFormValues.reference_type, watchedFormValues.agency_id, form]);

	useEffect(() => {
		// Reset effect and reference type when cause changes as they are dependent on cause
		form.setFieldValue('effect', null);
		form.setFieldValue('reference_type', null);
		form.setFieldValue('references', []);
	}, [form, watchedFormValues.cause]);

	useEffect(() => {
		// Reset reference type when effect changes as they are dependent on effect
		form.setFieldValue('reference_type', null);
		form.setFieldValue('references', []);
	}, [form, watchedFormValues.effect]);

	useEffect(() => {
		(async () => {
			// Reset if no selected reference_type
			if (!watchedFormValues.reference_type) return setSelectedReferencesData([]);
			// Reset state if no selected references
			if (!watchedFormValues.references?.length) return setSelectedReferencesData([]);
			// Get a list of unique parent_ids
			const parentIds = watchedFormValues.references.map(reference => reference.parent_id);
			// Fetch data for agencies
			if (watchedFormValues.reference_type === 'agency') {
				const result: Agency[] = agenciesData.filter(agency => parentIds.includes(agency._id));
				setSelectedReferencesData(result.map(agency => ({ display_name: agency.name, id: agency._id, name: agency.name })));
			}

			// Fetch data for lines
			if (watchedFormValues.reference_type === 'lines') {
				const response = await fetch('https://api.carrismetropolitana.pt/v2/lines');
				const linesData = await response.json() as Line[];
				const result: Line[] = linesData.filter(line => parentIds.includes(line.id));

				// Get all unique child_ids (stop IDs) from references
				const allChildIds = watchedFormValues.references
					.filter(ref => parentIds.includes(ref.parent_id))
					.flatMap(ref => ref.child_ids);
				const uniqueChildIds = [...new Set(allChildIds)];

				// Fetch stops data if there are child_ids
				const stopsDataMap = new Map<string, Stop>();
				if (uniqueChildIds.length > 0) {
					const stopsResponse = await fetch('https://api.carrismetropolitana.pt/v2/stops');
					const stopsData = await stopsResponse.json() as Stop[];
					stopsData.filter(stop => uniqueChildIds.includes(stop.id)).forEach((stop) => {
						stopsDataMap.set(stop.id, stop);
					});
				}

				setSelectedReferencesData(result.map((line) => {
					// Get child_ids for this specific line
					const lineReference = form.getValues().references.find(ref => ref.parent_id === line.id);
					const lineChildIds = lineReference?.child_ids ?? [];

					// Map child_ids to StopData
					const stops: StopData[] = lineChildIds
						.map(stopId => stopsDataMap.get(stopId))
						.filter((stop): stop is Stop => stop !== undefined)
						.map(stop => ({
							id: stop.id,
							lines: [],
							long_name: stop.long_name,
						}));

					return {
						id: line.id,
						long_name: line.long_name,
						short_name: line.short_name,
						stops,
					};
				}));
			}
			// Fetch data for stops
			if (watchedFormValues.reference_type === 'stops') {
				const response = await fetch('https://api.carrismetropolitana.pt/v2/stops');
				const stopsData = await response.json() as Stop[];
				const result: Stop[] = stopsData.filter(stop => parentIds.includes(stop.id));

				const linesResponse = await fetch('https://api.carrismetropolitana.pt/v2/lines');
				const linesData = await linesResponse.json() as Line[];
				const selectedLines = linesData.filter(line => result.some(stop => stop.line_ids.includes(line.id)));

				// Get all unique child_ids (stop IDs) from references
				const allChildIds = watchedFormValues.references
					.filter(ref => parentIds.includes(ref.parent_id))
					.flatMap(ref => ref.child_ids);
				const uniqueChildIds = [...new Set(allChildIds)];

				// Fetch stops data if there are child_ids
				const childStopsDataMap = new Map<string, Stop>();
				if (uniqueChildIds.length > 0) {
					const childStopsResponse = await fetch('https://api.carrismetropolitana.pt/v2/stops');
					const childStopsData = await childStopsResponse.json() as Stop[];
					childStopsData.filter(stop => uniqueChildIds.includes(stop.id)).forEach((stop) => {
						childStopsDataMap.set(stop.id, stop);
					});
				}

				setSelectedReferencesData(result.map((stop) => {
					// Get child_ids for this specific stop
					const stopReference = form.getValues().references.find(ref => ref.parent_id === stop.id);
					const stopChildIds = stopReference?.child_ids ?? [];

					// For each line associated with this stop, populate stops from child_ids
					const linesWithStops = selectedLines
						.filter(line => stop.line_ids.includes(line.id))
						.map((line) => {
							// Get stops that are child_ids and belong to this line
							const lineStops: StopData[] = stopChildIds
								.map(stopId => childStopsDataMap.get(stopId))
								.filter((childStop): childStop is Stop => childStop?.line_ids.includes(line.id))
								.map(childStop => ({
									id: childStop.id,
									lines: [],
									long_name: childStop.long_name,
								}));

							return {
								id: line.id,
								long_name: line.long_name,
								short_name: line.short_name,
								stops: lineStops,
							};
						});

					return {
						id: stop.id,
						lines: linesWithStops,
						long_name: stop.long_name,
					};
				}));
			}
			// Fetch data for rides
			if (watchedFormValues.reference_type === 'rides') {
				const result: RideNormalized[] = [];
				for (const rideId of parentIds) {
					const response = await fetchData<RideNormalized>(API_ROUTES.alerts.RIDES_DETAIL_RIDE(rideId));
					if (!response.data) continue;
					result.push(response.data);
				}
				setSelectedReferencesData(result);
			}
		})();
	}, [agenciesData, form, watchedFormValues.reference_type, watchedFormValues.references]);

	const { action: handleCreate, isLoading: isCreating } = useHandleUpdate({
		fetchFn: async () => await fetchData<Alert>(API_ROUTES.alerts.ALERTS_LIST, 'POST', form.getValues()),
		onSuccess: (updatedItem) => {
			alertsListMutate();
			if (updatedItem?._id) router.push(keepUrlParams(PAGE_ROUTES.alerts.ALERTS_DETAIL(updatedItem._id)));
		},
	});

	//
	// E. Define State

	const contextValue: AlertCreateContextState = {
		actions: {
			create: handleCreate,
		},
		data: {
			auto_texts: autoTexts,
			enabled_reference_types: enabledReferenceTypes,
			form,
			multi_step: multiStep,
			set_auto_texts: setAutoTexts,
		},
		flags: {
			canCreate: true,
			error: undefined,
			isCreating,
			isLoading: copyAlertLoading,
		},
	};

	//
	// F. Return state

	return (
		<AlertCreateContext.Provider value={contextValue}>
			{children}
		</AlertCreateContext.Provider>
	);

	//
};
