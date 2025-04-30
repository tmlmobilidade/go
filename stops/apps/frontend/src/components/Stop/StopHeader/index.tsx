'use client';

import GenericHeader from './GenericHeader';
import SpecificHeader from './SpecificHeader';

/* * */

interface HeaderProps {
	generic: boolean
}

/* * */

export default function StopHeader({ generic }: HeaderProps) {
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
