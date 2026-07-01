/* * */

import { AllScreens } from '@/areas/42/AllScreens';
import { PasswordCheck } from '@/components/PasswordCheck';

/* * */

export default function Area2() {
	return (
		<PasswordCheck id="42" password="F0113">
			<AllScreens />
		</PasswordCheck>
	);
}
