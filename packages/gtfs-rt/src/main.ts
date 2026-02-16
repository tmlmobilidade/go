/* * */

import { initProto } from '@/init-proto.js';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/**
 * Decodes a GTFS Realtime feed from an ArrayBuffer or Buffer.
 * @param buffer The GTFS Realtime feed as an ArrayBuffer or Buffer.
 * @returns The decoded GTFS Realtime feed as a JavaScript object.
 */
export async function decodeGtfsRtFeed(buffer: ArrayBuffer | Buffer): Promise<GtfsRtFeedMessage> {
	//

	//
	// Initialize the protobufjs root
	// with the GTFS Realtime .proto file

	const protoRoot = await initProto();

	//
	// Check if the buffer is an ArrayBuffer
	// and convert it to a Node.js Buffer if necessary

	if (buffer instanceof ArrayBuffer) {
		buffer = Buffer.from(buffer);
	}

	//
	// Decode the GTFS Realtime feed using the protobufjs root

	const feedMessage = protoRoot.lookupType('transit_realtime.FeedMessage');

	const decodedMessage = feedMessage.decode(buffer);

	return feedMessage.toObject(decodedMessage) as GtfsRtFeedMessage;

	//
}
