"""Train frozen residual models on temporal splits; never tune on test data."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
from pathlib import Path

import numpy as np

from .dataset import canonical
from .features import CATEGORICAL, FEATURE_SCHEMA, FEATURES, horizon, number
from .metrics import evaluate, quantile
from .models import corrected_remaining, matrix, vocabulary


PARAMETERS = dict(objective='regression_l1', metric='l1', learning_rate=.05,
                  num_leaves=31, min_data_in_leaf=20, seed=1729,
                  deterministic=True, force_col_wise=True, num_threads=2, verbosity=-1)


def load_dataset(directory):
    directory = Path(directory)
    manifest = json.loads((directory / 'manifest.json').read_text())
    if manifest.get('feature_schema') != FEATURE_SCHEMA or manifest.get('features') != list(FEATURES):
        raise ValueError('dataset feature contract mismatch')
    datasets = {}
    for split in ('train', 'validation', 'test'):
        payload = (directory / f'{split}.jsonl').read_bytes()
        if hashlib.sha256(payload).hexdigest() != manifest['files'][f'{split}.jsonl']:
            raise ValueError(f'{split} dataset checksum mismatch')
        datasets[split] = [json.loads(line) for line in payload.splitlines() if line]
    if any(len(datasets[split]) < minimum for split, minimum in [('train',1000),('validation',200),('test',200)]):
        raise ValueError('need at least 1000 training, 200 validation and 200 test rows')
    # Recheck split isolation at the training boundary even for hand-built data.
    seen = {}
    cutoffs = manifest['cutoffs']
    limits = {'train': cutoffs['train_before'], 'validation': cutoffs['validation_before'], 'test': cutoffs['test_before']}
    lower = {'train': -1, 'validation': cutoffs['train_before'], 'test': cutoffs['validation_before']}
    for split, rows in datasets.items():
        for row in rows:
            identity = (row['agency_id'], row['ride_id'])
            if identity in seen and seen[identity] != split:
                raise ValueError('ride leakage across dataset splits')
            seen[identity] = split
            if not lower[split] <= row['generated_at'] < row['actual_arrival_at'] <= row['label_known_at'] < limits[split]:
                raise ValueError('temporal feature/label leakage')
            residual = (row['actual_arrival_at'] - row['baseline_eta_at']) / 1000.
            if abs(row['target_residual_seconds'] - residual) > 1e-6:
                raise ValueError('residual target sign or value mismatch')
    return manifest, datasets


def promotion_gate(reference, candidate, minimum=50):
    failures = []
    base, model = reference['overall'], candidate['overall']
    if base['scored'] < 200 or model['scored'] < 200:
        failures.append('insufficient holdout support')
    if model['coverage'] < base['coverage']:
        failures.append('coverage regression')
    if base['mae'] is None or model['mae'] is None or model['mae'] > base['mae'] * .98:
        failures.append('less than 2% MAE improvement')
    if base['p90'] is None or model['p90'] is None or model['p90'] > base['p90'] * 1.05 + 5:
        failures.append('P90 regression')
    for name, baseline in reference['cohorts'].items():
        if name.startswith('route_day:') or baseline['scored'] < minimum:
            continue
        compared = candidate['cohorts'].get(name)
        if compared is None or compared['coverage'] < baseline['coverage']:
            failures.append(f'{name}: coverage regression')
        elif compared['mae'] > baseline['mae'] * 1.05 + 5 or compared['p90'] > baseline['p90'] * 1.05 + 5:
            failures.append(f'{name}: accuracy regression')
    return dict(passed=not failures, failures=failures)


def independent_weights(rows):
    keys = [(r['ride_id'], r['vehicle_id'], horizon(r['baseline_seconds'])) for r in rows]
    counts = Counter(keys)
    return np.asarray([1. / counts[key] for key in keys])


def train(dataset_dir, output, rounds=300):
    import lightgbm as lgb
    from catboost import CatBoostRegressor

    data_manifest, splits = load_dataset(dataset_dir)
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    train_rows, valid_rows = splits['train'], splits['validation']
    vocab = vocabulary(train_rows)
    target = lambda rows: np.clip([r['target_residual_seconds'] for r in rows], -600., 600.)
    train_data = lgb.Dataset(matrix(train_rows, vocab), label=target(train_rows),
                             weight=independent_weights(train_rows), feature_name=list(FEATURES),
                             categorical_feature=list(CATEGORICAL))
    valid_data = lgb.Dataset(matrix(valid_rows, vocab), label=target(valid_rows), reference=train_data,
                             feature_name=list(FEATURES), categorical_feature=list(CATEGORICAL))
    primary = lgb.train(PARAMETERS, train_data, num_boost_round=rounds, valid_sets=[valid_data],
                        callbacks=[lgb.early_stopping(25, verbose=False)])
    primary.save_model(str(output / 'lightgbm.txt'))
    comparator_parameters = dict(iterations=rounds, depth=6, learning_rate=.05,
                                 loss_function='MAE', random_seed=1729, thread_count=2,
                                 verbose=False, allow_writing_files=False)
    comparator = CatBoostRegressor(**comparator_parameters)
    comparator.fit(matrix(train_rows, vocab, 'catboost'), target(train_rows),
                   sample_weight=independent_weights(train_rows), cat_features=list(CATEGORICAL),
                   eval_set=(matrix(valid_rows, vocab, 'catboost'), target(valid_rows)),
                   early_stopping_rounds=25, use_best_model=True)
    comparator.save_model(str(output / 'catboost.cbm'))
    reports = {}
    radius = None
    for split in ('validation', 'test'):
        rows = splits[split]
        predictions = corrected_remaining(rows, primary.predict(matrix(rows, vocab), num_threads=2))
        other = corrected_remaining(rows, comparator.predict(matrix(rows, vocab, 'catboost')))
        incumbent = [(r['incumbent_eta_at'] - r['generated_at']) / 1000.
                     if number(r.get('incumbent_eta_at')) is not None else None for r in rows]
        reference = evaluate(rows, incumbent)
        primary_report, comparator_report = evaluate(rows, predictions), evaluate(rows, other)
        reports[split] = dict(incumbent=reference, lightgbm=primary_report,
                              catboost=comparator_report, gate=promotion_gate(reference, primary_report))
        for name, field in [('historical_only','historical_eta_at'), ('vehicle_live','baseline_eta_at'), ('corridor','traffic_eta_at')]:
            values = [(r[field] - r['generated_at']) / 1000. if number(r.get(field)) is not None else None for r in rows]
            reports[split][name] = evaluate(rows, values)
        if split == 'validation':
            radius = quantile([abs((r['actual_arrival_at']-r['generated_at']) / 1000. - p)
                               for r, p in zip(rows,predictions) if p is not None], .9)
    files = {name: hashlib.sha256((output / name).read_bytes()).hexdigest()
             for name in ('lightgbm.txt', 'catboost.cbm')}
    content = dict(feature_schema=FEATURE_SCHEMA, features=list(FEATURES), algorithm='lightgbm',
                   vocabulary=vocab, files=files, dataset_version=data_manifest['dataset_version'],
                   dataset_files=data_manifest['files'], cutoffs=data_manifest['cutoffs'],
                   trained_at=int(datetime.now(timezone.utc).timestamp()*1000),
                   parameters=PARAMETERS, comparator_parameters=comparator_parameters,
                   rounds=rounds, selected_iteration=primary.best_iteration,
                   package_versions={name: version(name) for name in ('lightgbm','catboost','numpy','pandas','scipy')},
                   residual_sign='actual-minus-baseline; add to baseline',
                   validation_p90_radius_seconds=radius,
                   uncertainty_note='empirical validation residual radius, not a calibrated coverage guarantee',
                   eligible_for_canary=all(reports[s]['gate']['passed'] for s in reports),
                   reports=reports,
                   feature_importance=dict(zip(FEATURES, primary.feature_importance(importance_type='gain').tolist())),
                   comparator_feature_importance=dict(zip(FEATURES, comparator.feature_importances_.tolist())))
    content['model_version'] = hashlib.sha256(canonical({k:v for k,v in content.items() if k != 'trained_at'}).encode()).hexdigest()[:24]
    payload = (canonical(content)+'\n').encode()
    (output / 'model.json').write_bytes(payload)
    (output / 'model.json.sha256').write_text(hashlib.sha256(payload).hexdigest()+'\n')
    return content


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dataset', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--rounds', type=int, default=300)
    args = parser.parse_args()
    manifest = train(args.dataset, args.output, args.rounds)
    print(canonical({k:manifest[k] for k in ('model_version','eligible_for_canary')}))


if __name__ == '__main__':
    main()
