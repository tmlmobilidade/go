/* * */

import { AlertDetail } from '@/components/common/detail/AlertDetail';
import { AlertDetailContextProvider } from '@/components/common/detail/AlertDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AlertDetailContextProvider alertId={id}>
			<AlertDetail />
		</AlertDetailContextProvider>
	);
}
