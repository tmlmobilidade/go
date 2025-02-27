import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconBarrierBlock, IconCalendarEvent, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconInfoTriangle, IconRouteAltRight, IconSpeakerphone, IconTool } from '@tabler/icons-react';

export const CauseIcons = {
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	HOLIDAY: <IconCalendarEvent />,
	MAINTENANCE: <IconTool />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	OTHER_CAUSE: <IconInfoTriangle />,
	POLICE_ACTIVITY: <IconAmbulance />,
	STRIKE: <IconSpeakerphone />,
	TECHNICAL_PROBLEM: <IconCarCrash />,
	UNKNOWN_CAUSE: <IconInfoTriangle />,
	WEATHER: <IconCloudStorm />,
};

export const EffectIcons = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	MODIFIED_SERVICE: <IconClock2 />,
	NO_EFFECT: null,
	NO_SERVICE: <IconCircleMinus />,
	OTHER_EFFECT: null,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
	UNKNOWN_EFFECT: <IconInfoTriangle />,
};
