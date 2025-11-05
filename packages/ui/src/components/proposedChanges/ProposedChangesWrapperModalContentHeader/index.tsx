/* * */

import { cloneElement } from 'react';

/* * */

interface ProposedChangesWrapperModalContentHeaderProps {
	originalInput: React.ReactElement<{ disabled?: boolean }>
}

/* * */

export function ProposedChangesWrapperModalContentHeader({ originalInput }: ProposedChangesWrapperModalContentHeaderProps) {
	//

	//
	// A. Render Components
	return (
		<>
			<p>Valor Atual</p>
			{cloneElement(originalInput, { disabled: true })}
		</>
	);
};
