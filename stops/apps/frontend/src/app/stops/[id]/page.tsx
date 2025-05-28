import { Form } from '@/components/Form';
import Stop from '@/components/Stop';
import { StopsDetailContextProvider } from '@/contexts/StopsDetail.context';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return (
		<StopsDetailContextProvider stopId={id}>
			{id == 'new' ? <Form /> : <Stop paramId={id} />}
		</StopsDetailContextProvider>
	);
}
