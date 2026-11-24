package gtfsvalidator_test

import (
	"fmt"
	"math"
	"slices"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/relationship-validations/geometry"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestStopTooFarFromShape(t *testing.T) {
	const schema = `
		CREATE TABLE trips (trip_id TEXT, route_id TEXT, direction_id TEXT, shape_id TEXT);
		CREATE TABLE stop_times (trip_id TEXT, stop_id TEXT);
		CREATE TABLE stops (stop_id TEXT, stop_lat TEXT, stop_lon TEXT);
		CREATE TABLE shapes (shape_id TEXT, shape_pt_lat TEXT, shape_pt_lon TEXT, shape_pt_sequence TEXT);`
	const equator = `
		INSERT INTO shapes VALUES
			('equator', '0.01', '0.01', '10'),
			('equator', '0', '-0.01', '1'),
			('equator', '0', '0.01', '2');`
	const singleTrip = `INSERT INTO trips VALUES ('trip', 'route', '0', 'equator');`

	type violation struct {
		row     int
		message string
	}
	check := func(t *testing.T, setup, limit string, want []violation) {
		t.Helper()
		db := openSQLTestDatabase(t, schema+setup)
		config := types.Rule{RuleID: "stop_too_far_from_shape", Severity: types.SEVERITY_WARNING, Modifiers: types.RuleOptionsModifier{limit}}
		graph, err := rules.NewValidationGraph([]types.Rule{config})
		if err != nil {
			t.Fatal(err)
		}
		results, err := graph.Execute(t.Context(), db, 1)
		if err != nil {
			t.Fatal(err)
		}
		got := results[0]
		wantStatus := types.Passed
		if len(want) > 0 {
			wantStatus = types.Failed
		}
		if got.Status != wantStatus || len(got.Value) != len(want) {
			t.Fatalf("got %+v, want %s with %d findings", got, wantStatus, len(want))
		}
		for i, finding := range got.Value {
			if finding.FileName != "stops.txt" || finding.Field != "stop_id" || finding.Severity != config.Severity ||
				!slices.Equal(finding.Rows, []int{want[i].row}) || !strings.Contains(finding.Message, want[i].message) || !strings.Contains(finding.Description, limit+" meters") {
				t.Errorf("got %+v, want stops.txt row %d with message containing %q", finding, want[i].row, want[i].message)
			}
		}
	}

	t.Run("20 meter boundary and ordered segments", func(t *testing.T) {
		const degreesPerMeter = 180 / (math.Pi * 6371008.8)
		setup := equator + singleTrip + fmt.Sprintf(`
			INSERT INTO stops VALUES
				('inside', '%.17g', '0'), ('boundary', '%.17g', '0'), ('outside', '%.17g', '0'), ('beyond endpoint', '0', '-0.0103');
			INSERT INTO stop_times VALUES ('trip', 'inside'), ('trip', 'boundary'), ('trip', 'outside'), ('trip', 'beyond endpoint');`,
			19.99*degreesPerMeter, 20*degreesPerMeter, 20.01*degreesPerMeter)
		check(t, setup, "20", []violation{{2, `Stop "outside" is 20.010 m`}, {3, `Stop "beyond endpoint" is 33.359 m`}})
		check(t, setup, "25.5", []violation{{3, `Stop "beyond endpoint" is 33.359 m`}})
		check(t, setup, "100", nil)
	})

	t.Run("serving shape and deduplication within each group", func(t *testing.T) {
		check(t, equator+`
			INSERT INTO shapes VALUES ('near', '0.01', '-0.01', '1'), ('near', '0.01', '0.01', '2');
			INSERT INTO trips VALUES
				('out', 'route', '0', 'equator'), ('repeat', 'route', '0', 'equator'),
				('branch', 'route', '0', 'near'), ('in', 'route', '1', 'equator'),
				('other', 'another route', '0', 'equator'), ('nearby', 'route', '1', 'near');
			INSERT INTO stops VALUES ('shared', '0.01', '0'), ('at equator', '0', '0'), ('unserved', '1', '1');
			INSERT INTO stop_times VALUES
				('out', 'shared'), ('out', 'shared'), ('repeat', 'shared'), ('branch', 'shared'),
				('in', 'shared'), ('other', 'shared'), ('nearby', 'shared'), ('out', 'at equator'), ('branch', 'at equator');`, "20",
			[]violation{
				{0, `shape "equator" on route "route" with direction_id 0`},
				{0, `shape "equator" on route "route" with direction_id 1`},
				{0, `shape "equator" on route "another route" with direction_id 0`},
				{1, `shape "near" on route "route" with direction_id 0`},
			})
	})

	t.Run("shape crossing the antimeridian", func(t *testing.T) {
		check(t, singleTrip+`
			INSERT INTO shapes VALUES ('equator', '0', '179.99', '1'), ('equator', '0', '-179.99', '2');
			INSERT INTO stops VALUES ('crossing', '0', '180'), ('opposite', '0', '0');
			INSERT INTO stop_times VALUES ('trip', 'crossing'), ('trip', 'opposite');`, "20", []violation{{1, `Stop "opposite"`}})
	})

	t.Run("missing and malformed inputs", func(t *testing.T) {
		check(t, equator+singleTrip+`
			INSERT INTO trips VALUES
				('missing shape', 'route', '0', 'unknown'), ('bad point', 'route', '0', 'malformed'),
				('bad sequence', 'route', '0', 'unordered'), ('single point', 'route', '0', 'single'),
				('no direction', 'route', NULL, 'equator'), ('bad direction', 'route', '2', 'equator'),
				('blank route', ' ', '0', 'equator'), ('blank shape', 'route', '0', '');
			INSERT INTO shapes VALUES
				('malformed', '0', '0', '1'), ('malformed', 'Inf', '0.01', '2'), ('malformed', '0', '0.01', '3'),
				('unordered', '0', '0', '1'), ('unordered', '0', '0.01', '01'), ('single', '0', '0', '1');
			INSERT INTO stops VALUES ('far', '1', '0'), ('nan', 'NaN', '0'), ('null', NULL, '0'), ('out of range', '0', '181');
			INSERT INTO stop_times VALUES
				('missing shape', 'far'), ('bad point', 'far'), ('bad sequence', 'far'), ('single point', 'far'),
				('no direction', 'far'), ('bad direction', 'far'), ('blank route', 'far'), ('blank shape', 'far'),
				('trip', 'nan'), ('trip', 'null'), ('trip', 'out of range'), ('trip', 'unknown'), ('trip', NULL), ('unknown', 'far');`, "20", nil)
	})

	const farStop = `INSERT INTO stops VALUES ('far', '1', '0'); INSERT INTO stop_times VALUES ('trip', 'far');`
	for _, change := range []string{
		"DROP TABLE shapes",
		"ALTER TABLE trips DROP COLUMN direction_id",
		"ALTER TABLE stop_times DROP COLUMN stop_id",
		"ALTER TABLE stops DROP COLUMN stop_lon",
		"ALTER TABLE shapes DROP COLUMN shape_pt_sequence",
	} {
		t.Run(change, func(t *testing.T) {
			check(t, equator+singleTrip+farStop+change, "20", nil)
		})
	}
}

func TestStopTooFarFromShapeInvalidDistance(t *testing.T) {
	for _, options := range [][]string{nil, {}, {""}, {"-1"}, {"twenty"}, {"NaN"}, {"+Inf"}, {"20", "30"}} {
		passed, findings, err := (geometry.GeometryChecks{}).StopTooFarFromShape(t.Context(), nil, types.Rule{Modifiers: types.RuleOptionsModifier(options)})
		if passed || len(findings) != 0 || err == nil || !strings.Contains(err.Error(), "distance") {
			t.Errorf("options %q gave passed=%t, findings=%v, error=%v", options, passed, findings, err)
		}
	}
}
