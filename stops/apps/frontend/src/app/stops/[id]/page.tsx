/* * */

import { FormInfos } from '@/components/Stops/Form';
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
