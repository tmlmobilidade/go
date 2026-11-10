import json
from pathlib import Path
import tempfile
import unittest

from eta_ml.features import CATEGORICAL, FEATURE_SCHEMA, NUMERIC
from eta_ml.serve import healthcheck, run_once, score_batch

NOW = 1794320000000


def feature():
    row = {k:1. for k in NUMERIC}
    row.update({k:'known' for k in CATEGORICAL})
    row.update(feature_schema=FEATURE_SCHEMA,generated_at=NOW-1000,baseline_seconds=300.,
               baseline_eta_at=NOW+299000,incumbent_eta_at=NOW+299000,
               ride_id='ride',vehicle_id='vehicle',stop_sequence=1,gps_age_seconds=5.)
    return row


class Bundle:
    def __init__(self):
        self.manifest = dict(model_version='fixture',trained_at=NOW-1000,
                             cutoffs={'train_before':NOW-86400000},eligible_for_canary=True)
        self.vocab = {k:['known'] for k in CATEGORICAL}
        self.invalid = False

    def predict(self, rows):
        return [float('nan') if self.invalid else r['baseline_seconds']+20 for r in rows]


class ServeTest(unittest.TestCase):
    def test_good_model_is_shadow_scored_with_positive_residual_added(self):
        result = score_batch([feature()],Bundle(),NOW)[0]
        self.assertEqual(result['status'],'ok')
        self.assertEqual(result['predicted_eta_at'],result['baseline_eta_at']+20000)

    def test_missing_stale_and_invalid_models_fall_back(self):
        self.assertEqual(score_batch([feature()],None,NOW)[0]['status'],'model_unavailable')
        bundle = Bundle()
        bundle.manifest['trained_at'] = NOW-8*86400000
        self.assertEqual(score_batch([feature()],bundle,NOW)[0]['status'],'model_stale')
        bundle = Bundle()
        bundle.invalid = True
        result = score_batch([feature()],bundle,NOW)[0]
        self.assertEqual(result['status'],'invalid_model_output')
        self.assertIsNone(result['predicted_eta_at'])

    def test_stale_generation_gps_and_schema_are_rejected(self):
        for change,expected in [({'generated_at':NOW-120000},'generation_stale'),
                                ({'gps_age_seconds':200},'gps_stale'),
                                ({'feature_schema':'v0'},'feature_version_mismatch')]:
            self.assertEqual(score_batch([{**feature(),**change}],Bundle(),NOW)[0]['status'],expected)

    def test_missing_features_and_unknown_categories_fall_back(self):
        row = feature()
        for key in NUMERIC[3:]:
            row[key] = None
        row['gps_age_seconds'] = 5.
        self.assertEqual(score_batch([row],Bundle(),NOW)[0]['status'],'missing_features')
        row = {**feature(),**{k:'new' for k in CATEGORICAL}}
        self.assertEqual(score_batch([row],Bundle(),NOW)[0]['status'],'unknown_categories')

    def test_order_is_monotonic_after_scoring(self):
        first = feature()
        second = {**feature(),'stop_sequence':2,'baseline_seconds':310.,
                  'baseline_eta_at':NOW+309000,'incumbent_eta_at':NOW+309000}
        rows = score_batch([second,first],Bundle(),NOW)
        self.assertGreaterEqual(rows[1]['predicted_eta_at'],rows[0]['predicted_eta_at'])

    def test_healthcheck_expires_after_worker_stalls(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'health.json'
            path.write_text(json.dumps({'status':'ok','recorded_at':NOW}))
            self.assertTrue(healthcheck(path,NOW+1000))
            self.assertFalse(healthcheck(path,NOW+61000))

    def test_transport_writes_do_not_activate_deployment(self):
        class Client:
            def __init__(self): self.tables=[]
            def query(self,_sql): return []
            def insert(self,table,_rows): self.tables.append(table)
        client=Client()
        result=run_once(client,Bundle())
        self.assertEqual(result['mode'],'shadow')
        self.assertEqual(client.tables,['eta.model_predictions','eta.model_health'])
