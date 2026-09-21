import { type BaseMapOperatorId } from '@/lib/agency-catalog';
import { isBaseMapAgencyVisible } from '@/utils/map/base-map-operators';
import { getRoutePlannerRouteDirectionKey } from '@/utils/route-planner/itinerary/vehicles';

/* * */

interface BaseMapAlert {
	_id: string
	agency_id: string
}

interface BaseMapVehicleProperties {
	agency_id?: null | string
	direction_id?: null | number | string
	route_id?: null | string
	shape_id?: null | string
	vehicle_id?: null | string
}

interface GetBaseMapAlertsMapDataParams {
	alerts: BaseMapAlert[]
	alertsData: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
	excludedOperatorIds: BaseMapOperatorId[]
	focusedAlertId: null | string
	routePlannerAlertsData: GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
}

interface GetBaseMapVehiclesMapDataParams<TProperties extends BaseMapVehicleProperties> {
	excludedOperatorIds: BaseMapOperatorId[]
	focusedVehicleId: null | string
	lineDetailShapeIds: null | Set<string>
	routePlannerRouteDirections: null | Set<string>
	vehiclesData: GeoJSON.FeatureCollection<GeoJSON.Point, TProperties>
}

/* * */

function getAlertFeatureId(feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>) {
	return feature.properties?.id ?? feature.properties?._id;
}

function getVehicleFeatureId(feature: GeoJSON.Feature<GeoJSON.Point, BaseMapVehicleProperties>) {
	return feature.properties?.vehicle_id;
}

/* * */

export function getBaseMapAlertsMapData(params: GetBaseMapAlertsMapDataParams) {
	const features = [...params.routePlannerAlertsData.features];
	const focusedAlertFeature = params.focusedAlertId
		? params.alertsData.features.find(feature => getAlertFeatureId(feature) === params.focusedAlertId)
		: undefined;

	if (focusedAlertFeature && !features.some(feature => getAlertFeatureId(feature) === params.focusedAlertId)) {
		features.push(focusedAlertFeature);
	}

	const visibleAlertIds = new Set(
		params.alerts
			.filter(alert => isBaseMapAgencyVisible(alert.agency_id, params.excludedOperatorIds))
			.map(alert => alert._id),
	);
	if (params.focusedAlertId) visibleAlertIds.add(params.focusedAlertId);

	return {
		...params.routePlannerAlertsData,
		features: features
			.filter(feature => visibleAlertIds.has(String(getAlertFeatureId(feature))))
			.map((feature) => {
				const isFocused = getAlertFeatureId(feature) === params.focusedAlertId;
				return {
					...feature,
					properties: {
						...feature.properties,
						is_dimmed: Boolean(params.focusedAlertId) && !isFocused,
						is_focused: isFocused,
					},
				};
			}),
	};
}

export function getBaseMapVehiclesMapData<TProperties extends BaseMapVehicleProperties>(params: GetBaseMapVehiclesMapDataParams<TProperties>) {
	const routePlannerVehiclesData = params.routePlannerRouteDirections
		? {
			...params.vehiclesData,
			features: params.vehiclesData.features.filter((feature) => {
				const vehicle = feature.properties;
				const routeDirection = getRoutePlannerRouteDirectionKey(vehicle?.route_id, vehicle?.direction_id, vehicle?.agency_id);
				return routeDirection !== null && params.routePlannerRouteDirections?.has(routeDirection);
			}),
		}
		: params.vehiclesData;

	const lineDetailVehiclesData = params.lineDetailShapeIds
		? {
			...params.vehiclesData,
			features: params.vehiclesData.features.filter((feature) => {
				const shapeId = feature.properties?.shape_id;
				return typeof shapeId === 'string' && params.lineDetailShapeIds?.has(shapeId);
			}),
		}
		: routePlannerVehiclesData;

	const features = [...lineDetailVehiclesData.features];
	const focusedVehicleFeature = params.focusedVehicleId
		? params.vehiclesData.features.find(feature => getVehicleFeatureId(feature) === params.focusedVehicleId)
		: undefined;

	if (focusedVehicleFeature && !features.some(feature => getVehicleFeatureId(feature) === params.focusedVehicleId)) {
		features.push(focusedVehicleFeature);
	}

	return {
		...lineDetailVehiclesData,
		features: features
			.filter((feature) => {
				return getVehicleFeatureId(feature) === params.focusedVehicleId || isBaseMapAgencyVisible(feature.properties?.agency_id ?? '', params.excludedOperatorIds);
			})
			.map((feature) => {
				const isFocused = getVehicleFeatureId(feature) === params.focusedVehicleId;
				return {
					...feature,
					properties: {
						...feature.properties,
						is_dimmed: Boolean(params.focusedVehicleId) && !isFocused,
						is_focused: isFocused,
					},
				};
			}),
	};
}
