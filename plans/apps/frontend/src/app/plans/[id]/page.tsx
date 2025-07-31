/* * */

import { PlansDetail } from '@/components/plans/detail/PlansDetail';
import { PlansDetailContextProvider } from '@/contexts/PlansDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PlansDetailContextProvider planId={id}>
			<PlansDetail />
		</PlansDetailContextProvider>
	);
}
