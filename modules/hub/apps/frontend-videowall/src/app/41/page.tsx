/* * */

import { Agency41Videowall } from '@/agencies/41/Agency41Videowall';
import { PasswordCheck } from '@/components/common/PasswordCheck';

/* * */

export default function Page() {
	return (
		<PasswordCheck id="41" password="7425Q">
			<Agency41Videowall />
		</PasswordCheck>
	);
}
