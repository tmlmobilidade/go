/* * */

import { ValidationDetail } from '@/components/plans/detail/ValidationDetail';
import { ValidationDetailContextProvider } from '@/contexts/ValidationDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<ValidationDetailContextProvider validationId={id}>
			<ValidationDetail />
		</ValidationDetailContextProvider>
	);
}
