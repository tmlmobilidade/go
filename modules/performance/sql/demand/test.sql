SELECT *
FROM system.mutations
WHERE table = 'refunds';


DELETE FROM "simplified_apex"."refunds" WHERE _id IN (
      '6a2ba82d-0013-40ae-a200-c82104053b2e',
      '6a2ba886-009d-40ae-94f0-c3b66f07162b',
      '6a2bb06b-00cd-40ae-9b90-c3b2d7043ba9',
      '6a2bb7f0-007f-40ae-84c0-c81315061db6',
      '6a2bb961-0051-40ae-a240-c819a804c749',
      '6a2ba172-006a-40ae-8fb0-c815100135e3',
      '6a2ba6ec-00a1-40ae-8c80-c820e302ee02',
      '6a2bab06-0119-40ae-94b0-c3b3c308e020',
      '6a2bab25-011e-40ae-8af0-c3b3c308e022',
      '6a2bab3f-0123-40ae-a760-c3b3c308e024',
      '6a2babfa-006d-40ae-a8a0-c8186902d68e',
      '6a2bb299-0047-40ae-8ad0-c818fd04ef0c'
);


SELECT * FROM "simplified_apex"."refunds" WHERE _id IN (
      '6a2ba82d-0013-40ae-a200-c82104053b2e'
);



SELECT * FROM "simplified_apex"."refunds"
WHERE created_at >= fromUnixTimestamp64Milli(1781247600000)
AND created_at < fromUnixTimestamp64Milli(1781254800000);


SELECT
    fromUnixTimestamp64Milli(1781247600000, 'UTC') AS start_time,
    fromUnixTimestamp64Milli(1781254800000, 'UTC') AS end_time;