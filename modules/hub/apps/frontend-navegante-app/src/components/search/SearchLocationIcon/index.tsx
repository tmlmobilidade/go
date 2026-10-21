import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { IconBed, IconBuildingCommunity, IconBuildingHospital, IconBuildingMonument, IconCoffee, IconMapPin, IconParking, IconRecycle, IconRoad, IconShoppingBag, IconToolsKitchen2 } from '@tabler/icons-react';

/* * */

interface SearchLocationIconProps {
	location: RoutePlannerLocation
}

/** Show the location kind reported by MOTIS; unknown categories use a generic pin. */
export function SearchLocationIcon({ location }: SearchLocationIconProps) {
	if (location.type === 'ADDRESS') return <IconRoad size={22} />;

	const category = (location.category ?? '').replace(/_\d+$/, '');
	if (category === 'parking' || category === 'parking_entrance') return <IconParking size={22} />;
	if (/^(place(?:_|$)|city$|town$|village$|hamlet$|suburb$|quarter$|neighbourhood$)/.test(category)) return <IconBuildingCommunity size={22} />;
	if (['bar', 'cafe', 'pub'].includes(category)) return <IconCoffee size={22} />;
	if (['fast_food', 'food_court', 'restaurant'].includes(category)) return <IconToolsKitchen2 size={22} />;
	if (['clinic', 'dentist', 'doctors', 'hospital', 'pharmacy'].includes(category)) return <IconBuildingHospital size={22} />;
	if (['guest_house', 'hostel', 'hotel', 'motel'].includes(category)) return <IconBed size={22} />;
	if (['gallery', 'garden', 'memorial', 'monument', 'museum', 'park', 'square', 'viewpoint'].includes(category)) return <IconBuildingMonument size={22} />;
	if (['bakery', 'butcher', 'clothes', 'convenience', 'gift', 'mall', 'shop', 'supermarket'].includes(category)) return <IconShoppingBag size={22} />;
	if (category === 'recycling') return <IconRecycle size={22} />;
	return <IconMapPin size={22} />;
}
