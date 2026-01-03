import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconBarrierBlock, IconCalendarEvent, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconRoadOff, IconRouteAltRight, IconServerCog, IconSettings, IconShieldChevron, IconSpeakerphone, IconTool, IconTrafficCone, IconUserExclamation, IconUserOff } from '@tabler/icons-react';
import { GtfsCauseExtended, GtfsEffect } from '@tmlmobilidade/types';

export const CauseIcons: Record<GtfsCauseExtended, React.ReactNode> = {
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	HOLIDAY: <IconCalendarEvent />,
	MAINTENANCE: <IconTool />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	POLICE_ACTIVITY: <IconShieldChevron />,
	STRIKE: <IconSpeakerphone />,
	TECHNICAL_PROBLEM: <IconTool />,
	WEATHER: <IconCloudStorm />,

	/* * */

	DRIVER_ABSENCE: <IconUserOff />,
	DRIVER_ISSUE: <IconUserExclamation />,
	HIGH_PASSENGER_LOAD: <IconFish style={{ transform: 'rotate(90deg) ' }} />,
	ROAD_INCIDENT: <IconRoadOff />,
	SYSTEM_FAILURE: <IconServerCog />,
	TRAFFIC_JAM: <IconTrafficCone />,
	VEHICLE_ISSUE: <IconSettings />,
};

export const EffectIcons: Record<GtfsEffect, React.ReactNode> = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	MODIFIED_SERVICE: <IconClock2 />,
	NO_SERVICE: <IconCircleMinus />,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
};
