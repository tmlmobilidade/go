/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { Tag } from '@tmlmobilidade/ui';

/* * */

export function RouteTag({ onClick, route_id }: { onClick?: () => void, route_id: string }) {
	//

	//
	// A. Setup variables

	const routeDetailContext = useRouteDetailContext();
	const routeCode = routeDetailContext.data.route?._id === route_id
		? routeDetailContext.data.route.code
		: route_id;

	//
	// B. Render components

	return <Tag label={routeCode} onClick={onClick} />;

	//
}
