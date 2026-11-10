"""Execute the production SQL against an isolated embedded ClickHouse.

python -m pip install chdb==4.4.0
python -m unittest discover -s modules/hub/apps/eta/tests -v
No network, production credentials or running ClickHouse server are needed.
"""
import json
from pathlib import Path
import re
import tempfile
import unittest

from chdb import session

SQL = Path(__file__).resolve().parents[3] / 'sql'


def statements(path):
    text = re.sub(r'--[^\n]*', '', (SQL / path).read_text())
    return [s.strip() for s in text.split(';') if s.strip()]


def view_select(path):
    for statement in statements(path):
        if 'MATERIALIZED VIEW' in statement:
            return re.split(r'\bAS\s+(?=WITH\b|SELECT\b)', statement, maxsplit=1)[1]
    raise ValueError(path)


class EtaSQLTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='eta-sql-')
        cls.db = session.Session(cls.tmp.name)
        cls.db.query('CREATE DATABASE operation ENGINE=Atomic')
        cls.db.query('CREATE DATABASE infrastructure ENGINE=Atomic')
        cls.db.query('''CREATE TABLE operation.rides (
            _id String, trip_id String, agency_id String, plan_id String,
            route_id String, hashed_trip_id String, hashed_shape_id String,
            operational_date UInt32, start_time_scheduled Int64,
            end_time_scheduled Int64, end_time_observed Nullable(Int64),
            vehicle_ids Array(String), updated_at Int64
        ) ENGINE=ReplacingMergeTree(updated_at) ORDER BY _id''')
        cls.db.query('''CREATE TABLE operation.hashed_trips (
            _id String, stop_sequence UInt16, stop_id String,
            stop_name String, stop_lat Float64, stop_lon Float64,
            arrival_time String, departure_time String
        ) ENGINE=ReplacingMergeTree ORDER BY (_id, stop_sequence)''')
        cls.db.query('''CREATE TABLE operation.simplified_vehicle_events (
            _id String, agency_id String, trip_id String, vehicle_id String,
            latitude Float64, longitude Float64, speed Nullable(Int64),
            bearing Nullable(Int64), created_at Int64, received_at Int64,
            operational_date UInt32
        ) ENGINE=ReplacingMergeTree ORDER BY _id''')
        cls.db.query('''CREATE TABLE infrastructure.simplified_stops (
            _id String, latitude Float64, longitude Float64,
            legacy_ids Array(String), is_deleted Bool
        ) ENGINE=ReplacingMergeTree ORDER BY _id''')
        for path in cls.bootstrap_paths():
            for stmt in statements(path):
                if 'MATERIALIZED VIEW' not in stmt:
                    cls.db.query(stmt)

    @staticmethod
    def bootstrap_paths():
        source = (Path(__file__).resolve().parents[1] / 'src/tasks/bootstrap.ts').read_text()
        return re.findall(r"'(eta/bootstrap/[^']+\.sql)'", source)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.tmp.cleanup()

    def setUp(self):
        for row in self.rows("SELECT database, name FROM system.tables WHERE database IN ('eta','operation','infrastructure') AND engine LIKE '%MergeTree%' "):
            self.db.query(f"TRUNCATE {row['database']}.{row['name']}")
        self.db.query(next(s for s in statements('eta/bootstrap/runtime-policy.sql') if s.startswith('INSERT')))

    def rows(self, sql):
        result = str(self.db.query(sql, 'JSONEachRow'))
        return [json.loads(line) for line in result.splitlines() if line]

    def insert_select(self, table, query):
        columns = ','.join('`' + row['name'] + '`' for row in self.rows('DESCRIBE TABLE (' + query + ')'))
        self.db.query('INSERT INTO ' + table + ' (' + columns + ') ' + query)

    def test_prediction_query_executes_on_empty_database(self):
        self.assertEqual(self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')), [])

    def test_snapshot_retains_multiple_generations(self):
        self.db.query('TRUNCATE eta.prediction_snapshots')
        self.db.query('''INSERT INTO eta.prediction_snapshots
            (generated_at, ride_id, vehicle_id, stop_sequence, prediction_version)
            SELECT toUnixTimestamp64Milli(now64(3)) - toInt64(number) * 1000, 'r','v',toUInt16(1),'v1' FROM numbers(2)''')
        self.assertEqual(self.rows('SELECT count() AS n FROM eta.prediction_snapshots')[0]['n'], 2)

    def test_snapshot_select_compiles(self):
        self.rows(view_select('eta/bootstrap/prediction-snapshots.sql'))

    def seed_live_trip(self):
        now = self.rows('SELECT toUnixTimestamp64Milli(now64(3)) AS t')[0]['t']
        op = self.rows("SELECT toYYYYMMDD(toDate(now('Europe/Lisbon') - INTERVAL 4 HOUR)) AS d")[0]['d']
        self.db.query(f"""INSERT INTO eta.curr_rides
            (_id,trip_id,agency_id,plan_id,route_id,hashed_trip_id,hashed_shape_id,
             operational_date,start_time_scheduled,end_time_scheduled)
            VALUES ('ride','trip','a','plan','route','ht','hs',{op},{now-600000},{now+600000})""")
        self.db.query("""INSERT INTO eta.hist_shape_nodes
            SELECT 'hs', toUInt32(number), 38.7 + number * 0.000225, -9.1, geohashEncode(-9.1, 38.7 + number * 0.000225, 6) FROM numbers(11)""")
        self.db.query("""INSERT INTO eta.curr_waypoints_snapped
            (hashed_trip_id,hashed_shape_id,stop_sequence,stop_id,node_index,arrival_time)
            VALUES ('ht','hs',1,'s1',5,'12:00:00'),('ht','hs',2,'s2',10,'12:05:00')""")
        self.db.query(f"""INSERT INTO eta.curr_vehicle_events
            (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,created_at,received_at)
            VALUES ('e0','ride','a','trip','v','hs',0,1.,{now-31000},{now-30500}),
                   ('e','ride','a','trip','v','hs',0,1.,{now-1000},{now-500})""")
        self.insert_select('eta.cached_shape_node_geometry', view_select('eta/bootstrap/shared-road-segments.sql'))
        return now

    def test_missing_history_never_yields_zero_for_positive_distance(self):
        self.seed_live_trip()
        rows = self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.assertEqual(len(rows), 2)
        by_stop = sorted(rows, key=lambda r: r['stop_sequence'])
        self.assertGreater(by_stop[0]['eta_seconds'], 0)
        self.assertGreater(by_stop[1]['eta_seconds'], by_stop[0]['eta_seconds'])
        self.assertEqual(by_stop[1]['history_coverage'], 0)

    def test_sparse_history_preserves_unobserved_nodes(self):
        self.seed_live_trip()
        self.db.query("""INSERT INTO eta.pred_node_etas
            (hashed_shape_id,node_index,period_of_day,weekday,day_type,predicted_travel_time_seconds)
            SELECT 'hs',toUInt32(5), 'Mid','Tuesday','Weekday',10.""")
        rows = self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.assertTrue(all(r['eta_seconds'] > 0 for r in rows))
        self.assertTrue(all(0 <= r['history_coverage'] <= 1 for r in rows))

    def test_bootstrap_preserves_data_on_rerun(self):
        self.db.query("INSERT INTO eta.hist_shape_nodes (hashed_shape_id,node_index) VALUES ('keep',1)")
        for stmt in statements('eta/bootstrap/create-tables.sql'):
            self.db.query(stmt)
        self.assertEqual(self.rows("SELECT count() AS n FROM eta.hist_shape_nodes WHERE hashed_shape_id='keep'")[0]['n'], 1)

    def test_arrival_query_executes(self):
        self.rows(view_select('eta/bootstrap/arrival-labels.sql'))

    def test_metrics_query_executes(self):
        query = (SQL / 'eta/observability/prediction-errors.sql').read_text()
        self.rows(query.replace('{since:Int64}', '0').replace('{until:Int64}', '9999999999999'))

    def test_arrival_crossings_are_interpolated_and_replay_safe(self):
        for table in ['curr_rides', 'curr_vehicle_events', 'curr_waypoints_snapped', 'actual_arrivals']:
            self.db.query('TRUNCATE eta.' + table)
        now = self.rows('SELECT toUnixTimestamp64Milli(now64(3)) AS t')[0]['t']
        op = self.rows("SELECT toYYYYMMDD(toDate(now('Europe/Lisbon') - INTERVAL 4 HOUR)) AS d")[0]['d']
        self.db.query(f"""INSERT INTO eta.curr_rides
            (_id,trip_id,agency_id,hashed_trip_id,hashed_shape_id,operational_date,
             start_time_scheduled,end_time_scheduled)
            VALUES ('ride','trip','a','ht','hs',{op},{now-600000},{now+600000})""")
        self.db.query("""INSERT INTO eta.curr_waypoints_snapped
            (hashed_trip_id,hashed_shape_id,stop_sequence,stop_id,node_index)
            VALUES ('ht','hs',1,'stop',5),('ht','hs',2,'stop',7)""")
        self.db.query(f"""INSERT INTO eta.curr_vehicle_events
            (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,created_at,received_at)
            VALUES ('e1','ride','a','trip','v','hs',4,1.,{now-300000},{now-299000}),
                   ('e2','ride','a','trip','v','hs',6,1.,{now-270000},{now-269000})""")
        query = view_select('eta/bootstrap/arrival-labels.sql')
        rows = self.rows(query)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['arrival_at'], now - 285000)
        self.db.query('INSERT INTO eta.actual_arrivals ' + query)
        self.assertEqual(self.rows(query), [])

    def test_stale_and_future_gps_are_suppressed(self):
        now = self.seed_live_trip()
        for offset in [-300000, 60000]:
            self.db.query('TRUNCATE eta.curr_vehicle_events')
            self.db.query(f"""INSERT INTO eta.curr_vehicle_events
                (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,created_at,received_at)
                VALUES ('e','ride','a','trip','v','hs',0,1.,{now+offset},{now+offset})""")
            self.assertEqual(self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')), [])

    def test_aging_gps_has_decaying_confidence_and_bounded_extrapolation(self):
        now = self.seed_live_trip()
        self.db.query('TRUNCATE eta.curr_vehicle_events')
        self.db.query(f"""INSERT INTO eta.curr_vehicle_events
            (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,created_at,received_at)
            VALUES ('e0','ride','a','trip','v','hs',0,1.,{now-120000},{now-119000}),
                   ('e','ride','a','trip','v','hs',0,1.,{now-90000},{now-89000})""")
        rows = self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.assertTrue(all(r['freshness_tier'] == 'aging' for r in rows))
        self.assertTrue(all(0 < r['prediction_confidence'] < 0.4 for r in rows))
        self.assertTrue(all(r['eta_at'] > now for r in rows))

    def test_all_public_queries_use_lifecycle_filter(self):
        self.seed_live_trip()
        query = view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')
        self.insert_select('eta.pred_trip_stop_etas_v2', query)
        self.assertGreater(len(self.rows('SELECT * FROM eta.publishable_trip_stop_etas')), 0)
        for path in (SQL / 'publish-eta').glob('*.sql'):
            self.rows(path.read_text().replace('{agency_id:String}', "'a'"))
        self.db.query('ALTER TABLE eta.curr_rides UPDATE end_time_observed = 1 WHERE _id = \'ride\' SETTINGS mutations_sync=1')
        self.assertEqual(self.rows('SELECT * FROM eta.publishable_trip_stop_etas'), [])
        for path in (SQL / 'publish-eta').glob('*.sql'):
            self.assertEqual(self.rows(path.read_text().replace('{agency_id:String}', "'a'")), [])

    def test_expired_generation_is_not_publishable(self):
        now = self.seed_live_trip()
        self.insert_select('eta.pred_trip_stop_etas_v2', view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.db.query('TRUNCATE eta.pred_trip_stop_etas_v2')
        stale = view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql').replace('now_ms AS refreshed_at', '(now_ms - 120000) AS refreshed_at')
        self.insert_select('eta.pred_trip_stop_etas_v2', stale)
        self.assertEqual(self.rows('SELECT * FROM eta.publishable_trip_stop_etas'), [])

    def test_historical_prediction_uses_support_and_exposes_dispersion(self):
        self.seed_live_trip()
        self.db.query("""INSERT INTO eta.hist_node_travel_times_aggregation
            (hashed_shape_id,node_index,operational_date,period_of_day,weekday,day_type,
             median_travel_time_seconds,sample_count,p10_travel_time_seconds,p90_travel_time_seconds)
            SELECT 'hs',toUInt32(5),toYYYYMMDD(toDate(now('Europe/Lisbon') - INTERVAL 4 HOUR) - number - 1),
                'Mid','Tuesday','Weekday',if(number=0,100.,10.),if(number=0,1,100),5.,150.
            FROM numbers(2)""")
        rows = self.rows(view_select('eta/bootstrap/mv-predict-node-etas.sql'))
        measured = [r for r in rows if r['node_index'] == 5 and r['period_of_day'] == 'Mid']
        self.assertTrue(measured)
        self.assertTrue(all(0 < r['predicted_travel_time_seconds'] < 30 for r in measured))
        self.assertTrue(all(r['effective_sample_count'] > 0 for r in measured))
        self.assertTrue(all(r['p90_seconds'] >= r['p10_seconds'] for r in measured))

    def test_historical_aggregation_writes_actual_sample_counts(self):
        now = self.seed_live_trip()
        self.db.query(f"""INSERT INTO eta.hist_node_travel_times VALUES
            ('r1','hs',1,{now-86400000},5.),('r2','hs',1,{now-86400000},15.)""")
        day = self.rows("SELECT toYYYYMMDD(toDate(now('Europe/Lisbon') - INTERVAL 4 HOUR) - 1) AS d")[0]['d']
        query = (SQL / 'eta/loader/aggregate-hist-node-travel-times.sql').read_text()
        query = query.replace('$scan_start', str(now-2*86400000)).replace('$scan_end', str(now)).replace('$chunk_date', str(day))
        self.db.query(query)
        row = self.rows('SELECT * FROM eta.hist_node_travel_times_aggregation')[0]
        self.assertEqual(row['sample_count'], 2)
        self.assertGreater(row['stddev_travel_time_seconds'], 0)

    def test_forward_outlier_recovers_without_running_max(self):
        now = self.seed_live_trip()
        self.db.query(f"""INSERT INTO eta.curr_vehicle_events
            (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,created_at,received_at)
            VALUES ('jump','ride','a','trip','v','hs',10000,1.,{now+100},{now+100}),
                   ('recover','ride','a','trip','v','hs',1,1.,{now+1100},{now+1100})""")
        rows = self.rows('SELECT * FROM eta.valid_vehicle_events ORDER BY created_at')
        self.assertNotIn(10000, [r['node_index'] for r in rows])
        self.assertEqual(rows[-1]['node_index'], 1)
        self.assertLess(rows[-1]['position_confidence'], 1.)

    def test_live_snapper_rejects_off_shape_and_opposite_heading(self):
        now = self.seed_live_trip()
        op = self.rows('SELECT operational_date FROM eta.curr_rides LIMIT 1')[0]['operational_date']
        self.db.query(f"""INSERT INTO operation.simplified_vehicle_events
            (_id,agency_id,trip_id,vehicle_id,latitude,longitude,speed,bearing,created_at,received_at,operational_date)
            VALUES ('good','a','trip','v',38.70045,-9.1,20,0,{now},{now},{op}),
                   ('wrong','a','trip','v',38.70045,-9.1,20,180,{now},{now},{op}),
                   ('far','a','trip','v',38.70045,-9.101,20,0,{now},{now},{op})""")
        rows = self.rows(view_select('eta/bootstrap/mv-sync-curr-vehicle-events.sql'))
        self.assertEqual([r['_id'] for r in rows], ['good'])
        self.assertLess(rows[0]['match_distance_m'], 1.)

    def test_historical_snapper_builds_plausible_traversals(self):
        now = self.seed_live_trip()
        self.db.query(f"""INSERT INTO eta.hist_vehicle_events
            (_id,ride_id,hashed_shape_id,vehicle_id,latitude,longitude,created_at,received_at)
            VALUES ('h1','ride','hs','v',38.7,-9.1,{now-60000},{now-60000}),
                   ('h2','ride','hs','v',38.7009,-9.1,{now-30000},{now-30000})""")
        query = (SQL / 'eta/loader/build-hist-node-travel-times.sql').read_text()
        self.db.query(query.replace('$chunk_start', str(now-120000)).replace('$chunk_end', str(now)))
        self.assertEqual(self.rows('SELECT count() AS n FROM eta.hist_node_travel_times')[0]['n'], 4)

    def test_directional_segments_share_only_reviewed_same_layer_roads(self):
        self.seed_live_trip()
        self.db.query("""INSERT INTO eta.cached_shape_node_geometry
            SELECT 'hs2',node_index,latitude,longitude,geohash,heading_degrees
            FROM eta.cached_shape_node_geometry WHERE hashed_shape_id='hs'""")
        self.assertEqual(self.rows('SELECT * FROM eta.shape_node_road_segments'), [])
        self.db.query("""INSERT INTO eta.road_segment_assignments VALUES
            ('hs',1,'road-100m','ground','road-v1',1,'review',1),
            ('hs2',1,'road-100m','ground','road-v1',1,'review',1),
            ('hs2',2,'road-100m','bridge','road-v1',1,'review',1)""")
        rows = self.rows('SELECT * FROM eta.shape_node_road_segments ORDER BY node_index,hashed_shape_id')
        self.assertEqual(rows[0]['segment_id'], rows[1]['segment_id'])
        self.assertNotEqual(rows[0]['segment_id'], rows[2]['segment_id'])
        self.db.query("INSERT INTO eta.cached_shape_node_geometry VALUES ('reverse',1,38.7,-9.1,'',180.)")
        self.db.query("INSERT INTO eta.road_segment_assignments VALUES ('reverse',1,'road-100m','ground','road-v1',1,'review',1)")
        opposite = self.rows("SELECT segment_id FROM eta.shape_node_road_segments WHERE hashed_shape_id='reverse'")[0]['segment_id']
        self.assertNotEqual(opposite, rows[0]['segment_id'])

    def test_traffic_measurement_query_executes(self):
        self.rows(view_select('eta/bootstrap/live-traffic.sql'))

    def test_congestion_requires_independent_vehicles_and_expires(self):
        now = self.seed_live_trip()
        self.db.query(f"INSERT INTO eta.traffic_vehicle_observations VALUES ('segment','v1',2.,100,{now},1.,{now})")
        statements_ = statements('eta/bootstrap/live-traffic.sql')
        factor_query = next(re.split(r'\bAS\s+(?=WITH\b|SELECT\b)', s, maxsplit=1)[1] for s in statements_ if 'MATERIALIZED VIEW eta.mv_live_traffic_factors' in s)
        self.insert_select('eta.live_traffic_factors', factor_query)
        self.assertEqual(self.rows('SELECT factor FROM eta.current_traffic_factors')[0]['factor'], 1.)
        self.db.query(f"INSERT INTO eta.traffic_vehicle_observations VALUES ('segment','v2',2.,1,{now},1.,{now})")
        self.db.query('TRUNCATE eta.live_traffic_factors')
        self.insert_select('eta.live_traffic_factors', factor_query)
        self.assertGreater(self.rows('SELECT factor FROM eta.current_traffic_factors')[0]['factor'], 1.)
        self.db.query('TRUNCATE eta.live_traffic_factors')
        self.db.query(f"INSERT INTO eta.live_traffic_factors VALUES ('segment',3.,2,1.,{now-600000},{now-120000})")
        self.assertEqual(self.rows('SELECT factor FROM eta.current_traffic_factors')[0]['factor'], 1.)

    def test_spatial_traffic_changes_only_the_affected_future_segment(self):
        now = self.seed_live_trip()
        self.db.query("""INSERT INTO eta.road_segment_assignments
            SELECT 'hs',toUInt32(number+6),'congested-road','ground','road-v1',1,'review',1 FROM numbers(5)""")
        segment = self.rows('SELECT segment_id FROM eta.shape_node_road_segments LIMIT 1')[0]['segment_id']
        self.db.query(f"INSERT INTO eta.live_traffic_factors VALUES ('{segment}',2.,3,0.8,{now},{now})")
        query = view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')
        rows = sorted(self.rows(query), key=lambda r:r['stop_sequence'])
        self.assertEqual(rows[0]['traffic_eta_at'], rows[0]['baseline_eta_at'])
        self.assertGreater(rows[1]['traffic_eta_at'], rows[1]['baseline_eta_at'])
        self.assertTrue(all(r['eta_at'] == r['baseline_eta_at'] for r in rows))
        self.db.query(f"INSERT INTO eta.runtime_policy VALUES ('enable_spatial_traffic',1.,{now+1000})")
        rows = sorted(self.rows(query), key=lambda r:r['stop_sequence'])
        self.assertEqual(rows[1]['eta_at'], rows[1]['traffic_eta_at'])
        self.assertGreaterEqual(rows[1]['eta_at'], rows[0]['eta_at'])

    def test_bias_recomputation_query_executes(self):
        self.rows(view_select('eta/bootstrap/bias-calibration.sql'))

    def test_positive_bias_is_subtracted_and_correction_is_bounded(self):
        now = self.seed_live_trip()
        period = self.rows("SELECT intDiv(toHour(now('Europe/Lisbon')),2) AS p")[0]['p']
        self.db.query(f"INSERT INTO eta.bias_calibration VALUES ('baseline','route','a','route',{period},2,120.,10,10.,{now-1000},{now})")
        rows = self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.assertTrue(all(r['calibrated_eta_at'] < r['baseline_eta_at'] for r in rows))
        self.assertTrue(all(r['baseline_eta_at'] - r['calibrated_eta_at'] <= r['eta_seconds'] * 250 + 1000 for r in rows))
        self.assertTrue(all(r['eta_at'] == r['baseline_eta_at'] for r in rows))

    def test_calibration_replay_does_not_double_independent_support(self):
        now = self.rows('SELECT toUnixTimestamp64Milli(now64(3)) AS t')[0]['t']
        self.db.query(f"""INSERT INTO eta.prediction_snapshots
            (generated_at,captured_at,ride_id,vehicle_id,agency_id,route_id,stop_sequence,
             baseline_eta_at,traffic_eta_at,prediction_version)
            SELECT {now-300000},{now-299000},concat('r',toString(number)),'v','a','route',1,
                {now-10000},{now-10000},'baseline' FROM numbers(10)""")
        self.db.query(f"""INSERT INTO eta.actual_arrivals
            SELECT concat('r',toString(number)),'v',toUInt16(1),'s',toNullable(toInt64({now-100000})),
                CAST(NULL,'Nullable(Int64)'),toInt64({now-50000}),'door',1.,'verified',toUInt16(1)
            FROM numbers(10)""")
        query = view_select('eta/bootstrap/bias-calibration.sql')
        first = sorted(self.rows(query), key=lambda r:(r['source'],r['scope']))
        self.db.query('INSERT INTO eta.prediction_snapshots SELECT * FROM eta.prediction_snapshots')
        second = sorted(self.rows(query), key=lambda r:(r['source'],r['scope']))
        self.assertTrue(first)
        self.assertEqual([r['independent_rides'] for r in first], [r['independent_rides'] for r in second])
        self.assertTrue(all(r['bias_seconds'] > 0 for r in second))

    def test_dwell_label_query_executes(self):
        self.rows(view_select('eta/bootstrap/stop-dwell.sql'))

    def test_dwell_is_added_only_before_intermediate_stops(self):
        now = self.seed_live_trip()
        self.db.query(f"""INSERT INTO eta.stop_dwell_model
            SELECT 'ht',toUInt16(1),arrayJoin(['Peak AM','Mid','Peak PM','Off Peak']),30.,60.,10,toInt64({now})""")
        rows = sorted(self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')), key=lambda r:r['stop_sequence'])
        self.assertEqual(rows[0]['future_dwell_seconds'], 0)
        self.assertGreater(rows[1]['future_dwell_seconds'], 0)
        self.assertEqual(rows[0]['dwell_eta_at'], rows[0]['eta_at'])
        self.assertGreater(rows[1]['dwell_eta_at'], rows[1]['eta_at'])

    def test_verified_dwell_labels_are_replay_safe(self):
        now = self.seed_live_trip()
        self.db.query(f"""INSERT INTO eta.actual_arrivals VALUES
            ('ride','v',1,'s1',{now-210000},{now-180000},{now-120000},'door',1.,'verified',1)""")
        query = view_select('eta/bootstrap/stop-dwell.sql')
        rows = self.rows(query)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['dwell_seconds'], 30.)
        self.assertEqual(rows[0]['source'], 'verified_door')
        self.insert_select('eta.stop_dwell_labels', query)
        self.assertEqual(self.rows(query), [])

    def test_ml_export_uses_frozen_features_and_strict_labels(self):
        now = self.seed_live_trip()
        self.insert_select('eta.pred_trip_stop_etas_v2', view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        self.insert_select('eta.prediction_snapshots', view_select('eta/bootstrap/prediction-snapshots.sql'))
        query = (SQL / 'eta/observability/ml-feature-rows.sql').read_text().replace('{since:Int64}',str(now-1000)).replace('{until:Int64}',str(now+60000)).replace('{as_of:Int64}',str(now+60000))
        rows = self.rows(query)
        self.assertEqual(len(rows),2)
        self.assertTrue(all(r['target_residual_seconds'] is None for r in rows))
        self.assertTrue(all(r['feature_schema']=='eta-features-v1' for r in rows))
        self.assertTrue(all(r['remaining_stops'] > 0 for r in rows))

    def test_ml_quality_and_active_feature_queries_execute(self):
        self.rows(view_select('eta/bootstrap/ml-quality-gates.sql'))
        self.rows((SQL/'eta/ml/select-active-features.sql').read_text())

    def test_ml_canary_requires_exact_generation_health_and_quality(self):
        now = self.seed_live_trip()
        self.insert_select('eta.pred_trip_stop_etas_v2', view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql'))
        baseline = sorted(self.rows('SELECT * FROM eta.publishable_trip_stop_etas'), key=lambda r:r['stop_sequence'])
        self.db.query(f"INSERT INTO eta.ml_deployment VALUES ('active','model',1,100.,{now})")
        self.db.query(f"INSERT INTO eta.model_health VALUES ('model',{now},{now},'ok','shadow',2,10.,0.,0.,1)")
        self.db.query(f"""INSERT INTO eta.ml_quality_gates SELECT 'model','a','route',toUInt8(number),100,30,1.,30.,10.,60.,20.,1,toInt64({now}) FROM numbers(3) WHERE number IN (0,2)""")
        for row in baseline:
            self.db.query(f"""INSERT INTO eta.model_predictions VALUES
                ({row['refreshed_at']},{now},'ride','v',{row['stop_sequence']},'a','route',
                 {row['baseline_eta_at']},{row['eta_at']},{row['eta_at']+10000},'model','eta-features-v1','ok',0.)""")
        promoted = sorted(self.rows('SELECT * FROM eta.publishable_trip_stop_etas'), key=lambda r:r['stop_sequence'])
        self.assertTrue(all(r['prediction_version']=='ml:model' for r in promoted))
        self.assertTrue(all(p['eta_at']==b['eta_at']+10000 for p,b in zip(promoted,baseline)))
        self.db.query(f"INSERT INTO eta.model_health VALUES ('model',{now+1000},{now},'error','shadow',2,10.,1.,0.,1)")
        fallback = sorted(self.rows('SELECT * FROM eta.publishable_trip_stop_etas'), key=lambda r:r['stop_sequence'])
        self.assertEqual([r['eta_at'] for r in fallback], [r['eta_at'] for r in baseline])

    def test_materialized_view_definitions_compile_in_bootstrap_order(self):
        created = []
        try:
            for path in self.bootstrap_paths():
                for statement in statements(path):
                    if 'MATERIALIZED VIEW' not in statement:
                        continue
                    name = re.search(r'MATERIALIZED VIEW (\w+\.\w+)',statement)[1]
                    self.db.query(statement)
                    created.append(name)
                    self.db.query('SYSTEM STOP VIEW '+name)
        finally:
            for name in reversed(created):
                self.db.query('DROP VIEW IF EXISTS '+name)

    def test_ride_identity_survives_the_four_am_service_day_boundary(self):
        now = self.seed_live_trip()
        boundary = self.rows("SELECT toUnixTimestamp64Milli(toDateTime64(concat(formatDateTime(now('Europe/Lisbon'),'%F'),' 04:01:00'),3,'Europe/Lisbon')) AS t")[0]['t']
        previous_date = self.rows("SELECT toYYYYMMDD(toDate(now('Europe/Lisbon'))-1) AS d")[0]['d']
        current_date = self.rows("SELECT toYYYYMMDD(toDate(now('Europe/Lisbon'))) AS d")[0]['d']
        self.db.query(f"ALTER TABLE eta.curr_rides UPDATE start_time_scheduled={boundary-360000}, end_time_scheduled={boundary+1200000}, operational_date={previous_date} WHERE _id='ride' SETTINGS mutations_sync=1")
        self.db.query(f"""INSERT INTO operation.simplified_vehicle_events
            (_id,agency_id,trip_id,vehicle_id,latitude,longitude,speed,bearing,created_at,received_at,operational_date)
            VALUES ('boundary','a','trip','v',38.70045,-9.1,20,0,{boundary},{now},{current_date})""")
        rows = self.rows(view_select('eta/bootstrap/mv-sync-curr-vehicle-events.sql'))
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]['ride_id'],'ride')

    def test_coverage_denominator_includes_suppressed_vehicles(self):
        self.seed_live_trip()
        self.db.query('TRUNCATE eta.curr_vehicle_events')
        rows=self.rows((SQL/'eta/observability/prediction-coverage.sql').read_text())
        self.assertEqual(rows[0]['scheduled_active_stop_pairs'],2)
        self.assertEqual(rows[0]['publication_coverage'],0.)
        self.rows((SQL/'eta/observability/position-health.sql').read_text())

    def test_traffic_separates_vehicle_ids_reused_by_different_agencies(self):
        now=self.seed_live_trip()
        self.db.query("INSERT INTO eta.curr_rides SELECT * REPLACE ('ride-b' AS _id,'b' AS agency_id) FROM eta.curr_rides WHERE _id='ride'")
        self.db.query("INSERT INTO eta.road_segment_assignments SELECT 'hs',toUInt32(number+1),'road','ground','road-v1',1,'review',1 FROM numbers(3)")
        self.db.query("""INSERT INTO eta.pred_node_etas
            (hashed_shape_id,node_index,period_of_day,weekday,day_type,predicted_travel_time_seconds,effective_sample_count)
            SELECT 'hs',toUInt32(2),period,weekday,if(weekday IN ('Saturday','Sunday'),'Weekend','Weekday'),10.,20.
            FROM (SELECT arrayJoin(['Peak AM','Mid','Peak PM','Off Peak']) AS period,
                arrayJoin(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']) AS weekday)""")
        self.db.query('TRUNCATE eta.curr_vehicle_events')
        for agency,ride in [('a','ride'),('b','ride-b')]:
            for index in range(3):
                timestamp=now-60000+index*20000
                self.db.query(f"""INSERT INTO eta.curr_vehicle_events
                    (_id,ride_id,agency_id,trip_id,vehicle_id,hashed_shape_id,node_index,match_confidence,speed,created_at,received_at)
                    VALUES ('{agency}{index}','{ride}','{agency}','trip','shared-vehicle','hs',{index},1.,20,{timestamp},{timestamp})""")
        query=view_select('eta/bootstrap/live-traffic.sql')
        rows=self.rows(query)
        self.assertEqual(len(rows),2, {'observed':rows,'rides':self.rows('SELECT _id,agency_id FROM eta.curr_rides FINAL'),'valid':self.rows('SELECT ride_id,agency_id,vehicle_id,node_index FROM eta.valid_vehicle_events')})
        self.assertEqual(len({r['vehicle_id'] for r in rows}),2)
        self.assertTrue(all(r['ratio']==2. for r in rows))
