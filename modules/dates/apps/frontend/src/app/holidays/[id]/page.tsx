/* * */

import { HolidaysDetail } from '@/components/holidays/detail/HolidaysDetail';
import { HolidaysDetailContextProvider } from '@/components/holidays/detail/HolidaysDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<HolidaysDetailContextProvider holidayId={id}>
			<HolidaysDetail />
		</HolidaysDetailContextProvider>
	);
}
