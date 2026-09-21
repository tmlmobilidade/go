/* * */

import { IconAccessible, IconAlertTriangle, IconAmbulance, IconArrowBigUpLines, IconArrowsDiff, IconBarrierBlock, IconBatteryAutomotive, IconCalendarEvent, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconHelpCircle, IconInfoCircle, IconRoadOff, IconRouteAltRight, IconServerCog, IconShieldChevron, IconSparkles, IconSpeakerphone, IconTools, IconTrafficCone, IconUserExclamation, IconUserOff } from '@tabler/icons-react';
import { type GtfsRtCause, type GtfsRtEffect } from '@tmlmobilidade/go-types-gtfs-rt';
import { type AlertCause, type AlertEffect } from '@tmlmobilidade/go-types-operation';

/**
 * Icons representing standard GTFS-RT and extended operational alert causes.
 */
export const AlertCauseIcons: Record<AlertCause | GtfsRtCause, React.ReactNode> = {
	ABUSIVE_PARKING: <IconUserOff />,
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	DRIVER_ABSENCE: <IconUserOff />,
	DRIVER_ISSUE: <IconUserExclamation />,
	HIGH_PASSENGER_LOAD: <IconFish style={{ transform: 'rotate(90deg) ' }} />,
	HOLIDAY: <IconCalendarEvent />,
	MAINTENANCE: <IconTools />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	NETWORK_UPDATE: <IconSparkles />,
	OTHER_CAUSE: <IconAlertTriangle />,
	POLICE_ACTIVITY: <IconShieldChevron />,
	PUBLIC_DISORDER: <IconUserExclamation />,
	ROAD_ISSUE: <IconRoadOff />,
	STRIKE: <IconSpeakerphone />,
	TECHNICAL_ISSUE: <IconServerCog />,
	TRAFFIC_JAM: <IconTrafficCone />,
	UNKNOWN_CAUSE: <IconHelpCircle />,
	VEHICLE_ISSUE: <IconBatteryAutomotive />,
	WEATHER: <IconCloudStorm />,
};

/**
 * Icons representing standard GTFS-RT and extended operational alert effects.
 */
export const AlertEffectIcons: Record<AlertEffect | GtfsRtEffect, React.ReactNode> = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	MODIFIED_SERVICE: <IconArrowsDiff />,
	NO_EFFECT: <IconInfoCircle />,
	NO_SERVICE: <IconCircleMinus />,
	ON_BOARD_SALE_ISSUE: <IconClock2 />,
	OTHER_EFFECT: <IconAlertTriangle />,
	REALTIME_INFO_ISSUE: <IconClock2 />,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
	UNKNOWN_EFFECT: <IconHelpCircle />,
};
