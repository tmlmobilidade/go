"""Batch inference with deterministic fallback; shadow is the default mode."""
import argparse
from dataclasses import dataclass
import json
import os
from pathlib import Path
import signal
import time

from .clickhouse import ClickHouse, sql_file
from .dataset import canonical
from .features import CATEGORICAL, FEATURE_SCHEMA, NUMERIC, number
from .models import ModelBundle


@dataclass(frozen=True)
class Policy:
    max_generation_age_seconds: int = 60
    max_gps_age_seconds: int = 180
    max_model_age_seconds: int = 7*86400
    max_training_data_age_seconds: int = 14*86400
    max_missing_fraction: float = .4
    max_batch_rows: int = 50000
    max_latency_ms: int = 10000


def score_batch(rows, bundle, now_ms, policy=Policy()):
    if len(rows) > policy.max_batch_rows:
        raise ValueError('active feature batch exceeded row budget')
    version = bundle.manifest['model_version'] if bundle else 'unavailable'
    outputs, eligible, indices = [], [], []
    for row in rows:
        values = {key:number(row.get(key)) for key in ('generated_at','baseline_eta_at','incumbent_eta_at','baseline_seconds','gps_age_seconds')}
        if any(values[k] is None for k in ('generated_at','baseline_eta_at','incumbent_eta_at')):
            continue
        gen = int(values['generated_at'])
        missing = sum(number(row.get(k)) is None for k in NUMERIC) / len(NUMERIC)
        status = 'ok'
        if row.get('feature_schema') != FEATURE_SCHEMA:
            status = 'feature_version_mismatch'
        elif bundle is None:
            status = 'model_unavailable'
        elif gen > now_ms+5000 or now_ms-gen > policy.max_generation_age_seconds*1000:
            status = 'generation_stale'
        elif values['gps_age_seconds'] is None or values['gps_age_seconds']+(now_ms-gen)/1000. > policy.max_gps_age_seconds:
            status = 'gps_stale'
        elif values['baseline_seconds'] is None or values['baseline_seconds'] <= 0:
            status = 'invalid_baseline'
        elif abs(values['baseline_seconds']-(values['baseline_eta_at']-gen)/1000.) > 1:
            status = 'baseline_clock_mismatch'
        elif missing > policy.max_missing_fraction:
            status = 'missing_features'
        elif now_ms-bundle.manifest['trained_at'] > policy.max_model_age_seconds*1000 or now_ms-bundle.manifest['cutoffs']['train_before'] > policy.max_training_data_age_seconds*1000:
            status = 'model_stale'
        elif sum(str(row.get(k,'__unknown__')) not in bundle.vocab[k] for k in CATEGORICAL) / len(CATEGORICAL) > .5:
            status = 'unknown_categories'
        outputs.append(dict(generated_at=gen, scored_at=now_ms, ride_id=str(row['ride_id']),
                            vehicle_id=str(row['vehicle_id']),stop_sequence=int(row['stop_sequence']),
                            agency_id=str(row['agency_id']),route_id=str(row['route_id']),
                            baseline_eta_at=int(values['baseline_eta_at']),fallback_eta_at=int(values['incumbent_eta_at']),
                            predicted_eta_at=None,model_version=version,feature_schema=str(row.get('feature_schema','')),
                            status=status,missing_feature_fraction=missing))
        if status == 'ok':
            indices.append(len(outputs)-1)
            eligible.append(row)
    if eligible:
        try:
            predictions = bundle.predict(eligible)
            if len(predictions) != len(eligible):
                raise ValueError('model output length mismatch')
            for index,row,seconds in zip(indices,eligible,predictions):
                predicted = number(seconds)
                eta_at = int(row['generated_at'])+round(predicted*1000) if predicted is not None else None
                if eta_at is None or eta_at < now_ms-15000 or abs(predicted-float(row['baseline_seconds'])) > min(120.,float(row['baseline_seconds'])*.25)+.001:
                    outputs[index]['status'] = 'invalid_model_output'
                else:
                    outputs[index]['predicted_eta_at'] = eta_at
        except Exception:
            for index in indices:
                outputs[index]['status'] = 'model_error'
                outputs[index]['predicted_eta_at'] = None
    outputs.sort(key=lambda r:(r['ride_id'],r['vehicle_id'],r['stop_sequence']))
    previous = {}
    for output in outputs:
        key = (output['ride_id'],output['vehicle_id'])
        value = output['predicted_eta_at'] if output['status']=='ok' else output['fallback_eta_at']
        value = max(value,previous.get(key,value))
        previous[key] = value
        if output['status']=='ok':
            output['predicted_eta_at'] = value
    return outputs


