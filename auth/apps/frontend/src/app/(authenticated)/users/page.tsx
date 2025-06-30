'use client';

import { NoDataLabel } from '@/components/NoDataLabel';
import { TransparentPane } from '@/components/TransparentPane';

/* * */

export default function Page() {
	return (
		<TransparentPane>
			<NoDataLabel text="Selecione um Utilizador" />
		</TransparentPane>
	);
}
