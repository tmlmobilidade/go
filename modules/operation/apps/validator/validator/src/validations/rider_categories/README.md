# Rider categories validation

`main.go` registers seven checks in one row-scoped `RuleRunner` action map. Each
check reads current values through `SQLiteContext.RiderCategories`; prepared
tables share schema information without caching row values.

- `fields/checks`: presence of rider_category_id, rider_category_name,
  is_default_fare_category, and eligibility_url. Rule IDs follow
  `rider_categories_<field>_field`.
- `standard/checks`: unique IDs, default-category enum/options, and URL format.
  These retain their existing value-rule IDs.
- Mirrored `fields/tests` and `standard/tests` use real SQLite fixtures.

Configure presence independently from value checks, including the new
`rider_categories_rider_category_name_field` in place of the old presence-only
`rider_category_name_non_empty`. Dependencies are explicit `depends_on` entries
and apply independently on each row. Malformed enum values do not suppress
unrelated checks.

The retained `rider_categories_at_most_one_default_fare_category` rule validates
0/1 and configured options, matching its previous implementation. It does not
check default-category uniqueness or fare-product membership.
