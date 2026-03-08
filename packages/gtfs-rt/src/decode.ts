/* * */

import { initProto } from '@/init-proto.js';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/**
 * Decodes a GTFS-RT feed from an ArrayBuffer or Buffer.
 * @param buffer The GTFS-RT feed as an ArrayBuffer or Buffer.
 * @returns The decoded GTFS-RT feed as a JavaScript object.
 */
export async function decodeGtfsRtFeed(buffer: ArrayBuffer | Buffer): Promise<GtfsRtFeedMessage> {
	//

	//
	// Initialize the protobufjs root
	// with the GTFS-RT .proto file

	const protoRoot = await initProto();

	//
	// Check if the buffer is an ArrayBuffer
	// and convert it to a Node.js Buffer if necessary

	if (buffer instanceof ArrayBuffer) {
		buffer = Buffer.from(buffer);
	}

	//
	// Decode the GTFS-RT feed using the protobufjs root

	const feedMessageType = protoRoot.lookupType('transit_realtime.FeedMessage');

	const message = feedMessageType.decode(buffer);

	return feedMessageType.toObject(message, { enums: String, longs: Number }) as GtfsRtFeedMessage;

	//
}
