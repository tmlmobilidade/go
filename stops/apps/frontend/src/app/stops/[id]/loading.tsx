/* * */

import { TransparentPane } from '@/components/TransparentPane';
import { Loader } from '@tmlmobilidade/ui';

/* * */

export default async function Loading() {
	return (
		<TransparentPane>
			<Loader />
		</TransparentPane>
	);
}
