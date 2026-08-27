/* * */

import { SchoolDetail } from '@/components/schools/detail/SchoolDetail';
import { SchoolDetailContextProvider } from '@/components/schools/detail/SchoolDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ schoolId: string }> }) {
	const { schoolId } = await params;
	return (
		<SchoolDetailContextProvider schoolId={schoolId}>
			<SchoolDetail />
		</SchoolDetailContextProvider>
	);
}
