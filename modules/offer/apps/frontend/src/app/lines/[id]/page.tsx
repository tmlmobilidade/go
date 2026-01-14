/* * */

import { LineDetail } from '@/components/lines/detail/LineDetail';
import { LineDetailContextProvider } from '@/components/lines/detail/LineDetail.context';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';

/* * */

export default async function LineDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<LinesListContextProvider>
			<LineDetailContextProvider lineId={id}>
				<LineDetail />
			</LineDetailContextProvider>
		</LinesListContextProvider>
	);
}
