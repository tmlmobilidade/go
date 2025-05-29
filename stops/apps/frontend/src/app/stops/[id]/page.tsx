import { Form } from '@/components/Form';
import Stop from '@/components/Stop';
import { StopsDetailContextProvider } from '@/contexts/StopsDetail.context';
import { StopsListContextProvider } from '@/contexts/StopsList.context';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<StopsListContextProvider>
			<StopsDetailContextProvider stopId={id}>
				{id == 'new' ? <Form /> : <Stop paramId={id} />}
			</StopsDetailContextProvider>
		</StopsListContextProvider>
	);
}
