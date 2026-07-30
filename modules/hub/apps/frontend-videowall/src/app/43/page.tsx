/* * */

import { Agency43Videowall } from '@/agencies/43/Agency43Videowall';
import { PasswordCheck } from '@/components/common/PasswordCheck';

/* * */

export default function Page() {
	return (
		<PasswordCheck id="43" password="F94S2">
			<Agency43Videowall />
		</PasswordCheck>
	);
}
