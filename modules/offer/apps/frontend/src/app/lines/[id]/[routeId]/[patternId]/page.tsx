/* * */

import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { PatternDetail } from '@/components/patterns/detail/PatternDetail';
import { PatternDetailContextProvider } from '@/components/patterns/detail/PatternDetail.context';
import { RouteDetailContextProvider } from '@/components/routes/detail/RouteDetail.context';
import { PeriodsContextProvider } from '@/contexts/Periods.context';
import { LocationsContextProvider } from '@tmlmobilidade/ui';

/* * */

export default async function PatternDetailPage({ params }: { params: Promise<{ id: string, patternId: string, routeId: string }> }) {
	const { id, patternId, routeId } = await params;
	return (
		// Move these providers to a higher level and pass agencyId to periods
		<PeriodsContextProvider>
			<LinesListContextProvider>
				<RouteDetailContextProvider lineId={id} routeId={routeId}>
					<LocationsContextProvider>
						<PatternDetailContextProvider lineId={id} patternId={patternId}>
							<PatternDetail />
						</PatternDetailContextProvider>
					</LocationsContextProvider>
				</RouteDetailContextProvider>
			</LinesListContextProvider>
		</PeriodsContextProvider>
	);
}
