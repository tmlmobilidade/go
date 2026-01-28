import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconBarrierBlock, IconCalendarEvent, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconQuestionMark, IconRoadOff, IconRouteAltRight, IconServerCog, IconShieldChevron, IconSpeakerphone, IconTool, IconTrafficCone, IconUserExclamation, IconUserOff } from '@tabler/icons-react';
import { AlertCause, GtfsEffect } from '@tmlmobilidade/types';

export const CauseIcons: Record<AlertCause, React.ReactNode> = {
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	DRIVER_ABSENCE: <IconUserOff />,
	DRIVER_ISSUE: <IconUserExclamation />,
	HIGH_PASSENGER_LOAD: <IconFish style={{ transform: 'rotate(90deg) ' }} />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	POLICE_ACTIVITY: <IconShieldChevron />,
	PUBLIC_DISORDER: <IconRoadOff />,
	ROAD_ISSUE: <IconRoadOff />,
	STRIKE: <IconSpeakerphone />,
	TECHNICAL_ISSUE: <IconServerCog />,
	TRAFFIC_JAM: <IconTrafficCone />,
	WEATHER: <IconCloudStorm />,
};

export const EffectIcons: Record<GtfsEffect, React.ReactNode> = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	MODIFIED_SERVICE: <IconClock2 />,
	NO_EFFECT: <IconCalendarEvent />,
	NO_SERVICE: <IconCircleMinus />,
	OTHER_EFFECT: <IconTool />,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
	UNKNOWN_EFFECT: <IconQuestionMark />,
};
