'use client';

import { LineBadge } from '@/components/lines/common/LineBadge';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useStopsContext } from '@/components/stops/Stops.context';
import { type HubLine, type HubStop } from '@tmlmobilidade/go-types-public-info';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface Props {
	lineId?: string
	routeId?: string
	stopId?: string
}

/* * */

export function AlertInformedEntity({ lineId, routeId, stopId }: Props) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	//
	// B. Transform data

	const lineData = useMemo<HubLine | undefined>(() => {
		return linesContext.data.lines?.find(line => line._id === lineId || line.route_ids.some(itemId => itemId === routeId));
	}, [lineId, linesContext.data.lines, routeId]);

	const stopData = useMemo<HubStop | undefined>(() => {
		return stopsContext.data.stops?.find(stop => String(stop._id) === String(stopId));
	}, [stopId, stopsContext.data.stops]);

	//
	// C. Handle actions

	const handleLineBadgeClick = () => {
		router.push(`/lines/${lineData?._id}`);
	};

	//
	// D. Render components

	if (lineData) {
		return (
			<LineBadge lineData={lineData} onClick={handleLineBadgeClick} />
		);
	}

	if (stopId && stopData) {
		return (
			<p>{stopData.name}</p>
		);
	}

	//
}
