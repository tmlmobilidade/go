/* * */

import { ChangelogDetail } from '@/components/dev/changelogs/detail/ChangelogDetail';
import { ChangelogDetailFormContextProvider } from '@/components/dev/changelogs/detail/ChangelogDetailForm.context';

/* * */

export default async function Page() {
	return (
		<ChangelogDetailFormContextProvider>
			<ChangelogDetail />
		</ChangelogDetailFormContextProvider>
	);
}
