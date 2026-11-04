SELECT toString(greatest(
    toDate({today:String}),
    ifNull(max(YYYYMMDDToDate(operational_date)), toDate({today:String})),
    (SELECT max(range_end) FROM temp_performance.refreshes WHERE metric = 'supply_by_agency_by_day')
)) AS end_date
FROM operation.rides FINAL
WHERE agency_id IN {agency_ids:Array(String)};
