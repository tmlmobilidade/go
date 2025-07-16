/* * */

import { StopDetails } from '@/components/Stops/Form/Stopdetails';
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
			<StopDetails />
		</StopDetailContextProvider>
	);
}
