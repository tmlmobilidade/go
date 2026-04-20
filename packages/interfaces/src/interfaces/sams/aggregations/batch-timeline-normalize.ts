/* * */

/* eslint-disable perfectionist/sort-objects -- MongoDB $let: `vars` before `in` */

/**
 * Normalizes one `timeline_summary.months[]` element for the list API: stable `key`,
 * `successful_count`, `failed_count` (no `accent` or `count`; total is s+f; chip color in the frontend).
 *
 * - If both successful and failed are present (ints, including 0) and they agree with `count`
 *   when `count` is set (`s + f === count`), uses them. Otherwise `0`/`0` with a positive `count`
 *   falls through to fill-by-count or accent (avoids wiping real totals).
 * - If only one side is present and `count` is present, fills the other from `count`.
 * - If only `count` and stored `accent` are usable (legacy docs), splits like the frontend (`normalizeTimelineCounts` fallback).
 */
export function samsBatchTimelineSummaryMonthMapIn(): Record<string, unknown> {
	return samsTimelineSummaryRowExpr({ includeKey: true });
}

/** Same rules as {@link samsBatchTimelineSummaryMonthMapIn} for `timeline_summary.undated` (no `key`). */
export function samsBatchTimelineSummaryUndatedProject(): Record<string, unknown> {
	return samsTimelineSummaryRowExpr({ includeKey: false });
}

function samsTimelineSummaryRowExpr({ includeKey }: { includeKey: boolean }): Record<string, unknown> {
	const keyExpr: Record<string, unknown> = {
		$cond: [
			{
				$and: [
					{ $ne: ['$$rawMonthItem.key', null] },
					{ $ne: [{ $toString: '$$rawMonthItem.key' }, ''] },
				],
			},
			{ $toString: '$$rawMonthItem.key' },
			{
				$cond: [
					{
						$and: [
							{ $ne: ['$$rawMonthItem.month', null] },
							{ $ne: [{ $toString: '$$rawMonthItem.month' }, ''] },
						],
					},
					{ $toString: '$$rawMonthItem.month' },
					'',
				],
			},
		],
	};

	const baseVars: Record<string, unknown> = {
		accentIn: includeKey
			? { $ifNull: ['$$rawMonthItem.accent', 'white'] }
			: { $ifNull: ['$timeline_summary.undated.accent', 'white'] },
		c: {
			$convert: {
				input: {
					$ifNull: [
						includeKey ? '$$rawMonthItem.count' : '$timeline_summary.undated.count',
						null,
					],
				},
				onError: null,
				onNull: null,
				to: 'int',
			},
		},
		f: {
			$convert: {
				input: {
					$ifNull: [
						includeKey
							? { $ifNull: ['$$rawMonthItem.failed_count', { $ifNull: ['$$rawMonthItem.failedCount', null] }] }
							: { $ifNull: ['$timeline_summary.undated.failed_count', { $ifNull: ['$timeline_summary.undated.failedCount', null] }] },
						null,
					],
				},
				onError: null,
				onNull: null,
				to: 'int',
			},
		},
		s: {
			$convert: {
				input: {
					$ifNull: [
						includeKey
							? { $ifNull: ['$$rawMonthItem.successful_count', { $ifNull: ['$$rawMonthItem.successfulCount', null] }] }
							: { $ifNull: ['$timeline_summary.undated.successful_count', { $ifNull: ['$timeline_summary.undated.successfulCount', null] }] },
						null,
					],
				},
				onError: null,
				onNull: null,
				to: 'int',
			},
		},
	};

	if (includeKey) {
		baseVars.key = keyExpr;
	}

	return {
		$let: {
			vars: baseVars,
			in: {
				$let: {
					vars: {
						hasC: { $and: [{ $ne: ['$$c', null] }, { $gte: ['$$c', 0] }] },
						hasF: { $and: [{ $ne: ['$$f', null] }, { $gte: ['$$f', 0] }] },
						hasS: { $and: [{ $ne: ['$$s', null] }, { $gte: ['$$s', 0] }] },
					},
					in: {
						$let: {
							vars: {
								explicitPair: {
									$and: [
										'$$hasS',
										'$$hasF',
										{
											$or: [
												{ $not: ['$$hasC'] },
												{ $eq: [{ $add: ['$$s', '$$f'] }, '$$c'] },
											],
										},
									],
								},
								fillFail: { $and: ['$$hasS', '$$hasC', { $not: ['$$hasF'] }] },
								fillSucc: { $and: ['$$hasF', '$$hasC', { $not: ['$$hasS'] }] },
							},
							in: {
								$let: {
									vars: {
										failedOut: {
											$cond: [
												'$$explicitPair',
												'$$f',
												{
													$cond: [
														'$$fillFail',
														{ $max: [0, { $subtract: ['$$c', '$$s'] }] },
														{
															$cond: [
																'$$fillSucc',
																'$$f',
																{
																	$cond: [
																		{
																			$and: [
																				'$$hasC',
																				{ $gt: ['$$c', 0] },
																				{ $eq: ['$$accentIn', 'red'] },
																			],
																		},
																		'$$c',
																		{
																			$cond: [
																				{
																					$and: [
																						'$$hasC',
																						{ $gt: ['$$c', 0] },
																						{ $in: ['$$accentIn', ['orange', 'white']] },
																					],
																				},
																				{ $ceil: { $divide: ['$$c', 2] } },
																				0,
																			],
																		},
																	],
																},
															],
														},
													],
												},
											],
										},
										successfulOut: {
											$cond: [
												'$$explicitPair',
												'$$s',
												{
													$cond: [
														'$$fillSucc',
														{ $max: [0, { $subtract: ['$$c', '$$f'] }] },
														{
															$cond: [
																'$$fillFail',
																'$$s',
																{
																	$cond: [
																		{
																			$and: [
																				'$$hasC',
																				{ $gt: ['$$c', 0] },
																				{ $eq: ['$$accentIn', 'green'] },
																			],
																		},
																		'$$c',
																		{
																			$cond: [
																				{
																					$and: [
																						'$$hasC',
																						{ $gt: ['$$c', 0] },
																						{ $in: ['$$accentIn', ['orange', 'white']] },
																					],
																				},
																				{ $subtract: ['$$c', { $ceil: { $divide: ['$$c', 2] } }] },
																				0,
																			],
																		},
																	],
																},
															],
														},
													],
												},
											],
										},
									},
									in: includeKey
										? {
											count: { $toDouble: { $add: ['$$successfulOut', '$$failedOut'] } },
											failed_count: { $toDouble: '$$failedOut' },
											key: '$$key',
											month: '$$key',
											successful_count: { $toDouble: '$$successfulOut' },
										}
										: {
											count: { $toDouble: { $add: ['$$successfulOut', '$$failedOut'] } },
											failed_count: { $toDouble: '$$failedOut' },
											successful_count: { $toDouble: '$$successfulOut' },
										},
								},
							},
						},
					},
				},
			},
		},
	};
}

/* eslint-enable perfectionist/sort-objects */
