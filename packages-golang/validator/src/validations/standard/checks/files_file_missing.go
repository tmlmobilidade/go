package standard

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/i18n"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"slices"
)

// FileMissing is one DAG action per <table>_file_missing rule. Generic and
// conditional requirements share a findings context to avoid duplicate notices.
func FileMissing(v *validationutils.Findings, gtfs types.Gtfs, rules *types.GtfsRules, table string) {
	file := table + ".txt"
	severity := ruleset.FileSeverity(rules, table)
	if rules == nil && slices.Contains([]string{"agency", "routes", "trips", "stop_times"}, table) {
		severity = types.SEVERITY_ERROR
	}
	if !gtfs.HasTable(table) {
		switch severity {
		case types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_INFO:
			v.AddMissingFile(file, i18n.AppTranslator.Get("file_missing.message", file), severity)
		}
	}
	// Standalone runs retain conditional GTFS requirements. Configured runs own
	// their severity, including Ignore for omitted rules.
	if rules == nil {
		severity = types.SEVERITY_ERROR
	}
	switch table {
	case "stops":
		if !gtfs.HasTable("locations") && !gtfs.HasTable("stops") {
			v.AddMissingFile(file, i18n.AppTranslator.Get("stops_file_missing.stops_required_when_locations_missing"), severity)
		}
	case "calendar", "calendar_dates":
		if !gtfs.HasTable("calendar") && !gtfs.HasTable("calendar_dates") && (table == "calendar" || rules != nil) {
			v.AddMissingFile(file, i18n.AppTranslator.Get(table+"_file_missing.calendar_files_required"), severity)
		}
	case "levels":
		count, err := gtfs.GetTableCount("pathways")
		if err != nil || count == 0 {
			return
		}
		err = gtfs.IteratePathways(func(_ int, pathway types.PathwaysRaw) error {
			if pathway.PathwayMode == "5" && !gtfs.HasTable("levels") {
				return fmt.Errorf("levels required")
			}
			return nil
		})
		if err != nil && err.Error() == "levels required" {
			v.AddMissingFile(file, i18n.AppTranslator.Get("levels_file_missing.levels_required_when_elevator"), severity)
		}
	case "feed_info":
		translations, err := gtfs.GetTableCount("translations")
		if err != nil || translations == 0 {
			return
		}
		count, err := gtfs.GetTableCount("feed_info")
		if err != nil || count == 0 {
			v.AddMissingFile(file, i18n.AppTranslator.Get("feed_info_file_missing.feed_info_required_when_translations"), severity)
		}
	}
}
