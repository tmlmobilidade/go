/* * */

import { Agency42Videowall } from '@/agencies/42/Agency42Videowall';
import { PasswordCheck } from '@/components/common/PasswordCheck';

/* * */

export default function Page() {
	return (
		<PasswordCheck id="42" password="F0113">
			<Agency42Videowall />
		</PasswordCheck>
	);
}
