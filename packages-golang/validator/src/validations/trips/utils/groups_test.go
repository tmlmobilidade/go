package trips_utils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"reflect"
	"testing"
)

func TestForGroupFieldsPreservesRowsAndLiveValues(t *testing.T) {
	for _, groupField := range []string{"route_id", "pattern_id", "shape_id"} {
		t.Run(groupField, func(t *testing.T) {
			db, ctx := Fixture(t, map[string]any{groupField: "group'quoted", "trip_headsign": nil}, nil)
			if _, err := db.Exec("INSERT INTO trips (rowid, "+groupField+", trip_headsign) VALUES (7, ?, ''), (9, 'other', 'Unrelated')", "group'quoted"); err != nil {
				t.Fatal(err)
			}
			type member struct {
				row    int
				values map[string]string
			}
			want := []member{
				{3, map[string]string{"trip_headsign": "", "absent": ""}},
				{6, map[string]string{"trip_headsign": "", "absent": ""}},
			}
			for _, updated := range []bool{false, true} {
				if updated {
					if _, err := db.Exec("UPDATE trips SET trip_headsign='Updated' WHERE rowid=7"); err != nil {
						t.Fatal(err)
					}
					want[1].values["trip_headsign"] = "Updated"
				}
				var got []member
				err := ForGroupFields(ctx, groupField, []string{"trip_headsign", "absent"}, func(row *services.SQLiteRow, fields map[string]string) error {
					got = append(got, member{row.Row, fields})
					return nil
				})
				if err != nil || !reflect.DeepEqual(got, want) {
					t.Fatalf("members = %+v, error %v; want %+v", got, err, want)
				}
			}
			if _, err := db.Exec("UPDATE trips SET " + groupField + "=NULL WHERE rowid=4"); err != nil {
				t.Fatal(err)
			}
			if err := ForGroupFields(ctx, groupField, []string{"trip_headsign"}, func(*services.SQLiteRow, map[string]string) error {
				t.Fatal("empty group must be skipped")
				return nil
			}); err != nil {
				t.Fatal(err)
			}
		})
	}
}
