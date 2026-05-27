import { type ExportType, type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { municipalities, simplifiedApexValidations, stops } from '@tmlmobilidade/interfaces';
import ExcelJS from 'exceljs';
import fs from 'node:fs';

/* * */

const TASK_ID: ExportType = 'validations-p-municipalities';

/* * */

export async function exportValidationsPMunicipalities({
	context,
	message,
}: TaskProps): Promise<void> {
	//

	message('A iniciar exportação de validações por município...');

	//
	// Prepare output directory

	if (!fs.existsSync(context.output)) {
		fs.mkdirSync(context.output, { recursive: true });
	}

	//
	// Collections

	message('A obter collections...');

	const [stopsCol, validationsCol, municipalitiesCol] =
		await Promise.all([
			stops.getCollection(),
			simplifiedApexValidations.getCollection(),
			municipalities.getCollection(),
		]);

	if (!stopsCol || !validationsCol || !municipalitiesCol) {
		throw new Error('Missing collections');
	}

	//
	// Calendar

	message('A obter calendário...');

	const calendar = await Dates.fetchCalendarData();

	const calendarMap = new Map<
		string,
		{
			day_type: string
			period: string
		}
	>();

	for (const c of calendar) {
		calendarMap.set(c.date, {
			day_type: c.day_type,
			period: c.period,
		});
	}

	//
	// Municipalities

	message('A obter municípios...');

	const municipalitiesData = await municipalitiesCol
		.find({})
		.toArray() as Array<{
		_id: string
		properties?: {
			name?: string
		}
	}>;

	const municipalityMap = new Map<string, string>();

	for (const municipality of municipalitiesData) {
		municipalityMap.set(
			municipality._id,
			municipality.properties?.name || 'unknown',
		);
	}

	message(`Municípios encontrados: ${municipalityMap.size}`);

	//
	// Stops

	message('A obter paragens...');

	const stopsData = await stopsCol
		.aggregate([
			{
				$unwind: '$flags',
			},
			{
				$match: {
					'flags.agency_ids': {
						$in: ['41', '42', '43', '44'],
					},
				},
			},
			{
				$project: {
					_id: 0,
					municipality_id: 1,

					stop_join_id: {
						$toString: {
							$ifNull: ['$flags.stop_id', '$_id'],
						},
					},
				},
			},
		])
		.toArray();

	message(`Paragens encontradas: ${stopsData.length}`);

	//
	// Stop lookup

	const stopMap = new Map<string, string>();

	for (const stop of stopsData) {
		stopMap.set(stop.stop_join_id, stop.municipality_id);
	}

	message(`Stop map construída: ${stopMap.size}`);

	//
	// Dates

	const startTimestamp = Dates
		.fromOperationalDate(context.dates.start, 'Europe/Lisbon')
		.set({
			hour: 4,
			millisecond: 0,
			minute: 0,
			second: 0,
		})
		.unix_timestamp;

	const endTimestamp = Dates
		.fromOperationalDate(context.dates.end, 'Europe/Lisbon')
		.plus({ days: 1 })
		.set({
			hour: 4,
			millisecond: 0,
			minute: 0,
			second: 0,
		})
		.unix_timestamp;

	//
	// Validations

	message('A agregar validações...');

	const validations = await validationsCol
		.aggregate(
			[
				{
					$match: {
						agency_id: {
							$in: ['41', '42', '43', '44'],
						},
						created_at: {
							$gte: startTimestamp,
							$lt: endTimestamp,
						},
						is_passenger: true,
					},
				},
				{
					$addFields: {
						operational_date: {
							$let: {
								in: {
									$dateToString: {
										date: {
											$cond: {
												else: '$$eventDate',
												if: { $lt: ['$$hour', 4] },
												then: {
													$dateSubtract: {
														amount: 1,
														startDate: '$$eventDate',
														unit: 'day',
													},
												},
											},
										},
										format: '%Y%m%d',
										timezone: 'Europe/Lisbon',
									},
								},
								vars: {
									eventDate: { $toDate: '$created_at' },
									hour: {
										$hour: {
											date: { $toDate: '$created_at' },
											timezone: 'Europe/Lisbon',
										},
									},
								},
							},
						},
					},
				},
				{
					$group: {
						_id: {
							agency_id: '$agency_id',
							date: '$operational_date',
							stop_id: '$stop_id',
						},
						validations: { $sum: 1 },
					},
				},
			],
			{ allowDiskUse: true },
		)
		.toArray();

	message(`Grupos de validações: ${validations.length}`);

	//
	// Final aggregation

	message('A construir dataset final...');

	const finalMap = new Map<string, number>();

	for (const validation of validations) {
		const municipalityId = stopMap.get(
			String(validation._id.stop_id),
		);

		if (!municipalityId) continue;

		const municipality = municipalityMap.get(municipalityId);

		if (!municipality) continue;

		const key = [
			validation._id.date,
			validation._id.agency_id,
			municipality,
		].join('|');

		finalMap.set(
			key,
			(finalMap.get(key) || 0) + validation.validations,
		);
	}

	message(`Rows finais: ${finalMap.size}`);

	//
	// Excel

	message('A gerar Excel...');

	const workbook = new ExcelJS.Workbook();

	const worksheet = workbook.addWorksheet('municipalities_validations');

	worksheet.columns = [
		{ header: 'Dia', key: 'day', width: 15 },
		{ header: 'Dia tipo', key: 'day_type', width: 15 },
		{ header: 'Periodo', key: 'period', width: 15 },
		{ header: 'Operador', key: 'operator', width: 15 },
		{ header: 'Municipio', key: 'municipality', width: 30 },
		{ header: 'Validations', key: 'validations', width: 20 },
	];

	//
	// Rows

	for (const [key, validationsCount] of finalMap.entries()) {
		const [day, operator, municipality] = key.split('|');

		const calendarInfo = calendarMap.get(day);

		worksheet.addRow({
			day,
			day_type: calendarInfo?.day_type || '',
			municipality,
			operator,
			period: calendarInfo?.period || '',
			validations: validationsCount,
		});
	}

	//
	// Style

	worksheet.getRow(1).font = { bold: true };

	worksheet.autoFilter = {
		from: 'A1',
		to: 'F1',
	};

	//
	// Save

	const outputFile = `${context.output}/${TASK_ID}-${context.dates.start}-${context.dates.end}.xlsx`;

	await workbook.xlsx.writeFile(outputFile);

	message(`Export concluído: ${outputFile}`);

	//
}
