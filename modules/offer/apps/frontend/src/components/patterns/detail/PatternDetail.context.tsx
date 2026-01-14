'use client';

/* * */

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Line, Pattern, PermissionCatalog, Typology, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/types';
import { DetailContextStateTemplate, keepUrlParams, type MapOverlayPatternShapeLineDataProps, type MapOverlayPatternShapeStopsDataProps, useDetailState, type UseFormReturnType, useHandleUpdate, useMeContext, useTypicalForm } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface PatternDetailContextState {
	actions: DetailContextStateTemplate['actions'] & {
		mutate: () => Promise<Pattern | undefined>
	}
	data: {
		agency_id: string
		form: UseFormReturnType<UpdatePatternDto>
		id: string
		pattern: null | Pattern
		typologyData?: Typology
	}
	flags: DetailContextStateTemplate['flags']
	geojson: {
		pattern_line: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null
		pattern_stops: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null
	}
}

/* * */

const PatternDetailContext = createContext<PatternDetailContextState | undefined>(undefined);

export function usePatternDetailContext() {
	const context = useContext(PatternDetailContext);
	if (!context) {
		throw new Error('usePatternDetailContext must be used within a PatternDetailContextProvider');
	}
	return context;
}

/* * */

export const PatternDetailContextProvider = ({ children, lineId, patternId }: PropsWithChildren<{ lineId: string, patternId: string }>) => {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: patternData, error: patternError, isLoading: patternLoading, mutate: patternMutate } = useSWR<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), { refreshInterval: 5000 });
	const { data: lineData, mutate: lineMutate } = useSWR<Line>(API_ROUTES.offer.LINES_DETAIL(lineId));
	const { data: typologyData } = useSWR<Typology>(API_ROUTES.offer.TYPOLOGIES_DETAIL(lineData?.typology || ''));

	//
	// C. Transform data to GeoJSON

	const patternLineFC: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null = useMemo(() => {
		if (!patternData?.shape?.geojson?.geometry?.coordinates) return null;

		// The pattern shape is already a GeoJSON Feature, just add our custom properties
		return {
			geometry: {
				coordinates: patternData.shape.geojson.geometry.coordinates,
				type: 'LineString' as const,
			},
			properties: {
				color: typologyData?.color,
				id: patternData._id,
			},
			type: 'Feature' as const,
		};
	}, [patternData, typologyData]);

	const patternStopsFC: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null = useMemo(() => {
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayPatternShapeStopsDataProps>();

		if (!patternData?.path) return featureCollection;

		featureCollection.features = patternData.path
			.filter(pathItem => pathItem.stop)
			.map((pathItem, index) => ({
				geometry: {
					coordinates: [pathItem.stop?.longitude, pathItem.stop?.latitude],
					type: 'Point' as const,
				},
				properties: {
					id: pathItem.stop?._id,
					name: pathItem.stop?.name,
					sequence: index + 1,
				},
				type: 'Feature' as const,
			}));

		return featureCollection;
	}, [patternData]);

	//
	// D. Setup form

	const { form } = useTypicalForm<UpdatePatternDto>(UpdatePatternSchema, patternData);

	//
	// E. Handle actions

	const { action: handleSave, isLoading: isSaving } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'PUT', form.getValues()),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			patternMutate(updatedItem);
			lineMutate();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL(patternId), 'DELETE', patternData),
		onSuccess: () => {
			form.resetDirty();
			lineMutate();
			router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
		},
	});

	const { action: handleLock, isLoading: isLocking } = useHandleUpdate({
		fetchFn: async () => await fetchData<Pattern>(API_ROUTES.offer.PATTERNS_DETAIL_LOCK(patternId)),
		onSuccess: (updatedItem) => {
			form.resetDirty();
			patternMutate(updatedItem);
			lineMutate();
		},
	});

	//
	// F. Setup permissions

	const permissions = meContext.actions.getScopePermissions({
		actions: PermissionCatalog.all.lines.actions,
		resource: {
			key: 'agency_ids',
			requireAll: false,
			value: lineData?.agency_id ? [lineData.agency_id] : [],
		},
		scope: PermissionCatalog.all.lines.scope,
	});

	const { canDelete, canLock, canSave, isReadOnly } = useDetailState({
		hasError: !!patternError,
		isDeleted: null,
		isDeleting,
		isDirty: form.isDirty(),
		isLoading: patternLoading,
		isLocked: patternData?.is_locked,
		isLocking,
		isSaving: isSaving,
		isValid: form.isValid(),
		permissions: {
			delete: permissions.delete,
			lock: permissions.lock,
			read: permissions.read,
			update: permissions.update,
		},
	});

	//
	// G. Define context value

	const contextValue: PatternDetailContextState = useMemo(() => ({
		actions: {
			delete: handleDelete,
			lock: handleLock,
			mutate: patternMutate,
			save: handleSave,
		},
		data: {
			agency_id: lineData?.agency_id || '',
			form,
			id: patternId,
			lineId,
			pattern: patternData,
			typologyData,
		},
		flags: {
			canDelete,
			canLock,
			canSave,
			error: patternError,
			isDeleting,
			isLoading: patternLoading,
			isLocking,
			isReadOnly,
			isSaving: isSaving,
		},
		geojson: {
			pattern_line: patternLineFC,
			pattern_stops: patternStopsFC,
		},
	}), [
		patternData,
		patternError,
		patternLoading,
		patternId,
		form,
		isSaving,
		patternLineFC,
		patternStopsFC,
		lineData,
		typologyData,
	]);

	//
	// H. Render components

	return (
		<PatternDetailContext.Provider value={contextValue}>
			{children}
		</PatternDetailContext.Provider>
	);

	//
};
