/* * */

import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';

/* * */

export default async function Page({ params }) {
	const { line_id } = await params;
	const decodedLineId = decodeURIComponent(line_id);
	return (
		<LinesDetailContextProvider lineId={decodedLineId}>
			<LinesDetail />
		</LinesDetailContextProvider>
	);
}
