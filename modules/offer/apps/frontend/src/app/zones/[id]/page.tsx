import { ZoneDetail } from '@/components/zones/detail/ZoneDetail';
import { ZoneDetailContextProvider } from '@/components/zones/detail/ZoneDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<ZoneDetailContextProvider zoneId={id}>
			<ZoneDetail />
		</ZoneDetailContextProvider>
	);
}
