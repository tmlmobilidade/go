/* * */

import { events } from '@tmlmobilidade/interfaces';
import { Event } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all events for the given agencies and returns them as a Map keyed by ID
 * @param agencyIds - The agency IDs to fetch events for
 * @returns A Map of event ID to Event object
 */
export async function fetchAllEvents(agencyIds: string[]): Promise<Map<string, Event>> {
	try {
		const allEvents = await events.findByAgencyIds(agencyIds);
		const eventsMap = new Map<string, Event>();
		for (const event of allEvents) {
			eventsMap.set(event._id, event);
		}
		return eventsMap;
	} catch (error) {
		throw new Error(`Error fetching events: ${error}`);
	}
}
