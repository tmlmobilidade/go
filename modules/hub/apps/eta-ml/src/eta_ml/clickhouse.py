"""HTTP transport using direct LABDB configuration; SSH forwarding is external."""
import base64
import json
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen


def sql_file(name):
    root = Path(os.environ.get('ETA_ML_SQL_DIR', Path(__file__).resolve().parents[4] / 'sql'))
    return (root / name).read_text()


class ClickHouse:
    def __init__(self, timeout=10):
        host, port = os.environ.get('LABDB_HOST'), os.environ.get('LABDB_PORT')
        self.url = os.environ.get('ETA_ML_CLICKHOUSE_URL')
        if not self.url and host and port:
            self.url = f'http://{host}:{int(port)}'
        if not self.url:
            raise ValueError('configure ETA_ML_CLICKHOUSE_URL or LABDB_HOST/PORT')
        parsed = urlsplit(self.url)
        if parsed.scheme not in ('http','https') or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise ValueError('invalid ClickHouse endpoint; use credential environment variables')
        username, password = os.environ.get('LABDB_USERNAME'), os.environ.get('LABDB_PASSWORD')
        if username is None or password is None:
            raise ValueError('configure LABDB_USERNAME/PASSWORD')
        self.auth = 'Basic ' + base64.b64encode(f'{username}:{password}'.encode()).decode()
        self.timeout = timeout

    def request_object(self, body, params=None):
        settings = {'output_format_json_quote_64bit_integers':'0'}
        settings.update({'param_'+key:str(value) for key,value in (params or {}).items()})
        return Request(self.url.rstrip('/')+'/?'+urlencode(settings), data=body,
                       headers={'Authorization':self.auth, 'Content-Type':'text/plain; charset=utf-8'})

    def request(self, body, params=None):
        try:
            with urlopen(self.request_object(body,params), timeout=self.timeout) as response:
                content = response.read(100_000_001)
            if len(content) > 100_000_000:
                raise RuntimeError('ClickHouse response exceeded batch byte budget')
            return content
        except HTTPError as error:
            raise RuntimeError(f'ClickHouse HTTP {error.code}') from None
        except (URLError, TimeoutError):
            raise RuntimeError('ClickHouse connection failed or timed out') from None

    def query(self, sql, params=None):
        payload = self.request((sql.rstrip().rstrip(';')+' FORMAT JSONEachRow').encode(), params)
        return [json.loads(line) for line in payload.splitlines() if line]

    def query_iter(self, sql, params=None):
        body = (sql.rstrip().rstrip(';')+' FORMAT JSONEachRow').encode()
        try:
            with urlopen(self.request_object(body,params),timeout=self.timeout) as response:
                while True:
                    line = response.readline(4_000_001)
                    if not line:
                        break
                    if len(line)>4_000_000:
                        raise RuntimeError('export row exceeds byte budget')
                    if line.strip():
                        yield json.loads(line)
        except HTTPError as error:
            raise RuntimeError(f'ClickHouse HTTP {error.code}') from None
        except (URLError,TimeoutError):
            raise RuntimeError('ClickHouse export failed or timed out') from None

    def insert(self, table, rows):
        if table not in ('eta.model_predictions','eta.model_health'):
            raise ValueError('unsupported inference output table')
        if not rows:
            return
        columns = list(rows[0])
        if any(list(row) != columns for row in rows):
            raise ValueError('inconsistent output columns')
        header = 'INSERT INTO '+table+' ('+','.join(columns)+') FORMAT JSONEachRow\n'
        for offset in range(0,len(rows),1000):
            data = ''.join(json.dumps(row, allow_nan=False, separators=(',',':'))+'\n' for row in rows[offset:offset+1000])
            self.request((header+data).encode())
