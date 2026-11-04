ALTER TABLE performance.demand_by_agency_by_operational_date
REPLACE PARTITION {partition:UInt32} FROM temp_performance.{stage:Identifier};
