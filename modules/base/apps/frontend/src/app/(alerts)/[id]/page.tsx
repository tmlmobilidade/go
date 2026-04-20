/* * */

import { AlertPublicDetail } from '@/components/modules/alerts/detail/AlertPublicDetail';
import { AlertPublicDetailContextProvider } from '@/contexts/AlertPublicDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AlertPublicDetailContextProvider alertId={id}>
			<AlertPublicDetail />
		</AlertPublicDetailContextProvider>
	);
}
