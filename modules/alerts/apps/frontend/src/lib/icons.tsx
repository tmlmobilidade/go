import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconBarrierBlock, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconRoadOff, IconRouteAltRight, IconServerCog, IconShieldChevron, IconSpeakerphone, IconTrafficCone, IconUserExclamation, IconUserOff } from '@tabler/icons-react';
import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';

export const CauseIcons: Record<AlertCause, React.ReactNode> = {
	ACCIDENT: <IconCarCrash />,
	CONSTRUCTION: <IconBarrierBlock />,
	DEMONSTRATION: <IconSpeakerphone />,
	MEDICAL_EMERGENCY: <IconAmbulance />,
	POLICE_ACTIVITY: <IconShieldChevron />,
	STRIKE: <IconSpeakerphone />,
	WEATHER: <IconCloudStorm />,

	/* * */

	ABUSIVE_PARKING: <IconUserOff />,
	DRIVER_ABSENCE: <IconUserOff />,
	DRIVER_ISSUE: <IconUserExclamation />,
	HIGH_PASSENGER_LOAD: <IconFish style={{ transform: 'rotate(90deg) ' }} />,
	PUBLIC_DISORDER: <IconUserExclamation />,
	ROAD_ISSUE: <IconRoadOff />,
	TECHNICAL_ISSUE: <IconServerCog />,
	TRAFFIC_JAM: <IconTrafficCone />,
};

export const EffectIcons: Record<AlertEffect, React.ReactNode> = {
	ACCESSIBILITY_ISSUE: <IconAccessible />,
	ADDITIONAL_SERVICE: <IconArrowBigUpLines />,
	DETOUR: <IconRouteAltRight />,
	NO_SERVICE: <IconCircleMinus />,
	ON_BOARD_SALE_ISSUE: <IconClock2 />,
	REALTIME_INFO_ISSUE: <IconClock2 />,
	REDUCED_SERVICE: <IconCircleArrowDown />,
	SIGNIFICANT_DELAYS: <IconClockExclamation />,
	STOP_MOVED: <IconCircleArrowDown />,
};
