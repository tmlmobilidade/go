/* * */

/* eslint-disable perfectionist/sort-objects -- MongoDB aggregation readability */

const LISBON_TZ = 'Europe/Lisbon';

/** One row per analysis × month (or one undated row). Success = both transaction ids non-null. */
export function samsAnalysisTimelineRowsExpr(): Record<string, unknown> {
	return {
		$reduce: {
			initialValue: [],
			in: {
				$let: {
					vars: {
						acc: '$$value',
						success: {
							$and: [
								{ $ne: ['$$this.first_transaction_id', null] },
								{ $ne: ['$$this.last_transaction_id', null] },
							],
						},
					},
					in: {
						// One binding per $let: MongoDB may evaluate same `vars` object in an order
						// where `d0`/`d1` run before `startMs`/`endMs`, causing "undefined variable".
						$let: {
							vars: {
								startMs: { $ifNull: ['$$this.start_time', '$$this.end_time'] },
							},
							in: {
								$let: {
									vars: {
										endMs: { $ifNull: ['$$this.end_time', '$$this.start_time'] },
									},
									in: {
										$let: {
											vars: {
												failN: { $cond: ['$$success', 0, 1] },
												succN: { $cond: ['$$success', 1, 0] },
											},
											in: {
												$cond: [
													{
														$or: [
															{ $eq: ['$$startMs', null] },
															{ $eq: ['$$endMs', null] },
														],
													},
													{
														$concatArrays: [
															'$$acc',
															[{
																failed: '$$failN',
																monthKey: null,
																successful: '$$succN',
															}],
														],
													},
													{
														$let: {
															vars: {
																month0: {
																	$dateTrunc: {
																		date: {
																			$toDate: {
																				$min: ['$$startMs', '$$endMs'],
																			},
																		},
																		unit: 'month',
																		timezone: LISBON_TZ,
																	},
																},
																monthLast: {
																	$dateTrunc: {
																		date: {
																			$toDate: {
																				$max: ['$$startMs', '$$endMs'],
																			},
																		},
																		unit: 'month',
																		timezone: LISBON_TZ,
																	},
																},
															},
															in: {
																$concatArrays: [
																	'$$acc',
																	{
																		$map: {
																			as: 'idx',
																			in: {
																				$let: {
																					vars: {
																						monthStart: {
																							$dateAdd: {
																								amount: '$$idx',
																								startDate: '$$month0',
																								timezone: LISBON_TZ,
																								unit: 'month',
																							},
																						},
																					},
																					in: {
																						failed: '$$failN',
																						monthKey: {
																							$dateToString: {
																								date: '$$monthStart',
																								format: '%Y-%m',
																								timezone: LISBON_TZ,
																							},
																						},
																						successful: '$$succN',
																					},
																				},
																			},
																			input: {
																				$range: [
																					0,
																					{
																						$max: [
																							1,
																							{
																								$add: [
																									{
																										$dateDiff: {
																											endDate: '$$monthLast',
																											startDate: '$$month0',
																											timezone: LISBON_TZ,
																											unit: 'month',
																										},
																									},
																									1,
																								],
																							},
																						],
																					},
																				],
																			},
																		},
																	},
																],
															},
														},
													},
												],
											},
										},
									},
								},
							},
						},
					},
				},
			},
			input: { $ifNull: ['$analysis', []] },
		},
	};
}

/** Build `timeline_summary` from grouped `buckets: { m, s, f }[]`. */
export function samsTimelineSummaryFromBucketsExpr(): Record<string, unknown> {
	return {
		months: {
			$map: {
				as: 'x',
				in: {
					failed_count: '$$x.f',
					month: '$$x.m',
					successful_count: '$$x.s',
				},
				input: {
					$sortArray: {
						input: {
							$filter: {
								as: 'b',
								cond: { $ne: ['$$b.m', null] },
								input: '$buckets',
							},
						},
						sortBy: { m: 1 },
					},
				},
			},
		},
	};
}

export function samsListViewCarryFieldsExpr(): Record<string, unknown> {
	return {
		_id: '$_id',
		agency_id: '$agency_id',
		created_at: '$created_at',
		latest_apex_version: '$latest_apex_version',
		remarks: '$remarks',
		seen_first_at: { $ifNull: ['$seen_first_at', null] },
		seen_last_at: { $ifNull: ['$seen_last_at', null] },
		system_status: '$system_status',
		transactions_expected: '$transactions_expected',
		transactions_found: '$transactions_found',
		transactions_missing: '$transactions_missing',
	};
}

/** Full SAM snapshot for detail merge (excludes temp fields added later in the same stage). */
export function samsDetailSnapExpr(): Record<string, unknown> {
	return {
		_id: '$_id',
		agency_id: '$agency_id',
		analysis: '$analysis',
		created_at: '$created_at',
		latest_apex_version: '$latest_apex_version',
		remarks: '$remarks',
		seen_first_at: '$seen_first_at',
		seen_last_at: '$seen_last_at',
		system_status: '$system_status',
		timeline_summary: '$timeline_summary',
		transactions_expected: '$transactions_expected',
		transactions_found: '$transactions_found',
		transactions_missing: '$transactions_missing',
		updated_at: '$updated_at',
	};
}

/* eslint-enable perfectionist/sort-objects */