def run_once(client, bundle, policy=Policy()):
    start = time.monotonic()
    rows = client.query(sql_file('eta/ml/select-active-features.sql'))
    now_ms = int(time.time()*1000)
    outputs = score_batch(rows,bundle,now_ms,policy)
    latency = (time.monotonic()-start)*1000
    if latency > policy.max_latency_ms:
        for output in outputs:
            output['status'],output['predicted_eta_at'] = 'batch_too_slow',None
    fallback = sum(o['status']!='ok' for o in outputs)/len(outputs) if outputs else 0.
    health = dict(model_version=bundle.manifest['model_version'] if bundle else 'unavailable',
                  recorded_at=int(time.time()*1000),generated_at=max((o['generated_at'] for o in outputs),default=0),
                  status='ok' if bundle and fallback<=.2 and latency<=policy.max_latency_ms else 'error',
                  mode='shadow',rows=len(outputs),latency_ms=latency,fallback_fraction=fallback,
                  missing_feature_fraction=sum(o['missing_feature_fraction'] for o in outputs)/len(outputs) if outputs else 0.,
                  eligible_for_canary=int(bool(bundle and bundle.manifest['eligible_for_canary'])))
    client.insert('eta.model_predictions',outputs)
    client.insert('eta.model_health',[health])
    return health


def healthcheck(path, now_ms=None):
    try:
        record = json.loads(Path(path).read_text())
        now_ms = int(time.time()*1000) if now_ms is None else now_ms
        return record['status']=='ok' and 0 <= now_ms-record['recorded_at'] <= 60000
    except (OSError,ValueError,KeyError,TypeError):
        return False


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--once',action='store_true')
    parser.add_argument('--healthcheck',action='store_true')
    args = parser.parse_args()
    health_path = Path(os.environ.get('ETA_ML_HEALTH_FILE','/tmp/eta-ml-health.json'))
    if args.healthcheck:
        raise SystemExit(0 if healthcheck(health_path) else 1)
    model_dir = Path(os.environ.get('ETA_ML_MODEL_DIR','/model'))
    interval = max(5.,float(os.environ.get('ETA_ML_INTERVAL_SECONDS','10')))
    client, bundle, stopping = ClickHouse(), None, False
    def stop(_signal,_frame):
        nonlocal stopping
        stopping = True
    signal.signal(signal.SIGTERM,stop)
    signal.signal(signal.SIGINT,stop)
    while not stopping:
        start = time.monotonic()
        try:
            if bundle is None:
                try:
                    bundle = ModelBundle(model_dir)
                except (OSError,ValueError,KeyError):
                    bundle = None
            health = run_once(client,bundle)
        except Exception as error:
            health = dict(status='error',recorded_at=int(time.time()*1000),error_type=type(error).__name__)
        temporary = health_path.with_suffix('.tmp')
        temporary.write_text(canonical(health)+'\n')
        temporary.replace(health_path)
        print(canonical(health),flush=True)
        if args.once:
            raise SystemExit(0 if health['status']=='ok' else 1)
        deadline = start+interval
        while not stopping and time.monotonic()<deadline:
            time.sleep(min(.5,deadline-time.monotonic()))


if __name__ == '__main__':
    main()
