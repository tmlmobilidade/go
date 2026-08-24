/* * */

import { SchoolDetail } from '@/components/detail/SchoolDetail';
import { SchoolDetailContextProvider } from '@/components/detail/SchoolDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ schoolId: string }> }) {
	const { schoolId } = await params;
	return (
		<SchoolDetailContextProvider schoolId={schoolId}>
			<SchoolDetail />
		</SchoolDetailContextProvider>
	);
}
