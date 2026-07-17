/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Event } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all events for a given agency and returns them as a Map keyed by ID
 * @param agencyId - The agency ID to fetch events for
 * @returns A Map of event ID to Event object
 */
export async function fetchAllEvents(agencyId: string): Promise<Map<string, Event>> {
	try {
		const allEvents = await goDb.offer.events.findMany({ agency_ids: { $in: [agencyId] } });
		const eventsMap = new Map<string, Event>();
		for (const event of allEvents) {
			eventsMap.set(event._id, event);
		}
		return eventsMap;
	} catch (error) {
		throw new Error(`Error fetching events: ${error}`);
	}
}
