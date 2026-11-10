"""Build deterministic temporal datasets from frozen JSONEachRow exports."""
import argparse
from collections import Counter, defaultdict
from datetime import datetime
import hashlib
import json
from pathlib import Path

from .features import FEATURE_SCHEMA, FEATURES, feature_row, horizon, number
from .metrics import evaluate


def timestamp(value):
    dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if dt.tzinfo is None:
        raise ValueError('cutoffs must include a timezone')
    return int(dt.timestamp() * 1000)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def build(rows, train_before, validation_before, test_before, as_of, max_examples=250000, sample_modulus=1):
    if not train_before < validation_before < test_before <= as_of:
        raise ValueError('cutoffs must be increasing and no later than export as_of')
    if max_examples < 1 or sample_modulus < 1:
        raise ValueError('example budget and sampling modulus must be positive')
    counts = Counter()
    chosen = {}
    for source in rows:
        counts['exported'] += 1
        row = dict(source)
        if row.get('feature_schema') != FEATURE_SCHEMA:
            counts['schema_mismatch'] += 1
            continue
        ride_key = str(row.get('agency_id',''))+'\0'+str(row.get('ride_id',''))
        if int.from_bytes(hashlib.sha256(ride_key.encode()).digest()[:8],'big') % sample_modulus:
            counts['sampled_out'] += 1
            continue
        required = ('generated_at', 'baseline_eta_at', 'actual_arrival_at', 'label_known_at', 'baseline_seconds')
        if any(number(row.get(k)) is None for k in required):
            counts['missing_label_or_baseline'] += 1
            continue
        for key in ('generated_at', 'baseline_eta_at', 'actual_arrival_at', 'label_known_at'):
            row[key] = int(number(row[key]))
        for key in ('historical_eta_at', 'incumbent_eta_at', 'traffic_eta_at'):
            row[key] = int(number(row[key])) if number(row.get(key)) is not None else None
        row['baseline_seconds'] = number(row['baseline_seconds'])
        gen, actual, known = row['generated_at'], row['actual_arrival_at'], row['label_known_at']
        if not gen < actual <= known <= as_of or (number(row.get('label_confidence')) or 0) < .7:
            counts['invalid_label_clock_or_quality'] += 1
            continue
        if not 0 < row['baseline_seconds'] <= 1200:
            counts['outside_horizons'] += 1
            continue
        split = 'train' if gen < train_before else 'validation' if gen < validation_before else 'test'
        limit = {'train': train_before, 'validation': validation_before, 'test': test_before}[split]
        if gen >= test_before or known >= limit:
            counts['purged_unavailable_label'] += 1
            continue
        row.update(feature_row(row))
        row['target_residual_seconds'] = (actual - row['baseline_eta_at']) / 1000.
        row['split'] = split
        bucket = horizon(row['baseline_seconds'])
        # One refresh per stop/horizon; deterministic closest-to-horizon choice.
        key = (row['ride_id'], row['vehicle_id'], row['stop_sequence'], bucket, row['prediction_version'])
        rank = (abs(row['baseline_seconds'] - bucket * 60), -gen, hashlib.sha256(canonical(row).encode()).digest())
        if key not in chosen or rank < chosen[key][0]:
            chosen[key] = (rank, row)
            if len(chosen) > max_examples:
                raise ValueError('dataset exceeds example budget; increase --sample-modulus or narrow the export')
    selected = [entry[1] for entry in chosen.values()]
    ride_splits = defaultdict(set)
    for row in selected:
        ride_splits[(row['agency_id'], row['ride_id'])].add(row['split'])
    datasets = {k: [] for k in ('train', 'validation', 'test')}
    for row in selected:
        if len(ride_splits[(row['agency_id'], row['ride_id'])]) > 1:
            counts['purged_boundary_ride'] += 1
            continue
        datasets[row['split']].append(row)
    for split in datasets:
        datasets[split].sort(key=lambda r: (r['generated_at'], r['ride_id'], r['vehicle_id'], r['stop_sequence']))
        counts[split] = len(datasets[split])
    return datasets, dict(counts)


def write_dataset(output, datasets, counts, cutoffs, input_sha, configuration=None):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    files, benchmarks = {}, {}
    for split, rows in datasets.items():
        payload = ''.join(canonical(row) + '\n' for row in rows).encode()
        (output / f'{split}.jsonl').write_bytes(payload)
        files[f'{split}.jsonl'] = hashlib.sha256(payload).hexdigest()
        benchmarks[split] = {'historical_vehicle_live': evaluate(rows, [r['baseline_seconds'] for r in rows])}
        for name, field in [('historical_only', 'historical_eta_at'), ('incumbent', 'incumbent_eta_at'), ('corridor', 'traffic_eta_at')]:
            forecasts = [(r[field] - r['generated_at']) / 1000. if number(r.get(field)) is not None else None for r in rows]
            benchmarks[split][name] = evaluate(rows, forecasts)
    manifest = dict(feature_schema=FEATURE_SCHEMA, features=list(FEATURES), files=files,
                    counts=counts, cutoffs=cutoffs, input_sha256=input_sha, configuration=configuration or {},
                    target='(actual_arrival_at - baseline_eta_at) / 1000; ADD residual to baseline',
                    benchmarks=benchmarks)
    manifest['dataset_version'] = hashlib.sha256(canonical(manifest).encode()).hexdigest()
    (output / 'manifest.json').write_text(canonical(manifest) + '\n')
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    for name in ('train-before', 'validation-before', 'test-before', 'as-of'):
        parser.add_argument('--' + name, type=timestamp, required=True)
    parser.add_argument('--max-examples', type=int, default=250000)
    parser.add_argument('--sample-modulus', type=int, default=1)
    args = parser.parse_args()
    digest = hashlib.sha256()
    def rows():
        with args.input.open('rb') as stream:
            for line in stream:
                digest.update(line)
                if line.strip():
                    yield json.loads(line)
    cutoffs = {k: getattr(args, k) for k in ('train_before', 'validation_before', 'test_before', 'as_of')}
    datasets, counts = build(rows(), **cutoffs, max_examples=args.max_examples, sample_modulus=args.sample_modulus)
    manifest = write_dataset(args.output, datasets, counts, cutoffs, digest.hexdigest(), {'max_examples':args.max_examples,'sample_modulus':args.sample_modulus})
    print(canonical({'dataset_version': manifest['dataset_version'], 'counts': counts}))


if __name__ == '__main__':
    main()
