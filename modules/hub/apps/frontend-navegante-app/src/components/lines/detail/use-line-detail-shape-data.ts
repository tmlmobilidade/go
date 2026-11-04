'use client';

import { buildPatternShapeFeature } from '@/utils/map/pattern-shape';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { useMemo } from 'react';

/* * */

export function useLineDetailShapeData(activePattern: HubV1ApiPattern | null): GeoJSON.Feature<GeoJSON.LineString> | null {
	//

	// A. Transform data

	return useMemo(() => buildPatternShapeFeature(activePattern), [activePattern]);

	//
}
