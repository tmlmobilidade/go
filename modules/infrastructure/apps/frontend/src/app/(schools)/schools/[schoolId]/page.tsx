/* * */

import { SchoolDetail } from '@/components/schools/detail/SchoolDetail';
import { SchoolsDetailFormContextProvider } from '@/components/schools/detail/SchoolsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<SchoolsDetailFormContextProvider>
			<SchoolDetail />
		</SchoolsDetailFormContextProvider>
	);
}
