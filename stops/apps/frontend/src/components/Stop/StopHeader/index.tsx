'use client';

import { GenericHeader } from './GenericHeader';
import { SpecificHeader } from './SpecificHeader';

/* * */

export function StopHeader({ generic }) {
	//

	//
	// A. Render components

	return (
		<>
			{
				generic === true ? <GenericHeader /> : <SpecificHeader />
			}
		</>
	);
}
