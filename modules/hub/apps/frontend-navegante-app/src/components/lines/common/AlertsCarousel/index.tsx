'use client';

import { AlertsCarouselSlide } from '@/components/lines/common/AlertsCarouselSlide';
import Carousel from '@/components/lines/common/Carousel';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';

/* * */

interface Props {
	alerts: HubV1ApiAlert[]
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
