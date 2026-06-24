export const aggregationQuery = ({ endTimeScheduled, headsign, startTimeScheduled }: { endTimeScheduled: number, headsign: string, startTimeScheduled: number }) => [
	{
		$match: {
			agency_id: '2',
			headsign,
			start_time_scheduled: {
				$gte: startTimeScheduled,
				$lte: endTimeScheduled,
			},
		},
	},

	{ $limit: 1 },

	{
		$lookup: {
			as: 'hashed_shape',
			foreignField: '_id',
			from: 'hashed_shapes',
			localField: 'hashed_shape_id',
		},
	},

	{
		$lookup: {
			as: 'hashed_trip',
			from: 'hashed_trips',
			let: {
				agencyId: '$agency_id',
				tripId: '$hashed_trip_id',
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$eq: ['$_id', '$$tripId'],
						},
					},
				},

				{
					$lookup: {
						as: 'stop_docs',
						from: 'stops',
						let: {
							agencyId: '$$agencyId',
							pathStopIds: '$path.stop_id',
						},
						pipeline: [
							{
								$match: {
									$expr: {
										$gt: [
											{
												$size: {
													$filter: {
														as: 'f',
														cond: {
															$and: [
																{ $in: ['$$f.stop_id', '$$pathStopIds'] },
																{ $in: ['$$agencyId', '$$f.agency_ids'] },
															],
														},
														input: '$flags',
													},
												},
											},
											0,
										],
									},
								},
							},

							{
								$project: {
									_id: 0,
									all_codes: {
										$map: {
											as: 'f',
											in: '$$f.stop_id',
											input: {
												$filter: {
													as: 'f',
													cond: {
														$in: ['$$agencyId', '$$f.agency_ids'],
													},
													input: '$flags',
												},
											},
										},
									},
								},
							},
						],
					},
				},

				/**
				 * FIXED LOGIC:
				 * - no flattening across all stops
				 * - resolve codes per stop document
				 */
				{
					$addFields: {
						path: {
							$map: {
								as: 'p',
								in: {
									$let: {
										in: {
											$mergeObjects: [
												'$$p',
												{
													stop_codes: {
														$ifNull: ['$$matchedStop.all_codes', []],
													},
												},
											],
										},
										vars: {
											matchedStop: {
												$first: {
													$filter: {
														as: 'sd',
														cond: {
															$gt: [
																{
																	$size: {
																		$filter: {
																			as: 'c',
																			cond: {
																				$eq: ['$$c', '$$p.stop_id'],
																			},
																			input: '$$sd.all_codes',
																		},
																	},
																},
																0,
															],
														},
														input: '$stop_docs',
													},
												},
											},
										},
									},
								},
								input: '$path',
							},
						},
					},
				},

				{
					$project: {
						stop_docs: 0,
					},
				},
			],
		},
	},

	{ $unwind: '$hashed_trip' },
	{ $unwind: '$hashed_shape' },

	{
		$project: {
			hashed_shape: 1,
			hashed_trip: 1,
		},
	},
];
