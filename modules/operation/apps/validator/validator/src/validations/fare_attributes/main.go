package fare_attributes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	fare_attributes_fields "main/validations/fare_attributes/fields/checks"
	fare_attributes_standard "main/validations/fare_attributes/standard/checks"
)

func init() {
	registry.RegisterWithTables("fare_attributes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for fare_attributes.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "fare_attributes", config.ProgressThresholdSmall)

	//
	// Get file rules

	var fileRules *types.FareAttributesRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.FareAttributes
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared fare_attributes table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over fare_attributes table

	err = tables.ForEachRow("fare_attributes", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "fare_attributes.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			// Fields
			"fare_attributes_fare_id_field": func() { check("fare_attributes_fare_id_field", fare_attributes_fields.FareIdField(db, fileRules)) },
			"fare_attributes_price_field":   func() { check("fare_attributes_price_field", fare_attributes_fields.PriceField(db, fileRules)) },
			"fare_attributes_currency_type_field": func() {
				check("fare_attributes_currency_type_field", fare_attributes_fields.CurrencyTypeField(db, fileRules))
			},
			"fare_attributes_payment_method_field": func() {
				check("fare_attributes_payment_method_field", fare_attributes_fields.PaymentMethodField(db, fileRules))
			},
			"fare_attributes_transfers_field": func() { check("fare_attributes_transfers_field", fare_attributes_fields.TransfersField(db, fileRules)) },
			"fare_attributes_agency_id_field": func() { check("fare_attributes_agency_id_field", fare_attributes_fields.AgencyIdField(db, fileRules)) },
			"fare_attributes_transfer_duration_field": func() {
				check("fare_attributes_transfer_duration_field", fare_attributes_fields.TransferDurationField(db, fileRules))
			},
			// Standard
			"fare_attributes_id_unique": func() { check("fare_attributes_id_unique", fare_attributes_standard.FareIdUnique(db, fileRules)) },
			"fare_price_valid_non_negative_decimal": func() {
				check("fare_price_valid_non_negative_decimal", fare_attributes_standard.PriceValid(db, fileRules))
			},
			"fare_attributes_currency_type_valid": func() {
				check("fare_attributes_currency_type_valid", fare_attributes_standard.CurrencyTypeValid(db, fileRules))
			},
			"fare_attributes_payment_method_valid_gtfs_enum": func() {
				check("fare_attributes_payment_method_valid_gtfs_enum", fare_attributes_standard.PaymentMethodValid(db, fileRules))
			},
			"fare_attributes_transfers_valid_gtfs_enum": func() {
				check("fare_attributes_transfers_valid_gtfs_enum", fare_attributes_standard.TransfersValid(db, fileRules))
			},
			"fare_attributes_agency_id_references_agency_table": func() {
				check("fare_attributes_agency_id_references_agency_table", fare_attributes_standard.AgencyIdForeign(db, fileRules))
			},
			"fare_attributes_transfer_duration_valid_seconds_range": func() {
				check("fare_attributes_transfer_duration_valid_seconds_range", fare_attributes_standard.TransferDurationValid(db, fileRules))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_attributes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
