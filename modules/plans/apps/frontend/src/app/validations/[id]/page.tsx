/* * */

import { ValidationsDetail } from '@/components/validations/detail/ValidationsDetail';
import { ValidationsDetailContextProvider } from '@/contexts/ValidationsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<ValidationsDetailContextProvider validationId={id}>
			<ValidationsDetail />
		</ValidationsDetailContextProvider>
	);
}
