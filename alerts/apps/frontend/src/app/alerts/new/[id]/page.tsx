/* * */

import AlertDuplicate from '@/components/detail/AlertDuplicate';
import { AlertDetailContextProvider } from '@/contexts/AlertDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AlertDetailContextProvider alertId="new">
			<AlertDuplicate id={id} />
		</AlertDetailContextProvider>
	);
}
