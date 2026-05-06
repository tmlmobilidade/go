'use client';

/* * */

import { LineTag } from '@/components/common/LineTag';
import { PatternTag } from '@/components/common/PatternTag';
import { RouteTag } from '@/components/common/RouteTag';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Breadcrumbs } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

interface OfferBreadcrumbsProps {
	items: {
		lineId: string
		patternId?: string
		routeId?: string
	}
}

/* * */

export function OfferBreadcrumbs({ items }: OfferBreadcrumbsProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleLineClick = () => {
		router.push(PAGE_ROUTES.offer.LINES_DETAIL(items.lineId));
	};

	const handleRouteClick = () => {
		if (items.routeId) {
			router.push(PAGE_ROUTES.offer.ROUTE_DETAIL(items.lineId, items.routeId));
		}
	};

	//
	// C. Render components

	const breadcrumbItems = [];

	// Always show line
	breadcrumbItems.push(
		<LineTag key="line" line_id={items.lineId} onClick={handleLineClick} withLabel={false} />,
	);

	// Show route if provided
	if (items.routeId) {
		breadcrumbItems.push(
			<RouteTag key="route" onClick={handleRouteClick} route_id={items.routeId} />,
		);
	}

	// Show pattern if provided
	if (items.patternId) {
		breadcrumbItems.push(
			<PatternTag key="pattern" pattern_id={items.patternId} />,
		);
	}

	return <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>;

	//
}
