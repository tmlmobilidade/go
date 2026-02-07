/* * */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import protobufjs from 'protobufjs';

/* * */

(async function init() {
	//

	//
	// Download the .proto definition file
	// from the GTFS Realtime specification

	const protoUrl = 'https://gtfs.org/documentation/realtime/gtfs-realtime.proto';
	const response = await fetch(protoUrl);
	const protoText = await response.text();

	//
	// Create a URL for the local .proto file
	// and load it using protobufjs

	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const protoPath = path.join(__dirname, 'gtfs-realtime.proto');
	fs.writeFileSync(protoPath, protoText);

	const proto = new protobufjs.Root();
	const gtfsRealtime = proto.loadSync(protoPath, { keepCase: true });

	async function fetchTTSLData() {
		//

		const response = await fetch('https://api.ttsl.pt/files/gtfs_rt_vehicles.pb');
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const FeedMessage = gtfsRealtime.root.lookupType('transit_realtime.FeedMessage');

		const message = FeedMessage.decode(buffer);

		const decodedMessage = FeedMessage.toObject(message, {
			arrays: true,
			bytes: String,
			defaults: true,
			enums: String,
			longs: String,
			objects: true,
			oneofs: true,
		});

		console.log(decodedMessage);
	}

	setInterval(fetchTTSLData, 5_000); // Fetch data every 5 seconds

	//
})();
