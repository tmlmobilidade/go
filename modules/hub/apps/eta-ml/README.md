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

## Training and validation (#959)

Use Python 3.12 and `pip install -r requirements.txt`. Native LightGBM is the
primary residual model; CatBoost is trained as an independent comparator.

```bash
PYTHONPATH=src python -m eta_ml.train --dataset datasets/run-1 --output artifacts/run-1
```

The job verifies immutable split hashes, feature order, label clocks, target
sign and whole-ride isolation again. Training needs >=1000 rows, validation and
test >=200 each. Training-only categorical vocabularies map unseen values to a
missing/unknown category. Weights limit repeated ride/horizon influence. Native
model files, parameters, package versions, dataset hashes, feature importance,
all cohort metrics and a checksummed model manifest are saved together. There
is no pickle deserialization and no online training in the serving job.

Residual corrections are clipped to +/-120 s and 25% of baseline remaining
time. Validation controls early stopping; the untouched temporal test is a
final rejection gate. Promotion requires >=2% overall MAE improvement, no
coverage regression, bounded P90 regression, and no material agency/route/
horizon/quality regression in cohorts with >=50 observations. Small cohorts
remain explicitly under-supported. Route/day slices are included for manual
failure analysis. An empirical validation P90 error radius is recorded as an
uncertainty diagnostic, not a calibrated interval guarantee.

Synthetic fixture tests exercise both actual libraries and artifact reload;
they do not establish production accuracy. No production dataset or trained
production model was available. Collect frozen snapshots/labels, train, inspect
failure slices, and run shadow evaluation before any canary deployment.


## Batch serving and rollback (#960)

The Python worker runs every ten seconds, reads the small atomic current
prediction frame, scores batches outside HTTP requests, and writes matching
generation/model-version predictions into ClickHouse. It never scans snapshot
history on the serving path. Model history is ordered by generation so public
reads can prune to 90 seconds. Training and serving share one encoder and
frozen feature contract. Serving does not load CatBoost.

Configure LABDB_HOST, LABDB_PORT, LABDB_USERNAME, LABDB_PASSWORD, or use
ETA_ML_CLICKHOUSE_URL for an HTTPS/local forwarded endpoint. SSH tunnels are
external. Mount the immutable model read-only at /model, or set ETA_ML_MODEL_DIR.
ETA_ML_SQL_DIR defaults to the module SQL directory and is /app/sql in the image.

Run from the app directory:

    PYTHONPATH=src python -m eta_ml.serve --once
    PYTHONPATH=src python -m eta_ml.serve
    PYTHONPATH=src python -m eta_ml.serve --healthcheck

The app-local Dockerfile is discovered by the module build workflow. It runs
as a non-root user with a heartbeat health check. Missing models, stale
generations/GPS, changed schemas, mostly unknown categories, missing features,
invalid outputs, models older than seven days and training data older than
fourteen days all fall back. Corrections are bounded and stop order remains
monotonic. The budget is 50,000 rows and ten seconds per batch. Failed writes,
exceeded budgets and expired heartbeats also lead to baseline fallback.
Restart the worker to load another immutable model.

The ml_deployment table starts empty. The worker only writes predictions and
health; shadow writes cannot enable publication. After real shadow validation,
an operator inserts slot='active', the exact model version, enabled=1, a small
canary_percent and a newer updated_at. Ride hashing keeps a bus in one cohort.
Promotion also requires a frozen holdout pass, current worker health and live
route/horizon gates: >=100 examples, >=30 independent rides, >=95% coverage and
bounded MAE/P90 regression. Gates refresh every five minutes and expire after
ten; insufficient support keeps that cohort on baseline.

Roll back with a newer active deployment row with enabled=0. The next publisher
cycle uses statistical ETAs. Public JSON and GTFS-RT shapes are unchanged. No
canary is activated here. The ml-health query reports latency, missing features,
fallbacks and version clocks; ml_quality_gates contains paired MAE/P90/support.

For large offline exports, eta_ml.export streams to a new file; dataset
creation hashes input incrementally. The retained-example budget defaults to
250,000. --sample-modulus 10 retains a deterministic one-in-ten set of whole
rides. The manifest records sampling settings and excluded counts. This bounds
preparation without randomly mixing train/test rows.

## Applying the schema

Build the ETA app and run its migrate script with the intended environment
loaded. It creates additive schema, reaggregates retained 30-day node samples
to populate real support counts, installs views in dependency order and warms
geometry/node/snap/prediction views. The v2 trip-stop MV has a new name, allowing
the old MV/table to serve during warmup. Check v2 freshness and coverage before
switching publishers. No database truncation or full raw GPS rebuild occurs.

Old road samples may contain dwell until rebuilt or aged out; leave dwell
promotion disabled until the intended history is rebuilt and validated.
Road assignments, label audits, peak timings, production model training and
image build/deployment remain operational validation steps.
