/* * */

import { ValidationsList } from '@/components/validations/list/ValidationsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="validations"
			panes={[
				<ValidationsList key="list" />,
				children,
			]}
		/>
	);
}
