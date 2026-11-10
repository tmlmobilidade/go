"""Versioned allowlist shared by dataset creation, training and inference."""
import math

FEATURE_SCHEMA = 'eta-features-v1'
NUMERIC = (
    'baseline_seconds', 'remaining_distance_m', 'remaining_stops', 'gps_age_seconds',
    'ingestion_lag_seconds', 'history_coverage', 'position_confidence',
    'recent_speed_mps', 'node_dispersion_seconds', 'baseline_delay_seconds',
    'traffic_correction_seconds', 'future_dwell_seconds', 'hour_sin', 'hour_cos',
    'operational_weekday',
)
CATEGORICAL = ('agency_id', 'route_id', 'stop_id', 'hashed_shape_id', 'freshness_tier')
FEATURES = NUMERIC + CATEGORICAL


def number(value):
    if value is None or isinstance(value, bool):
        return None
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError):
        return None
    return result if math.isfinite(result) else None


def feature_row(row):
    if row.get('feature_schema') != FEATURE_SCHEMA:
        raise ValueError('feature schema mismatch')
    return {**{k: number(row.get(k)) for k in NUMERIC},
            **{k: str(row[k]) if row.get(k) is not None else '__unknown__' for k in CATEGORICAL}}


def horizon(seconds):
    return next((n for n in (2, 5, 10, 20) if seconds <= n * 60), 99)
