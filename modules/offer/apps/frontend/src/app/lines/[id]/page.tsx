/* * */

import { LineDetail } from '@/components/lines/detail/LineDetail';
import { LineDetailContextProvider } from '@/components/lines/detail/LineDetail.context';

/* * */

export default async function LineDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<LineDetailContextProvider lineId={id}>
			<LineDetail />
		</LineDetailContextProvider>
	);
}
