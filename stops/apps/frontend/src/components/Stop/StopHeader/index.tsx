'use client';

import { GenericHeader } from './GenericHeader';
import { SpecificHeader } from './SpecificHeader';

/* * */

export function StopHeader({ actions, data, generic }) {
	//

	//
	// A. Render components

	return (
		<>
			{
				generic === true ? <GenericHeader /> : <SpecificHeader actions={actions} data={data} />
			}
		</>
	);
}
