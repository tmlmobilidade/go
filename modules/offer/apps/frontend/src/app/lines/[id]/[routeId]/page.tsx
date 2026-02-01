/* * */

import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { RouteDetail } from '@/components/routes/detail/RouteDetail';
import { RouteDetailContextProvider } from '@/components/routes/detail/RouteDetail.context';

/* * */

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string, routeId: string }> }) {
	const { id, routeId } = await params;
	return (
		<LinesListContextProvider>
			<RouteDetailContextProvider lineId={id} routeId={routeId}>
				<RouteDetail />
			</RouteDetailContextProvider>
		</LinesListContextProvider>
	);
}
