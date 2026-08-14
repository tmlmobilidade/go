-- RELATÓRIO DO SUBCONSOLIDADO DAS VENDAS A BORDO PARA DEPARTAMENTO FINANCEIRO

insert into performance.subconsolidado_vbordo
select
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    count() as quantidade,
    pax_value,
    cam_value,
    sum(pax_value + cam_value) as total_value
from (
    select
        agency_id,
        if(toHour(created_at_dt) < 4, toDate(created_at_dt) - 1, toDate(created_at_dt)) as operational_date,
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
        ) as product_long_id,
        toDate(received_at_dt) as processed_date,
        toDate(created_at_dt) as calendar_date,
        formatDateTime(created_at_dt, '%Y%m') as calendar_month,
        toInt32(price) as pax_value,
        toInt32(multiIf(
            positionCaseInsensitive(product_id, '2029') > 0
                or positionCaseInsensitive(product_id, '2030') > 0
                or positionCaseInsensitive(product_id, '2031') > 0
                or positionCaseInsensitive(product_id, '2212') > 0
                or positionCaseInsensitive(product_id, '2220') > 0
                or positionCaseInsensitive(product_id, '2222') > 0,
            if(price < 0, -45, 45),
            positionCaseInsensitive(product_id, '3223') > 0
                or positionCaseInsensitive(product_id, '4477') > 0,
            if(price < 0, -130, 130),
            0
        )) as cam_value
    from (
        select
            agency_id as agency_id,
            price,
            product_id,
            fromUnixTimestamp64Milli(toInt64(created_at)) as created_at_dt,
            fromUnixTimestamp64Milli(toInt64(received_at)) as received_at_dt
        from simplified_apex.sales
    )
)
group by
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    pax_value,
    cam_value;


    insert into performance.subconsolidado_vbordo
select
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    count() as quantidade,
    pax_value,
    cam_value,
    sum(pax_value + cam_value) as total_value
from (
    select
        agency_id,
        if(toHour(created_at_dt) < 4, toDate(created_at_dt) - 1, toDate(created_at_dt)) as operational_date,
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
        ) as product_long_id,
        toDate(received_at_dt) as processed_date,
        toDate(created_at_dt) as calendar_date,
        formatDateTime(created_at_dt, '%Y%m') as calendar_month,
        toInt32(price) as pax_value,
        toInt32(multiIf(
            positionCaseInsensitive(product_id, '2029') > 0
                or positionCaseInsensitive(product_id, '2030') > 0
                or positionCaseInsensitive(product_id, '2031') > 0
                or positionCaseInsensitive(product_id, '2212') > 0
                or positionCaseInsensitive(product_id, '2220') > 0
                or positionCaseInsensitive(product_id, '2222') > 0,
            if(price < 0, -45, 45),
            positionCaseInsensitive(product_id, '3223') > 0
                or positionCaseInsensitive(product_id, '4477') > 0,
            if(price < 0, -130, 130),
            0
        )) as cam_value
    from (
        select
            agency_id as agency_id,
            price,
            product_id,
            fromUnixTimestamp64Milli(toInt64(created_at)) as created_at_dt,
            fromUnixTimestamp64Milli(toInt64(received_at)) as received_at_dt
        from simplified_apex.refunds
    )
)
group by
    agency_id,
    operational_date,
    product_long_id,
    processed_date,
    calendar_date,
    calendar_month,
    pax_value,
    cam_value;