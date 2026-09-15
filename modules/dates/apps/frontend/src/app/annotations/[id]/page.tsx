/* * */

import { AnnotationsDetail } from '@/components/annotations/detail/AnnotationsDetail';
import { AnnotationsDetailFormContextProvider } from '@/components/annotations/detail/AnnotationsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<AnnotationsDetailFormContextProvider>
			<AnnotationsDetail />
		</AnnotationsDetailFormContextProvider>
	);
}
