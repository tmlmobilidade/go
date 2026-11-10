"""Comparable paired metrics, with explicit prediction coverage."""
import math
from collections import defaultdict

from .features import horizon, number


def quantile(values, q):
    values = sorted(values)
    if not values:
        return None
    index = (len(values) - 1) * q
    lo, hi = math.floor(index), math.ceil(index)
    return values[lo] + (values[hi] - values[lo]) * (index - lo)


def metrics(actual, predicted):
    if len(actual) != len(predicted):
        raise ValueError('metrics require paired predictions')
    errors = [float(p) - float(a) for a, p in zip(actual, predicted)
              if number(a) is not None and number(p) is not None]
    absolute = [abs(e) for e in errors]
    count = len(errors)
    return dict(eligible=len(actual), scored=count, coverage=count / len(actual) if actual else 0.,
                mae=sum(absolute) / count if count else None,
                median=quantile(absolute, .5), p90=quantile(absolute, .9),
                bias=sum(errors) / count if count else None,
                within_60=sum(e <= 60 for e in absolute) / count if count else None,
                within_120=sum(e <= 120 for e in absolute) / count if count else None)


def evaluate(rows, predictions):
    actual = [(r['actual_arrival_at'] - r['generated_at']) / 1000. for r in rows]
    report = {'overall': metrics(actual, predictions), 'cohorts': {}}
    cohorts = defaultdict(list)
    for i, row in enumerate(rows):
        for kind, value in (
            ('agency', row['agency_id']), ('route', (row['agency_id'], row['route_id'])),
            ('horizon', horizon(row['baseline_seconds'])), ('quality', row['freshness_tier']),
            ('route_day', (row['agency_id'], row['route_id'], row['operational_date'])),
        ):
            cohorts[f'{kind}:{value}'].append(i)
    for key, indices in sorted(cohorts.items()):
        report['cohorts'][key] = metrics([actual[i] for i in indices], [predictions[i] for i in indices])
    return report
