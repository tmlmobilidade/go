/* * */

import { RouteDetail } from '@/components/routes/detail/RouteDetail';
import { RouteDetailContextProvider } from '@/components/routes/detail/RouteDetail.context';

/* * */

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string, routeId: string }> }) {
	const { id, routeId } = await params;
	return (
		<RouteDetailContextProvider lineId={id} routeId={routeId}>
			<RouteDetail />
		</RouteDetailContextProvider>
	);
}
