-- RELATÓRIO DO SUBCONSOLIDADO DAS VENDAS A BORDO PARA DEPARTAMENTO FINANCEIRO

INSERT INTO performance.subconsolidado_vbordo
SELECT
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    count() AS quantidade,
    pax_value,
    cam_value,
    (pax_value + cam_value) * count() AS total_value
FROM (
    SELECT
        agency_id,
        IF(toHour(created_at_dt) < 4, toDate(created_at_dt) - 1, toDate(created_at_dt)) AS operational_date,
        is_passenger,
        line_id,
        multiIf(
            product_id = 'id-prod-tarifa-rapida', 'T3',
            product_id = 'id-prod-tarifa-urbano', 'T2',
            product_id = 'id-prod-tarifa-local', 'T1',
            product_id = 'id-prod-tarifa-local-sesimbra-43', 'T1 sesimbra',
            product_id = 'id-prod-tarifa-local-voltas-42', 'T1 odivelas',
            product_id = 'id-prod-tarifa-local-mini-42', 'T1 loures',
            product_id = 'id-prod-tarifa-local-bon-2029-42', 'T1 loures 2029',
            product_id = 'id-prod-tarifa-local-bon-2030-42', 'T1 loures 2030',
            product_id = 'id-prod-tarifa-local-bon-2031-42', 'T1 loures 2031',
            product_id = 'id-prod-tarifa-local-bon-2212-42', 'T1 odivelas 2212',
            product_id = 'id-prod-tarifa-local-bon-2220-42', 'T1 odivelas 2220',
            product_id = 'id-prod-tarifa-local-bon-2222-42', 'T1 odivelas 2222',
            product_id = 'id-prod-tarifa-local-bon-3223-43', 'T1 sesimbra 3223',
            product_id = 'id-prod-tarifa-interregional-42', 'T4',
            product_id = 'id-prod-tarifa-interregional-44', 'T4',
            product_id = 'id-prod-tarifa-local-bon-4477-44', 'T1 setubal 4477',
            product_id = 'id-prod-tarifa-praia', 'T5',
            product_id
        ) AS product_long_id,
        toDate(received_at_dt) AS processed_date,
        toDate(created_at_dt) AS calendar_date,
        formatDateTime(created_at_dt, '%Y%m') AS calendar_month,
        toUInt32(price) AS pax_value,
        multiIf(
            positionCaseInsensitive(product_id, '2029') > 0
                OR positionCaseInsensitive(product_id, '2030') > 0
                OR positionCaseInsensitive(product_id, '2031') > 0
                OR positionCaseInsensitive(product_id, '2212') > 0
                OR positionCaseInsensitive(product_id, '2220') > 0
                OR positionCaseInsensitive(product_id, '2222') > 0,
            45,
            positionCaseInsensitive(product_id, '3223') > 0
                OR positionCaseInsensitive(product_id, '4477') > 0,
            130,
            0
        ) AS cam_value
    FROM (
        SELECT
            agency_id,
            price,
            product_id,
            fromUnixTimestamp64Milli(toInt64(created_at)) AS created_at_dt,
            fromUnixTimestamp64Milli(toInt64(received_at)) AS received_at_dt
        FROM simplified_apex.sales
    )
)
GROUP BY
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    pax_value,
    cam_value;