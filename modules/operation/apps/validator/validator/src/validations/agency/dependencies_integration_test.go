package agency_test

import (
	"archive/zip"
	"main/lib/rules"
	"main/services"
	"main/types"
	"main/validations/agency"
	"os"
	"path/filepath"
	"testing"
)

func TestAgencyDependencyDAGWithSQLiteFeed(t *testing.T) {
	services.AppMessageService.Clear()
	feed := filepath.Join(t.TempDir(), "feed.zip")
	f, err := os.Create(feed)
	if err != nil {
		t.Fatal(err)
	}
	w := zip.NewWriter(f)
	file, err := w.Create("agency.txt")
	if err != nil {
		t.Fatal(err)
	}
	_, err = file.Write([]byte("agency_id,agency_name,agency_url,agency_timezone\n1,Bad,https://example.com,Europe/Lisbon\n2,Bad,https://example.com,Europe/Lisbon\n3,Good,https://example.com,Europe/Lisbon\n"))
	if err != nil {
		t.Fatal(err)
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
	if err := f.Close(); err != nil {
		t.Fatal(err)
	}
	gtfs, err := services.ReadGTFSZip(feed)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { gtfs.Close(); os.Remove(gtfs.DBPath()) })
	config := rules.DefaultConfig()
	config.Agency.AgencyId.Severity = types.SEVERITY_ERROR
	config.Agency.AgencyName.Severity = types.SEVERITY_WARNING
	config.Agency.AgencyName.Options = &[]string{"Good"}
	config.Agency.AgencyNameIdMatch.Severity = types.SEVERITY_ERROR
	config.Agency.AgencyNameIdMatch.Compare = &[]types.Compare{{Key: "3", Value: "Expected"}}
	rules.ConfigureMessageSeverities(&config)
	t.Cleanup(func() { rules.ConfigureMessageSeverities(nil); services.AppMessageService.Clear() })
	agency.RunValidations(gtfs, &config)
	summary := services.AppMessageService.GetSummary()
	if summary.TotalWarnings != 1 || summary.TotalErrors != 1 {
		t.Fatalf("summary: %+v", summary)
	}
	for _, message := range summary.Messages {
		switch message.RuleID {
		case "agency_name_present":
			if len(message.Rows) != 2 || message.Rows[0] != 2 || message.Rows[1] != 3 {
				t.Fatalf("warning rows: %+v", message)
			}
		case "agency_id_matched_with_agency_name":
			if len(message.Rows) != 1 || message.Rows[0] != 4 {
				t.Fatalf("dependent ran on invalid row: %+v", message)
			}
		default:
			t.Fatalf("unexpected notice: %+v", message)
		}
	}
}
