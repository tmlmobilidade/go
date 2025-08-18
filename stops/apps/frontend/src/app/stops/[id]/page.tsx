/* * */

import { FormInfos } from '@/components/stops2/Detail/Form';
import { StopDetailContextProvider } from '@/contexts/StopDetails.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<StopDetailContextProvider stopId={id}>
			<FormInfos />
		</StopDetailContextProvider>
	);
}
