"""Stream a frozen feature/label export without exposing credentials."""
import argparse
import os
from pathlib import Path
import tempfile

from .clickhouse import ClickHouse, sql_file
from .dataset import canonical, timestamp


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ('since','until','as-of'):
        parser.add_argument('--'+key, type=timestamp, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if not args.since < args.until <= args.as_of:
        raise ValueError('invalid export range')
    rows = ClickHouse(timeout=60).query_iter(sql_file('eta/observability/ml-feature-rows.sql'),
                                           {'since':args.since,'until':args.until,'as_of':args.as_of})
    count, temporary = 0, None
    try:
        with tempfile.NamedTemporaryFile(mode='w',dir=args.output.parent,delete=False) as output:
            temporary = Path(output.name)
            for row in rows:
                output.write(canonical(row)+'\n')
                count += 1
        os.link(temporary,args.output)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    print(canonical({'exported':count}))


if __name__ == '__main__':
    main()
