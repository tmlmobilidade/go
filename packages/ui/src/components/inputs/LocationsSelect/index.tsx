'use client';

import { type LocationGroupsOption, type LocationItem, type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GroupedTreeSelect, type GroupedTreeSelectProps } from '../GroupedTreeSelect';
import { type TreeSelectDataItem } from '../TreeSelect';
import { createLocationSelectionGroups, createLocationTreeOptions, flattenLocationTree } from './location-options';

/* * */

export interface LocationsSelectProps extends Omit<GroupedTreeSelectProps, 'data' | 'groups'> {
	/** Optional choices such as "No location", independent of the geographic hierarchy. */
	additionalOptions?: TreeSelectDataItem[]
	/** Saved locations remain visible while reference data loads or changes. */
	fallbackLocations?: LocationItem[]
	/** Enable all registered groups, selected group IDs, or none (the default). */
	groups?: LocationGroupsOption
	tree: LocationTreeNode[]
}

/* * */

/** Reusable administrative picker with optional, data-driven geographic groups. */
export function LocationsSelect({ additionalOptions = [], fallbackLocations = [], groups = false, tree, ...props }: LocationsSelectProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const { data, selectionGroups } = useMemo(() => {
		const locations = flattenLocationTree(tree);
		const treeOptions = createLocationTreeOptions(tree);
		const availableIds = new Set(locations.map(location => location.osm_id));
		const missingSelections = fallbackLocations.filter(location => !availableIds.has(location.osm_id));
		const fallbackOptions = missingSelections.map(location => ({
			label: location.name,
			value: String(location.osm_id),
		}));

		return {
			data: [...additionalOptions, ...treeOptions, ...fallbackOptions],
			selectionGroups: createLocationSelectionGroups(locations, groups),
		};
	}, [additionalOptions, fallbackLocations, groups, tree]);

	//
	// C. Render components

	return (
		<GroupedTreeSelect
			data={data}
			groups={selectionGroups}
			nothingFoundMessage={t('shared:components.LocationsSelect.no_results')}
			placeholder={t('shared:components.LocationsSelect.placeholder')}
			{...props}
		/>
	);
}
