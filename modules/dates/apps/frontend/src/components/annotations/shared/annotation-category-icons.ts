import { type Icon, IconBusStop, IconCarCrash, IconCloudStorm, IconDots, IconRoad, IconSchool, IconServerOff, IconSpeakerphone, IconTicket, IconUsersGroup } from '@tabler/icons-react';
import { type AnnotationCategory } from '@tmlmobilidade/go-types-dates';

/* * */

export const annotationCategoryIcons: Record<AnnotationCategory, Icon> = {
	accident: IconCarCrash,
	fare_policy_change: IconTicket,
	other: IconDots,
	public_event_protest: IconSpeakerphone,
	roadworks_restrictions: IconRoad,
	school_calendar_change: IconSchool,
	strike_worker_meeting: IconUsersGroup,
	technology_data_failure: IconServerOff,
	transport_disruption: IconBusStop,
	weather: IconCloudStorm,
};
