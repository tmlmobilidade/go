/* * */

export function isBaseShape(shapeId: string, routeId: string): boolean {
	return shapeId === `${routeId}_0` || shapeId.startsWith(`${routeId}_0_`);
}
