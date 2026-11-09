package standard_test

import (
	"database/sql"
	"testing"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	i18n "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
	testutil "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
)

func TestFileMissingConditionalMessages(t *testing.T) {
	for _, tc := range []struct {
		name, table, key string
		setup            func(*testing.T, *sql.DB)
	}{
		{"stops_and_locations_missing", "stops", "stops_file_missing.stops_required_when_locations_missing", nil},
		{"both_calendars_missing", "calendar", "calendar_file_missing.calendar_files_required", nil},
		{"both_calendars_missing_reverse", "calendar_dates", "calendar_dates_file_missing.calendar_files_required", nil},
		{"elevator_without_levels", "levels", "levels_file_missing.levels_required_when_elevator", func(t *testing.T, db *sql.DB) {
			addTable(t, db, "pathways", []string{"pathway_mode"}, []int{2}, [][]any{{"5"}})
		}},
		{"translations_without_feed_info", "feed_info", "feed_info_file_missing.feed_info_required_when_translations", func(t *testing.T, db *sql.DB) {
			addTable(t, db, "translations", []string{"translation"}, []int{2}, [][]any{{"value"}})
		}},
		{"translations_with_empty_feed_info", "feed_info", "feed_info_file_missing.feed_info_required_when_translations", func(t *testing.T, db *sql.DB) {
			addTable(t, db, "translations", []string{"translation"}, []int{2}, [][]any{{"value"}})
			addTable(t, db, "feed_info", []string{"feed_lang"}, nil, nil)
		}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			db := emptyDatabase(t)
			if tc.setup != nil {
				tc.setup(t, db)
			}
			check := standardCheck{id: tc.table + "_file_missing", table: tc.table, field: "N/A", run: standard.FileMissing}
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
			assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR, -1)
			if findings[0].Message != i18n.AppTranslator.Get(tc.key) {
				t.Errorf("got %q, want conditional message %q", findings[0].Message, i18n.AppTranslator.Get(tc.key))
			}
		})
	}
}

func TestFileMissingGateOutcomes(t *testing.T) {
	for _, tc := range []struct {
		name, table string
		present     bool
		severity    rules.Severities
		failed      bool
		count       int
	}{
		{"missing", "agency", false, rules.SEVERITY_ERROR, true, 1},
		{"present", "agency", true, rules.SEVERITY_ERROR, false, 0},
		{"ignored_missing_still_blocks_dependents", "agency", false, rules.SEVERITY_IGNORE, true, 0},
		{"unconfigured_missing_still_blocks_dependents", "agency", false, "", true, 0},
		{"forbidden_absent", "agency", false, rules.SEVERITY_FORBIDDEN, false, 0},
		{"forbidden_present", "agency", true, rules.SEVERITY_FORBIDDEN, true, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			db := emptyDatabase(t)
			if tc.present {
				addTable(t, db, tc.table, []string{"unrelated"}, nil, nil)
			}
			check := standardCheck{id: tc.table + "_file_missing", table: tc.table, field: "N/A", run: standard.FileMissing}
			ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: tc.severity})
			if ctx.Failed != tc.failed || ctx.Skipped || len(findings) != tc.count {
				t.Fatalf("incorrect gate result: %+v findings=%+v", ctx, findings)
			}
			if tc.count > 0 {
				assertRows(t, check, ctx, findings, tc.severity, -1)
			}
		})
	}
}

func TestFeedInfoEmptyWithoutTranslationsPasses(t *testing.T) {
	db := fixture(t, "feed_info", []string{"feed_lang"}, nil, nil)
	check := standardCheck{id: "feed_info_file_missing", table: "feed_info", field: "N/A", run: standard.FileMissing}
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR)
	addTable(t, db, "translations", []string{"translation"}, nil, nil)
	ctx, findings = runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR)
}

func TestFileMissingOperationalErrors(t *testing.T) {
	collector := &testutil.Collector{}
	for name, ctx := range map[string]*context.ValidationContext{
		"nil":              nil,
		"database_missing": context.NewRuleContext("agency_file_missing", nil, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector),
		"receiver_missing": context.NewRuleContext("agency_file_missing", emptyDatabase(t), rules.RuleContext{Severity: rules.SEVERITY_ERROR}, nil),
	} {
		t.Run(name, func(t *testing.T) {
			if err := standard.FileMissing(ctx); err == nil {
				t.Fatal("expected context error")
			}
		})
	}
	db := emptyDatabase(t)
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}
	if err := standard.FileMissing(context.NewRuleContext("agency_file_missing", db, rules.RuleContext{Severity: rules.SEVERITY_ERROR}, collector)); err == nil {
		t.Fatal("expected database error")
	}
	if len(collector.Messages) != 0 {
		t.Fatal("operational errors must not emit data findings")
	}
}

func TestFileIntegrityReportsEachIncompatibleTableOnce(t *testing.T) {
	check := namedCheck(t, "file_validation_gtfs_feed_file_presence_and_integrity_rule")
	db := fixture(t, "routes", []string{"network_id"}, []int{2, 5, 8}, [][]any{{"network"}, {"network"}, {nil}})
	addTable(t, db, "networks", []string{"network_id"}, []int{2}, [][]any{{"network"}})
	addTable(t, db, "route_networks", []string{"route_id", "network_id"}, []int{2}, [][]any{{"route", "network"}})
	for range 2 {
		ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_WARNING})
		if !ctx.Failed || ctx.Skipped || len(findings) != 2 {
			t.Fatalf("unexpected integrity result: %+v %+v", ctx, findings)
		}
		for i, file := range []string{"networks.txt", "route_networks.txt"} {
			m := findings[i]
			if m.FileName != file || m.Field != "N/A" || m.RuleID != check.id || m.Severity != rules.SEVERITY_WARNING || !m.SeverityResolved || len(m.Rows) != 0 {
				t.Errorf("incorrect file finding: %+v", m)
			}
		}
	}
	if _, err := db.Exec("DELETE FROM networks"); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec("DELETE FROM route_networks"); err != nil {
		t.Fatal(err)
	}
	ctx, findings := runCheck(t, check, db, rules.RuleContext{Severity: rules.SEVERITY_ERROR})
	assertRows(t, check, ctx, findings, rules.SEVERITY_ERROR)
}
