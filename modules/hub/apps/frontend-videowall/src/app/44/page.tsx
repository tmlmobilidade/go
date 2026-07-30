/* * */

import { Agency44Videowall } from '@/agencies/44/Agency44Videowall';
import { PasswordCheck } from '@/components/common/PasswordCheck';

/* * */

export default function Page() {
	return (
		<PasswordCheck id="44" password="Q2R19">
			<Agency44Videowall />
		</PasswordCheck>
	);
}
