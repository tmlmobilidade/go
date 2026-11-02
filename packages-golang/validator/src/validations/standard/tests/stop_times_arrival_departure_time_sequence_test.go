package standard_test

import (
	"database/sql"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestArrivalDepartureTimeSequence(t *testing.T) {
	const id = "stop_times_arrival_departure_time_sequence"
	for _, tc := range []struct {
		name                                                                 string
		previousArrival, previousDeparture, currentArrival, currentDeparture string
		middle, duplicate, badSequence                                       bool
		wantRow                                                              int
	}{
		{name: "Increasing", previousArrival: "10:00:00", currentArrival: "11:00:00"},
		{name: "Equal", previousArrival: "10:00:00", currentArrival: "10:00:00"},
		{name: "Decreasing", previousArrival: "10:00:00", currentArrival: "09:00:00", wantRow: 5},
		{name: "PreviousDeparturePreferred", previousArrival: "09:00:00", previousDeparture: "11:00:00", currentArrival: "10:00:00", wantRow: 5},
		{name: "CurrentArrivalPreferred", previousDeparture: "10:00:00", currentArrival: "09:00:00", currentDeparture: "11:00:00", wantRow: 5},
		{name: "PreviousMalformedDepartureFallback", previousArrival: "10:00:00", previousDeparture: "bad", currentArrival: "09:00:00", wantRow: 5},
		{name: "CurrentMissingArrivalFallback", previousArrival: "10:00:00", currentDeparture: "09:00:00", wantRow: 5},
		{name: "CurrentMalformedArrivalFallback", previousArrival: "10:00:00", currentArrival: "bad", currentDeparture: "09:00:00", wantRow: 5},
		{name: "AfterMidnight", previousDeparture: "24:00:00", currentArrival: "25:00:00"},
		{name: "AfterMidnightDecreasing", previousDeparture: "25:00:00", currentArrival: "24:00:00", wantRow: 5},
		{name: "MissingPreviousTimes", currentArrival: "09:00:00"},
		{name: "InvalidPreviousTimes", previousArrival: "bad", previousDeparture: "bad", currentArrival: "09:00:00"},
		{name: "MissingCurrentTimes", previousArrival: "10:00:00"},
		{name: "InvalidCurrentTimes", previousArrival: "10:00:00", currentArrival: "bad", currentDeparture: "bad"},
		{name: "UntimedMiddleIsBarrier", previousArrival: "10:00:00", currentArrival: "09:00:00", middle: true},
		{name: "InvalidSequenceSkipped", previousArrival: "10:00:00", currentArrival: "09:00:00", badSequence: true},
		{name: "DuplicateSequenceUsesSourceOrder", previousArrival: "09:00:00", currentArrival: "10:00:00", duplicate: true, wantRow: 9},
	} {
		for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO, types.SEVERITY_IGNORE, types.SEVERITY_FORBIDDEN} {
			t.Run(tc.name+"/"+string(severity), func(t *testing.T) {
				config := validationutils.StopTimesConfig(id, severity)
				sequence := "10"
				if tc.duplicate {
					sequence = "0"
				}
				if tc.badSequence {
					sequence = "bad"
				}
				_, ctx := validationutils.StopTimesFixture(t, map[string]any{
					"trip_id": "O'Brien", "stop_sequence": sequence, "arrival_time": tc.currentArrival, "departure_time": tc.currentDeparture,
				}, config, func(db *sql.DB) {
					_, err := db.Exec("INSERT INTO stop_times (rowid,trip_id,stop_sequence,arrival_time,departure_time) VALUES (8,?,?,?,?)", "O'Brien", "0", tc.previousArrival, tc.previousDeparture)
					if err != nil {
						t.Fatal(err)
					}
					if tc.middle {
						if _, err := db.Exec("INSERT INTO stop_times (rowid,trip_id,stop_sequence) VALUES (12,?,?)", "O'Brien", "5"); err != nil {
							t.Fatal(err)
						}
					}
					if _, err := db.Exec("INSERT INTO stop_times (rowid,trip_id,stop_sequence,arrival_time) VALUES (20,'other','5','01:00:00')"); err != nil {
						t.Fatal(err)
					}
				})
				if err := standard.ArrivalDepartureTimeSequence(ctx, config.Rule("stop_times_arrival_departure_time_sequence")); err != nil {
					t.Fatal(err)
				}
				count := uint64(0)
				if tc.wantRow > 0 && severity != types.SEVERITY_IGNORE && severity != types.SEVERITY_FORBIDDEN {
					count = 1
				}
				if got := services.AppMessageService.RuleIssueCount(id); got != count {
					t.Fatalf("count=%d want=%d", got, count)
				}
				messages := services.AppMessageService.GetSummary().AllMessages()
				if len(messages) != int(count) {
					t.Fatalf("messages=%+v", messages)
				}
				for _, message := range messages {
					if message.RuleID != id || message.Field != "arrival_time" || message.FileName != "stop_times.txt" || message.Severity != severity || len(message.Rows) != 1 || message.Rows[0] != tc.wantRow {
						t.Fatalf("unexpected finding: %+v", message)
					}
				}
				if severity == types.SEVERITY_INFO {
					summary := services.AppMessageService.GetSummary()
					if summary.TotalErrors != 0 || summary.TotalWarnings != 0 {
						t.Fatal("info changed totals")
					}
				}
			})
		}
	}
	validationutils.StopTimesCheckCases(t, id, "arrival_time", standard.ArrivalDepartureTimeSequence, []validationutils.StopTimesCase{
		{Name: "SingleStop", Values: map[string]any{"trip_id": "T1", "stop_sequence": "0", "arrival_time": "10:00:00"}},
	})
}
