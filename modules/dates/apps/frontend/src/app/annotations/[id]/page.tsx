/* * */

import { AnnotationsDetail } from '@/components/annotations/detail/AnnotationsDetail';
import { AnnotationsDetailContextProvider } from '@/components/annotations/detail/AnnotationsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AnnotationsDetailContextProvider annotationId={id}>
			<AnnotationsDetail />
		</AnnotationsDetailContextProvider>
	);
}
