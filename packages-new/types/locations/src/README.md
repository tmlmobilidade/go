Location Types

All values come from OpenStreetMap through the locations database (`go-interfaces-locationsdb`).

- `LocationItem`: one administrative division (`osm_id`, `name`, `admin_level`).
- `Location`: the divisions containing a point, in country-agnostic slots
  (`country`, `primary`, `secondary`, `tertiary`, optional `neighbourhood`).
  Which OSM admin_level fills each slot depends on the country.
- `LocationTreeNode`: the same divisions nested country → primary → secondary → tertiary,
  used by the permissions UI.
