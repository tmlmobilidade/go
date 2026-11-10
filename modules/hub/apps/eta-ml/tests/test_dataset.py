import unittest

from eta_ml.dataset import build
from eta_ml.features import FEATURE_SCHEMA, FEATURES, feature_row
from eta_ml.metrics import metrics


def row(gen=1000, known=3000, ride='r'):
    return dict(feature_schema=FEATURE_SCHEMA, generated_at=gen, baseline_eta_at=gen+120000,
                baseline_seconds=120., actual_arrival_at=gen+1000, label_known_at=known,
                label_confidence=1., ride_id=ride, vehicle_id='v', stop_sequence=1,
                prediction_version='v1', agency_id='a', route_id='route',
                operational_date=20261101, freshness_tier='fresh')


class DatasetTest(unittest.TestCase):
    def test_future_label_is_purged_from_training(self):
        datasets, counts = build([row(1000, 11000)], 10000, 20000, 30000, 40000)
        self.assertEqual(datasets['train'], [])
        self.assertEqual(counts['purged_unavailable_label'], 1)

    def test_boundary_rides_are_not_shared_across_splits(self):
        first, second = row(), row(12000, 14000)
        second['stop_sequence'] = 2
        datasets, _ = build([first, second], 10000, 20000, 30000, 40000)
        self.assertFalse(any(datasets.values()))

    def test_duplicate_refreshes_do_not_multiply_training_rows(self):
        datasets, _ = build([row(), row()], 10000, 20000, 30000, 40000)
        self.assertEqual(len(datasets['train']), 1)
        self.assertEqual(datasets['train'][0]['target_residual_seconds'], -119.)

    def test_features_never_include_labels_or_future_values(self):
        features = feature_row({**row(), 'actual_arrival_at': 999999, 'future_traffic': 2.})
        self.assertEqual(set(features), set(FEATURES))
        self.assertNotIn('actual_arrival_at', features)

    def test_missing_forecasts_reduce_coverage_not_report_zero_error(self):
        result = metrics([10, 20], [10, None])
        self.assertEqual(result['coverage'], .5)
        self.assertIsNone(metrics([10], [None])['mae'])
