/* * */

import { type Map as MapLibreMap } from 'maplibre-gl';

import { getBasePath } from '../../../utils/get-base-path';

/**
 * Represents a map asset definition.
 */
export interface MapAssetType {
	name: string
	sdf: boolean
	url: string
}

/**
 * Loads given map assets into the specified map object.
 * @param mapObject The map object to load assets into.
 * @param mapAssets The map assets to load.
 */
export function loadMapAssets(mapObject: MapLibreMap | null | undefined, mapAssets: MapAssetType[]) {
	// Skip if no map object is provided
	if (!mapObject) return;
	// Load each map asset
	for (const asset of mapAssets) {
		// Skip if the asset already exists
		if (mapObject.hasImage(asset.name)) continue;
		// Append the base path to the asset URL if it doesn't already have it
		const fullAssetUrl = asset.url.startsWith('/') ? `${getBasePath()}${asset.url}` : asset.url;
		// Load the asset from the URL
		mapObject.loadImage(fullAssetUrl).then((image) => {
			// Re-check if the asset exists, and add it if it doesn't
			if (mapObject.hasImage(asset.name)) return;
			// Finally, add the asset to the map
			mapObject.addImage(asset.name, image.data, { sdf: asset.sdf });
		});
	}
}
