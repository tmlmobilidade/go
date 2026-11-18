'use client';

import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { useFilterStateTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAnnotationsLocationsData } from '../../../shared/use-annotations-locations-data';

/* * */

export const ANNOTATIONS_WITHOUT_LOCATIONS = '__unlocated__';

interface UseAnnotationsListFilterLocationsReturnType {
	error: null | string
	isActive: boolean
	isLoading: boolean
	isValidating: boolean
	matchingIds: Set<string>
	mutate: () => void
	set: (value: string[]) => void
	tree: LocationTreeNode[]
	value: string[]
}

/* * */

/** Stores selected IDs only; reference geography, rather than annotation volume, supplies choices. */
export function useAnnotationsListFilterLocations(): UseAnnotationsListFilterLocationsReturnType {
	//

	//
	// A. Setup variables

	const filter = useFilterStateTag('location');
	const { error, isLoading, isValidating, mutate, tree } = useAnnotationsLocationsData();

	//
	// B. Transform data

	const matchingIds = useMemo(() => {
		const selected = new Set(filter.value);
		const matching = new Set(filter.value);
		if (!selected.size) return matching;
		const visit = (nodes: LocationTreeNode[], ancestors: string[] = [], covered = false) => {
			for (const node of nodes) {
				const isSelected = selected.has(node.id);
				if (covered || isSelected) matching.add(node.id);
				if (isSelected) ancestors.forEach(id => matching.add(id));
				visit(node.children ?? [], [...ancestors, node.id], covered || isSelected);
			}
		};
		visit(tree);
		return matching;
	}, [filter.value, tree]);

	//
	// C. Return state

	return useMemo(() => ({
		error,
		isActive: filter.isActive,
		isLoading,
		isValidating,
		matchingIds,
		mutate,
		set: filter.set,
		tree,
		value: filter.value,
	}), [error, filter.isActive, filter.set, filter.value, isLoading, isValidating, matchingIds, mutate, tree]);
}
