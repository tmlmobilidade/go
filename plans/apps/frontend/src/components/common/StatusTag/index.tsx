import { ValidationSchema } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

export function StatusTag({ status }: { status: keyof typeof ValidationSchema.shape.feeder_status.enum }) {
	//

	//
	// A. Setup variables
	const variant = useMemo(() => {
		switch (status) {
			case ValidationSchema.shape.feeder_status.enum.error:
				return 'danger';
			case ValidationSchema.shape.feeder_status.enum.processing:
				return 'warning';
			case ValidationSchema.shape.feeder_status.enum.success:
				return 'success';
			default:
				return 'muted';
		}
	}, [status]);

	//
	// B. Render
	return <Tag label={status} variant={variant} />;
}
