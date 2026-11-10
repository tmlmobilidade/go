"""Execute the production SQL against an isolated embedded ClickHouse.

python -m pip install chdb==4.1.0
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
        for path in ['eta/bootstrap/create-tables.sql',
                     'eta/bootstrap/mv-sync-curr-vehicle-events.sql',
                     'eta/bootstrap/mv-predict-node-etas.sql',
                     'eta/bootstrap/mv-predict-trip-stop-etas.sql',
                     'eta/bootstrap/prediction-snapshots.sql']:
            for stmt in statements(path):
                if 'MATERIALIZED VIEW' not in stmt:
                    cls.db.query(stmt)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.tmp.cleanup()

    def rows(self, sql):
        result = str(self.db.query(sql, 'JSONEachRow'))
        return [json.loads(line) for line in result.splitlines() if line]

    def test_prediction_query_executes_on_empty_database(self):
        self.assertEqual(self.rows(view_select('eta/bootstrap/mv-predict-trip-stop-etas.sql')), [])

    def test_snapshot_retains_multiple_generations(self):
        self.db.query('TRUNCATE eta.prediction_snapshots')
        self.db.query('''INSERT INTO eta.prediction_snapshots
            (generated_at, ride_id, vehicle_id, stop_sequence, prediction_version)
            VALUES (1000, 'r', 'v', 1, 'v1'), (2000, 'r', 'v', 1, 'v1')''')
        self.assertEqual(self.rows('SELECT count() AS n FROM eta.prediction_snapshots')[0]['n'], 2)

    def test_snapshot_select_compiles(self):
        self.rows(view_select('eta/bootstrap/prediction-snapshots.sql'))

    def test_bootstrap_preserves_data_on_rerun(self):
        self.db.query("INSERT INTO eta.hist_shape_nodes (hashed_shape_id,node_index) VALUES ('keep',1)")
        for stmt in statements('eta/bootstrap/create-tables.sql'):
            self.db.query(stmt)
        self.assertEqual(self.rows("SELECT count() AS n FROM eta.hist_shape_nodes WHERE hashed_shape_id='keep'")[0]['n'], 1)
