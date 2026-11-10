"""Native, checksummed model artifacts and one training/inference encoder."""
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .features import CATEGORICAL, FEATURE_SCHEMA, FEATURES, NUMERIC, feature_row, number


def vocabulary(rows):
    return {name: sorted({feature_row(row)[name] for row in rows}) for name in CATEGORICAL}


def matrix(rows, vocab, algorithm='lightgbm'):
    values = [feature_row(row) for row in rows]
    if algorithm == 'catboost':
        frame = pd.DataFrame(values, columns=FEATURES)
        for name in NUMERIC:
            frame[name] = pd.to_numeric(frame[name], errors='coerce').astype(float)
        for name in CATEGORICAL:
            allowed = set(vocab[name])
            frame[name] = frame[name].map(lambda value: value if value in allowed else '__unknown__')
        return frame
    codes = {name: {value: i for i, value in enumerate(vocab[name])} for name in CATEGORICAL}
    return np.asarray([[row[name] if row[name] is not None else np.nan for name in NUMERIC] +
                       [codes[name].get(row[name], -1) for name in CATEGORICAL] for row in values], dtype=float)


def corrected_remaining(rows, residuals):
    """Target sign is actual - baseline, so ADD; bound both size and horizon."""
    if len(rows) != len(residuals):
        raise ValueError('model returned a different row count')
    result = []
    for row, residual in zip(rows, residuals):
        base, correction = number(row.get('baseline_seconds')), number(residual)
        if base is None or base <= 0 or correction is None:
            result.append(None)
            continue
        limit = min(120., base * .25)
        result.append(max(1., base + max(-limit, min(limit, correction))))
    return result


class ModelBundle:
    def __init__(self, directory):
        directory = Path(directory)
        payload = (directory / 'model.json').read_bytes()
        expected = (directory / 'model.json.sha256').read_text().strip()
        if hashlib.sha256(payload).hexdigest() != expected:
            raise ValueError('model manifest checksum mismatch')
        self.manifest = json.loads(payload)
        if self.manifest['feature_schema'] != FEATURE_SCHEMA or self.manifest['features'] != list(FEATURES):
            raise ValueError('model feature contract mismatch')
        if self.manifest['algorithm'] != 'lightgbm':
            raise ValueError('only the validated primary LightGBM artifact is served')
        model_path = directory / 'lightgbm.txt'
        if hashlib.sha256(model_path.read_bytes()).hexdigest() != self.manifest['files']['lightgbm.txt']:
            raise ValueError('model weights checksum mismatch')
        import lightgbm as lgb
        self.model = lgb.Booster(model_file=str(model_path))
        if self.model.feature_name() != list(FEATURES):
            raise ValueError('native model feature order mismatch')
        self.vocab = self.manifest['vocabulary']

    def predict(self, rows):
        return corrected_remaining(rows, self.model.predict(matrix(rows, self.vocab), num_threads=2))
