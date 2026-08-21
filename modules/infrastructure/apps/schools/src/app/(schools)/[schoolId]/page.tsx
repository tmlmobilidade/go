/* * */

import { SchoolDetail } from '@/components/detail/SchoolDetail';
import { SchoolDetailContextProvider } from '@/components/detail/SchoolDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<SchoolDetailContextProvider schoolId={id}>
			<SchoolDetail />
		</SchoolDetailContextProvider>
	);
}
