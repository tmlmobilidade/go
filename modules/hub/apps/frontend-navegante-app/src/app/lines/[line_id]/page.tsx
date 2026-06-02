/* * */

import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { LinesDetailContextProvider } from '@/components/lines/detail/LinesDetail.context';

/* * */

export default async function Page({ params }) {
	const { line_id } = await params;
	return (
		<LinesDetailContextProvider lineId={line_id}>
			<LinesDetail />
		</LinesDetailContextProvider>
	);
}
