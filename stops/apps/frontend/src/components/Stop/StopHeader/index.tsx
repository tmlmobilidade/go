'use client';

import { GenericHeader } from './GenericHeader';
import { SpecificHeader } from './SpecificHeader';

/* * */

export function StopHeader({ data, generic }) {
	//

	//
	// A. Render components

	return (
		<>
			{
				generic === true ? <GenericHeader /> : <SpecificHeader data={data} />
			}
		</>
	);
}
