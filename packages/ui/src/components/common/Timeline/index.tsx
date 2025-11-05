/* * */

import { Timeline as MantineTimeline, TimelineProps as MantineTimelineProps } from '@mantine/core';

/* * */

export function Timeline(props: MantineTimelineProps) {
	//

	//
	// A. Render Components

	return <MantineTimeline active={-1} bulletSize={26} lineWidth={2} {...props} />;

	//
}
