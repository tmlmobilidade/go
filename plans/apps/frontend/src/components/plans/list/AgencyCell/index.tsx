import { AVAILABLE_AGENCIES } from '@tmlmobilidade/lib';
import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export default function AgencyCell({ agencyId }: { agencyId: string }) {
	//

	//
	// A. Setup variables

	//
	// B. Render
	return (
		<div className={styles.wrapper}>
			<div className={styles.badges}>
				<Tag label={AVAILABLE_AGENCIES.find(agency => agency._id === agencyId)?.name} variant="muted" />
			</div>
		</div>
	);
}
