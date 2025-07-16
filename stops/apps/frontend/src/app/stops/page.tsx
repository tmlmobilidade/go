'use client';

import { TransparentPane } from '@/components/TransparentPane';
import { NoDataLabel } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	return (
		<TransparentPane>
			<NoDataLabel text="Selecionar uma paragem" />
		</TransparentPane>
	);
}
