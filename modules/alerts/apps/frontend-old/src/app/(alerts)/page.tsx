/* * */

import { AlertCreate } from '@/components/create/AlertCreate';
import { AlertCreateContextProvider } from '@/components/create/AlertCreate.context';

/* * */

export default async function Page() {
	return (
		<AlertCreateContextProvider>
			<AlertCreate />
		</AlertCreateContextProvider>
	);
}
