# ETA residual learning

This app keeps offline learning and batch scoring separate from passenger HTTP
requests. It uses frozen prediction features from #946–#957, not current tables
joined retrospectively. A production-trained model is not included in the repo.

## Dataset (#958)

Run `modules/hub/sql/eta/observability/ml-feature-rows.sql` against ClickHouse with
millisecond `since`, `until` and `as_of` parameters and save JSONEachRow. Select a
period after `eta-features-v1` snapshots started. That query joins labels only as
targets; schedule, movement, road dispersion, traffic and dwell features were
already frozen at prediction generation. No future traffic or arrival enters
the feature allowlist in `src/eta_ml/features.py`.

From this app directory:

```bash
PYTHONPATH=src python -m eta_ml.dataset --input export.jsonl --output datasets/run-1 \
  --train-before 2026-11-01T04:00:00Z \
  --validation-before 2026-11-05T04:00:00Z \
  --test-before 2026-11-09T04:00:00Z --as-of 2026-11-10T12:00:00Z
PYTHONPATH=src python -m unittest discover -s tests -v
```

Use actual available dates; the dates above only illustrate cutoff syntax.
Output is immutable (an existing output directory is rejected): JSONL per split,
SHA256 file hashes, feature schema, target definition, cutoffs, exclusion counts,
and horizon/agency/route/quality/route-day benchmarks. The target is
`(actual_arrival_at - baseline_eta_at) / 1000`: ADD the learned residual to the
baseline. Positive residual means the statistical ETA was too early.

Labels must have been known before that split ended. Whole rides that cross
split boundaries are purged, as are unlabelled/unobservable examples. One
deterministic refresh per stop/horizon reduces repeated-example dominance.
Temporal splits and route/day reports are mandatory; random row splits are not
supported. Counts report excluded labels separately from model coverage.

`node_dispersion_seconds` is an independent-node quadrature of historical
dispersion, a feature rather than a calibrated prediction interval. Missing
features stay missing. Route and other categorical vocabularies must be learned
from training only. Historical-only, vehicle-live and corridor predictions are frozen side by side
and compared on the same labelled population in the dataset manifest.
