'use client';

import type { HubAlert } from '@tmlmobilidade/types';

import { AlertsCarouselSlide } from '@/components/lines/common/AlertsCarouselSlide';
import Carousel from '@/components/lines/common/Carousel';

/* * */

interface Props {
	alerts: HubAlert[]
}

/* * */

export function AlertsCarousel({ alerts }: Props) {
	const carouselSlides = alerts?.map((slideItem, index) => ({
		_id: `${slideItem._id}-${index}`,
		component: (
			<AlertsCarouselSlide alert={slideItem} />
		),
	}));

	return (
		<Carousel slides={carouselSlides} />
	);
}
