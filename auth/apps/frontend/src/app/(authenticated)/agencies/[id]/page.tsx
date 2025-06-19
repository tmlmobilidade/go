/* * */

import { AgencyDetail } from '@/components/agencies/detail/AgencyDetail';
import { AgencyDetailContextProvider } from '@/contexts/AgencyDetail.context';

/* * */

interface Props {
	params: Promise<{ id: string }>
}

/* * */

export default async function Page({ params }: Props) {
	const { id } = await params;
	return (
		<AgencyDetailContextProvider agency_id={id}>
			<AgencyDetail />
		</AgencyDetailContextProvider>
	);
}
