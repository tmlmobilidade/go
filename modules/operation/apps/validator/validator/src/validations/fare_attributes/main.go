package fare_attributes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/fare_attributes/validations"
)

func init() {
	registry.Register("fare_attributes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.FareAttributesRules
	if rules != nil {
		section = &rules.FareAttributes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Fare Attributes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "fare_attributes", config.ProgressThresholdSmall)

	err := gtfs.IterateFareAttributes(func(i int, rawFareAttributes types.FareAttributeRaw) error {
		tracker.Track()
		fareAttribute := ParseFareAttributes(rawFareAttributes, i)

		if fareAttribute == (types.FareAttribute{}) {
			return nil
		}

		var fareAttributesRules *types.FareAttributesRules
		if rules != nil {
			fareAttributesRules = &rules.FareAttributes
		}

		// Validate fare_id
		runner.Run(services.RuleActions{
			"fare_attributes_id_unique":                        func() { validations.FareIdValidation(&fareAttribute, i, &gtfs) },
			"fare_price_valid_non_negative_decimal": func() { validations.PriceValidation(&fareAttribute, i) },
			"fare_attributes_currency_type_valid":                   func() { validations.CurrencyTypeValidation(&fareAttribute, i) },
			"fare_attributes_payment_method_valid_gtfs_enum":        func() { validations.PaymentMethodValidation(&fareAttribute, i) },
			"fare_attributes_transfers_valid_gtfs_enum":             func() { validations.TransfersValidation(&fareAttribute, i, &gtfs) },
			"fare_attributes_agency_id_references_agency_table":     func() { validations.AgencyIdValidation(&fareAttribute, i, &gtfs, fareAttributesRules) },
			"fare_attributes_transfer_duration_valid_seconds_range": func() { validations.TransferDurationValidation(&fareAttribute, i, &gtfs, fareAttributesRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating fare attributes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_attributes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
