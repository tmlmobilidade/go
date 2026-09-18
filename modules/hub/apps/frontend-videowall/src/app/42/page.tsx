/* * */

import { Area42AllScreens } from '@/areas/42/Area42AllScreens';
import { PasswordCheck } from '@/components/PasswordCheck';

/* * */

export default function Page() {
	return (
		<PasswordCheck id="42" password="F0113">
			<Area42AllScreens />
		</PasswordCheck>
	);
}
