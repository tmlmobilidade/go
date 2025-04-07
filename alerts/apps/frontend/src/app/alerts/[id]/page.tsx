/* * */

import { AlertDetail } from '@/components/detail/AlertDetail';
import { AlertDetailContextProvider } from '@/contexts/AlertDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AlertDetailContextProvider alertId={id}>
			<AlertDetail />
		</AlertDetailContextProvider>
	);
}
