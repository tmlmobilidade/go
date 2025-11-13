/* * */

import { TimelineItem as MantineTimelineItem, TimelineItemProps as MantineTimelineItemProps } from '@mantine/core';
import { IconCheck, IconExclamationMark, IconHourglass, IconX } from '@tabler/icons-react';

/* * */

type Status = 'approved' | 'none' | 'pending' | 'rejected';

/* * */

interface TimelineItemWithStatusProps extends MantineTimelineItemProps {
	status: Status
}

export function TimelineItem({ status, ...props }: TimelineItemWithStatusProps) {
	//

	//
	// A. Setup Variables

	const getStatusBullet = (status: Status) => {
		if (status === 'approved') return <IconCheck color="var(--color-status-success-primary)" size={12} />;
		if (status === 'rejected') return <IconX color="var(--color-status-danger-primary)" size={12} />;
		if (status === 'pending') return <IconHourglass color="var(--color-status-warning-primary)" size={12} />;
		return <IconExclamationMark color="var(--color-status-default)" size={12} />;
	};

	//
	// B. Render Components

	return <MantineTimelineItem bullet={getStatusBullet(status)} {...props} lineVariant="dashed" />;

	//
}
