/* * */

import { useRoutesDetailData } from '@/components/routes/detail/use-routes-detail-data';
import { Tag } from '@tmlmobilidade/ui';

/* * */

export function RouteTag({ onClick, route_id }: { onClick?: () => void, route_id: string }) {
	//

	//
	// A. Setup variables

	const { data: route } = useRoutesDetailData(route_id);
	const routeCode = route?.code ?? route_id;

	//
	// B. Render components

	return <Tag label={routeCode} onClick={onClick} />;

	//
}
