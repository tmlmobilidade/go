import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from eta_ml.dataset import write_dataset
from eta_ml.features import FEATURE_SCHEMA, feature_row
from eta_ml.metrics import evaluate
from eta_ml.models import ModelBundle, corrected_remaining, matrix, vocabulary
from eta_ml.train import promotion_gate, train


def fixture():
    start, day = 1760000000000, 86400000
    splits = {}
    for part, size, offset in [('train',1600,0),('validation',400,2*day),('test',400,4*day)]:
        rows = []
        for i in range(size):
            generated = start + offset + i * 1000
            base = 180. + i % 4 * 120.
            delay = (i % 11 - 5) * 20.
            residual = delay * .4 + 5.
            row = dict(feature_schema=FEATURE_SCHEMA, generated_at=generated,
                       baseline_eta_at=generated+int(base*1000), baseline_seconds=base,
                       historical_eta_at=generated+int((base+10)*1000),
                       traffic_eta_at=generated+int((base+5)*1000),
                       incumbent_eta_at=generated+int(base*1000),
                       actual_arrival_at=generated+int((base+residual)*1000),
                       label_known_at=generated+int((base+residual+120)*1000),
                       label_confidence=1., target_residual_seconds=residual,
                       ride_id=f'{part}-{i}',vehicle_id='v',stop_sequence=1,
                       prediction_version='fixture-v1',agency_id='a'+str(i%2),
                       route_id='route'+str(i%2),stop_id='s',hashed_shape_id='hs',
                       freshness_tier='fresh',operational_date=20251009+i//1000,
                       baseline_delay_seconds=delay,history_coverage=1.,
                       remaining_distance_m=base*5,remaining_stops=3,gps_age_seconds=5.,
                       ingestion_lag_seconds=1.,position_confidence=.9,recent_speed_mps=5.,
                       node_dispersion_seconds=10.,traffic_correction_seconds=5.,
                       future_dwell_seconds=0.,hour_sin=0.,hour_cos=1.,operational_weekday=4.)
            row.update(feature_row(row))
            rows.append(row)
        splits[part] = rows
    cutoffs = dict(train_before=start+day, validation_before=start+3*day,
                   test_before=start+5*day, as_of=start+6*day)
    return splits, cutoffs


class GuardTest(unittest.TestCase):
    def test_residual_sign_and_bounds(self):
        self.assertEqual(corrected_remaining([{'baseline_seconds':100.}]*3, [20.,-20.,1000.]), [120.,80.,125.])
        self.assertEqual(corrected_remaining([{'baseline_seconds':100.}], [float('nan')]), [None])

    def test_unseen_categories_do_not_learn_from_holdout(self):
        splits, _ = fixture()
        vocab = vocabulary(splits['train'])
        row = {**splits['validation'][0], 'route_id':'never-seen'}
        self.assertNotIn('never-seen', vocab['route_id'])
        values = matrix([row], vocab)
        self.assertIn(-1., values[0])

    def test_degraded_model_is_rejected(self):
        splits, _ = fixture()
        rows = splits['test']
        baseline = evaluate(rows, [r['baseline_seconds'] for r in rows])
        degraded = evaluate(rows, [r['baseline_seconds']+100 for r in rows])
        self.assertFalse(promotion_gate(baseline, degraded)['passed'])


class TrainingTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='eta-model-test-')
        cls.root = Path(cls.tmp.name)
        cls.splits, cutoffs = fixture()
        write_dataset(cls.root/'dataset', cls.splits, {k:len(v) for k,v in cls.splits.items()}, cutoffs, 'synthetic-fixture')
        cls.manifest = train(cls.root/'dataset', cls.root/'model', rounds=60)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_both_models_train_and_primary_roundtrips(self):
        self.assertTrue((self.root/'model'/'catboost.cbm').is_file())
        bundle = ModelBundle(self.root/'model')
        rows = self.splits['test'][:20]
        predictions = bundle.predict(rows)
        self.assertEqual(len(predictions),20)
        self.assertTrue(all(p is not None for p in predictions))
        self.assertTrue(self.manifest['reports']['validation']['gate']['passed'])
        self.assertTrue(self.manifest['reports']['test']['gate']['passed'])

    def test_corrupted_native_weights_are_rejected(self):
        target = self.root/'model'/'lightgbm.txt'
        original = target.read_bytes()
        try:
            target.write_bytes(original+b'corrupt')
            with self.assertRaisesRegex(ValueError, 'weights checksum'):
                ModelBundle(self.root/'model')
        finally:
            target.write_bytes(original)
