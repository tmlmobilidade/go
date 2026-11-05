/* * */

import { PatternDetail } from '@/components/patterns/detail/PatternDetail';
import { PatternDetailContextProvider } from '@/components/patterns/detail/PatternDetail.context';

/* * */

export default async function PatternDetailPage({ params }: { params: Promise<{ id: string, patternId: string, routeId: string }> }) {
	const { patternId } = await params;
	return (
		<PatternDetailContextProvider key={patternId}>
			<PatternDetail />
		</PatternDetailContextProvider>
	);
}
