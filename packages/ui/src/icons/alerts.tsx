/* * */

import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconArrowsDiff, IconBarrierBlock, IconBatteryAutomotive, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconRoadOff, IconRouteAltRight, IconServerCog, IconShieldChevron, IconSparkles, IconSpeakerphone, IconTrafficCone, IconUserExclamation, IconUserOff } from '@tabler/icons-react';
import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';

/**
 * Icons representing the extended cause values of Alerts.
 */
export const AlertCauseIcons: Record<AlertCause, React.ReactNode> = {
	ABUSIVE_PARKING: <IconUserOff />,
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	DRIVER_ABSENCE: <IconUserOff />,
	DRIVER_ISSUE: <IconUserExclamation />,
	HIGH_PASSENGER_LOAD: <IconFish style={{ transform: 'rotate(90deg) ' }} />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	NETWORK_UPDATE: <IconSparkles />,
	POLICE_ACTIVITY: <IconShieldChevron />,
	PUBLIC_DISORDER: <IconUserExclamation />,
	ROAD_ISSUE: <IconRoadOff />,
	STRIKE: <IconSpeakerphone />,
	TECHNICAL_ISSUE: <IconServerCog />,
	TRAFFIC_JAM: <IconTrafficCone />,
	VEHICLE_ISSUE: <IconBatteryAutomotive />,
	WEATHER: <IconCloudStorm />,
};

/**
 * Icons representing the extended effect values of Alerts.
 */
export const AlertEffectIcons: Record<AlertEffect, React.ReactNode> = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	MODIFIED_SERVICE: <IconArrowsDiff />,
	NO_SERVICE: <IconCircleMinus />,
	ON_BOARD_SALE_ISSUE: <IconClock2 />,
	REALTIME_INFO_ISSUE: <IconClock2 />,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
};
