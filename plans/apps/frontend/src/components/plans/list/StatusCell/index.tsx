import { PlanSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { ComponentProps } from 'react';

import styles from './styles.module.css';

export default function StatusCell({ status }: { status: typeof PlanSchema.shape.feeder_status.options[number] }) {
	//

	//
	// A. Setup variables
	let variant: ComponentProps<typeof Tag>['variant'] = 'muted';

	switch (status) {
		case 'processing':
			variant = 'primary';
			break;
		case 'success':
			variant = 'success';
			break;
		case 'waiting':
			variant = 'muted';
			break;
		case 'error':
			variant = 'danger';
	}

	//
	// B. Render
	return (
		<div className={styles.wrapper}>
			<Tag label={status} variant={variant} />
		</div>
	);
}
