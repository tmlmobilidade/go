/* * */

import { fetchProtobuf } from '@/protobuf.js';
import { describeAlert } from '@tmlmobilidade/go-alerts-pckg-describe';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type CreateAlertDto, type ServiceAlertResponse } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* * */

const DatikServiceAlertsUrl = 'https://api.control.optibus.co/opendata/v1/gtfs-rt/alerts?uid=c-06821148';
const ProtobufPath = path.resolve(__dirname, './gtfs-realtime.proto');

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	// Fetch the data from the URL
	const serviceAlertResponse = await fetchProtobuf<ServiceAlertResponse>(DatikServiceAlertsUrl, ProtobufPath, 'transit_realtime.FeedMessage');

	for (const serviceAlert of serviceAlertResponse.entity) {
		const alert = await alerts.findByExternalId(serviceAlert.id);
		if (alert) {
			Logger.error(`Alert with external ID ${serviceAlert.id} already exists, skipping...`);
		} else {
			//
			Logger.info(`Alert with external ID ${serviceAlert.id} does not exist, creating...`);

			if (serviceAlert.alert.informed_entity.find(entity => entity.trip?.trip_id) === undefined) {
				Logger.error(`Alert with external ID ${serviceAlert.id} has no trip ID, skipping...`);
				continue;
			}

			//
			const { description, title } = describeAlert({
				cause: serviceAlert.alert.cause as CreateAlertDto['cause'],
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data: serviceAlert.alert as any,
				effect: serviceAlert.alert.effect as CreateAlertDto['effect'],
				reference_type: 'rides',
				references: serviceAlert.alert.informed_entity.map(entity => ({
					child_ids: [],
					parent_id: entity.trip?.trip_id ?? '',
				})),
				type: 'rides',
			});

			const createAlertDto: CreateAlertDto = {
				active_period_end_date: null,
				active_period_start_date: undefined,
				agency_id: '43',
				cause: serviceAlert.alert.cause as CreateAlertDto['cause'],
				coordinates: null,
				description: description.pt,
				effect: serviceAlert.alert.effect as CreateAlertDto['effect'],
				external_id: serviceAlert.id,
				file_id: null,
				info_url: null,
				is_locked: false,
				municipality_ids: [],
				publish_end_date: null,
				publish_start_date: undefined,
				publish_status: 'published',
				reference_type: 'rides',
				references: serviceAlert.alert.informed_entity.map(entity => ({
					child_ids: [],
					parent_id: entity.trip?.trip_id ?? '',
				})),
				title: title.pt,
			};

			const alertRealtime = await alerts.insertOne(createAlertDto);
			Logger.info(`Alert created | Internal ID: ${alertRealtime._id}, External ID: ${alertRealtime.external_id}`);
		}
	}

	Logger.terminate(`Terminated in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1m' });
