package validations

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	rulegraph "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	custom "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/custom/checks"
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"strings"
	"sync"
)

func init() {
	Register("afetacao", RunAfetacaoValidations)
	RegisterWithTables("agency", RunAgencyValidations)
	Register("archives", RunArchivesValidations)
	Register("areas", RunAreasValidations)
	Register("attributions", RunAttributionsValidations)
	Register("booking_rules", RunBookingRulesValidations)
	RegisterWithTables("calendar", RunCalendarValidations)
	RegisterWithTables("calendar_dates", RunCalendarDatesValidations)
	RegisterWithTables("fare_attributes", RunFareAttributesValidations)
	Register("fare_leg_join_rules", RunFareLegJoinRulesValidations)
	Register("fare_leg_rules", RunFareLegRulesValidations)
	Register("fare_products", RunFareProductsValidations)
	RegisterWithTables("fare_rules", RunFareRulesValidations)
	Register("fare_transfer_rules", RunFareTransferRulesValidations)
	Register("feed_info", RunFeedInfoValidations)
	RegisterWithTables("frequencies", RunFrequenciesValidations)
	RegisterWithTables("levels", RunLevelsValidations)
	Register("location_group_stops", RunLocationGroupStopsValidations)
	Register("location_groups", RunLocationGroupsValidations)
	Register("municipalities", RunMunicipalitiesValidations)
	Register("networks", RunNetworksValidations)
	RegisterWithTables("pathways", RunPathwaysValidations)
	Register("periods", RunPeriodsValidations)
	RegisterWithTables("rider_categories", RunRiderCategoriesValidations)
	Register("route_networks", RunRouteNetworksValidations)
	RegisterWithTables("routes", RunRoutesValidations)
	RegisterWithTables("shapes", RunShapesValidations)
	Register("stop_areas", RunStopAreasValidations)
	RegisterWithTables("stop_times", RunStopTimesValidations)
	RegisterWithTables("stops", RunStopsValidations)
	Register("timeframes", RunTimeframesValidations)
	RegisterWithTables("transfers", RunTransfersValidations)
	Register("translations", RunTranslationsValidations)
	RegisterWithTables("trips", RunTripsValidations)
	RegisterWithTables("vehicles", RunVehiclesValidations)
}

func RunAfetacaoValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Afetacao Validations...")
}

func RunAgencyValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for agency.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "agency", config.ProgressThresholdSmall)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "agency")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared agency table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over agency table

	err = tables.ForEachRow("agency", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "agency.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"agency_id_field": func() { check("agency_id_field", fields.AgencyAgencyIdField(db, gtfsRules.Rule("agency_id_field"))) },
			"agency_name_field": func() {
				check("agency_name_field", fields.AgencyNameField(db, gtfsRules.Rule("agency_name_field")))
			},
			"agency_url_field": func() {
				check("agency_url_field", fields.AgencyUrlField(db, gtfsRules.Rule("agency_url_field")))
			},
			"agency_timezone_field": func() {
				check("agency_timezone_field", fields.AgencyTimezoneField(db, gtfsRules.Rule("agency_timezone_field")))
			},
			"agency_lang_field": func() {
				check("agency_lang_field", fields.AgencyLangField(db, gtfsRules.Rule("agency_lang_field")))
			},
			"agency_phone_field": func() {
				check("agency_phone_field", fields.AgencyPhoneField(db, gtfsRules.Rule("agency_phone_field")))
			},
			"agency_fare_url_field": func() {
				check("agency_fare_url_field", fields.AgencyFareUrlField(db, gtfsRules.Rule("agency_fare_url_field")))
			},
			"agency_email_field": func() {
				check("agency_email_field", fields.AgencyEmailField(db, gtfsRules.Rule("agency_email_field")))
			},

			//
			// Standard
			"agency_email_valid": func() {
				check("agency_email_valid", standard.AgencyEmailValid(db, gtfsRules.Rule("agency_email_valid")))
			},
			"agency_id_valid": func() { check("agency_id_valid", standard.AgencyIdValid(db, gtfsRules.Rule("agency_id_valid"))) },
			"agency_id_unique": func() {
				check("agency_id_unique", standard.AgencyAgencyIdUnique(db, gtfsRules.Rule("agency_id_unique")))
			},
			"agency_name_valid": func() {
				check("agency_name_valid", standard.AgencyNameValid(db, gtfsRules.Rule("agency_name_valid")))
			},
			"agency_url_valid": func() {
				check("agency_url_valid", standard.AgencyUrlValid(db, gtfsRules.Rule("agency_url_valid")))
			},
			"agency_timezone_valid": func() {
				check("agency_timezone_valid", standard.AgencyTimezoneValid(db, gtfsRules.Rule("agency_timezone_valid")))
			},
			"agency_lang_valid": func() {
				check("agency_lang_valid", standard.AgencyLangValid(db, gtfsRules.Rule("agency_lang_valid")))
			},
			"agency_phone_valid": func() {
				check("agency_phone_valid", standard.AgencyPhoneValid(db, gtfsRules.Rule("agency_phone_valid")))
			},
			"agency_fare_url_valid": func() {
				check("agency_fare_url_valid", standard.AgencyFareUrlValid(db, gtfsRules.Rule("agency_fare_url_valid")))
			},

			//
			// Custom
			"agency_id_matched_with_agency_name": func() {
				check("agency_id_matched_with_agency_name", custom.AgencyNameIdMatch(db, gtfsRules.Rule("agency_id_matched_with_agency_name")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed agency.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunArchivesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Archives Validations...")
}

func RunAreasValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Areas Validations...")
}

func RunAttributionsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Attributions Validations...")
}

func RunBookingRulesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Booking Rules Validations...")
}

func RunCalendarValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for calendar.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "calendar", config.ProgressThresholdSmall)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "calendar")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared calendar table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}
	table, err := tables.Table("calendar")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening calendar table: %v", err))
		return
	}

	//
	// Iterate over calendar table

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"calendar_service_id_field": func() {
				check("calendar_service_id_field", fields.ServiceIdValidation(db, gtfsRules.Rule("calendar_service_id_field")))
			},
			"calendar_start_date_field": func() {
				check("calendar_start_date_field", fields.StartDateValidation(db, gtfsRules.Rule("calendar_start_date_field")))
			},
			"calendar_end_date_field": func() {
				check("calendar_end_date_field", fields.EndDateValidation(db, gtfsRules.Rule("calendar_end_date_field")))
			},
			"calendar_monday_field": func() {
				check("calendar_monday_field", fields.MondayValidation(db, gtfsRules.Rule("calendar_monday_field")))
			},
			"calendar_tuesday_field": func() {
				check("calendar_tuesday_field", fields.TuesdayValidation(db, gtfsRules.Rule("calendar_tuesday_field")))
			},
			"calendar_wednesday_field": func() {
				check("calendar_wednesday_field", fields.WednesdayValidation(db, gtfsRules.Rule("calendar_wednesday_field")))
			},
			"calendar_thursday_field": func() {
				check("calendar_thursday_field", fields.ThursdayValidation(db, gtfsRules.Rule("calendar_thursday_field")))
			},
			"calendar_friday_field": func() {
				check("calendar_friday_field", fields.FridayValidation(db, gtfsRules.Rule("calendar_friday_field")))
			},
			"calendar_saturday_field": func() {
				check("calendar_saturday_field", fields.SaturdayValidation(db, gtfsRules.Rule("calendar_saturday_field")))
			},
			"calendar_sunday_field": func() {
				check("calendar_sunday_field", fields.SundayValidation(db, gtfsRules.Rule("calendar_sunday_field")))
			},

			//
			// Standard
			"calendar_service_id_unique": func() {
				check("calendar_service_id_unique", standard.ServiceIdUnique(db, gtfsRules.Rule("calendar_service_id_unique")))
			},
			"calendar_start_end_dates_valid_format": func() {
				check("calendar_start_end_dates_valid_format", standard.DateValidFormat(db, gtfsRules.Rule("calendar_start_end_dates_valid_format")))
			},
			"calendar_start_end_dates_valid": func() {
				check("calendar_start_end_dates_valid", standard.CalendarDateValid(db, gtfsRules.Rule("calendar_start_end_dates_valid")))
			},
			"calendar_monday_valid": func() {
				check("calendar_monday_valid", standard.MondayValid(db, gtfsRules.Rule("calendar_monday_valid")))
			},
			"calendar_tuesday_valid": func() {
				check("calendar_tuesday_valid", standard.TuesdayValid(db, gtfsRules.Rule("calendar_tuesday_valid")))
			},
			"calendar_wednesday_valid": func() {
				check("calendar_wednesday_valid", standard.WednesdayValid(db, gtfsRules.Rule("calendar_wednesday_valid")))
			},
			"calendar_thursday_valid": func() {
				check("calendar_thursday_valid", standard.ThursdayValid(db, gtfsRules.Rule("calendar_thursday_valid")))
			},
			"calendar_friday_valid": func() {
				check("calendar_friday_valid", standard.FridayValid(db, gtfsRules.Rule("calendar_friday_valid")))
			},
			"calendar_saturday_valid": func() {
				check("calendar_saturday_valid", standard.SaturdayValid(db, gtfsRules.Rule("calendar_saturday_valid")))
			},
			"calendar_sunday_valid": func() {
				check("calendar_sunday_valid", standard.SundayValid(db, gtfsRules.Rule("calendar_sunday_valid")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendars: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunCalendarDatesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "calendar_dates")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Calendar Dates Validations...")

	//
	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar_dates", config.ProgressThresholdSmall)

	//
	// Open the GTFS tables

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over the calendar_dates table

	err = tables.ForEachRow("calendar_dates", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "calendar_dates.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"calendar_dates_date_field": func() {
				check("calendar_dates_date_field", fields.DateField(db, rules.Rule("calendar_dates_date_field")))
			},
			"calendar_dates_exception_type_field": func() {
				check("calendar_dates_exception_type_field", fields.ExceptionTypeField(db, rules.Rule("calendar_dates_exception_type_field")))
			},
			"calendar_dates_service_id_field": func() {
				check("calendar_dates_service_id_field", fields.CalendarDatesServiceIdField(db, rules.Rule("calendar_dates_service_id_field")))
			},

			//
			// Standard
			"calendar_dates_date_valid": func() {
				check("calendar_dates_date_valid", standard.CalendarDatesDateValid(db, rules.Rule("calendar_dates_date_valid")))
			},
			"calendar_dates_exception_type_valid": func() {
				check("calendar_dates_exception_type_valid", standard.ExceptionTypeValid(db, rules.Rule("calendar_dates_exception_type_valid")))
			},
			"calendar_dates_service_id_foreign": func() {
				check("calendar_dates_service_id_foreign", standard.CalendarDatesServiceIdForeign(db, rules.Rule("calendar_dates_service_id_foreign")))
			},
		}, nil)

		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendar dates: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar_dates.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunFareAttributesValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for fare_attributes.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "fare_attributes", config.ProgressThresholdSmall)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "fare_attributes")
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
			"fare_attributes_fare_id_field": func() {
				check("fare_attributes_fare_id_field", fields.FareAttributesFareIdField(db, gtfsRules.Rule("fare_attributes_fare_id_field")))
			},
			"fare_attributes_price_field": func() {
				check("fare_attributes_price_field", fields.PriceField(db, gtfsRules.Rule("fare_attributes_price_field")))
			},
			"fare_attributes_currency_type_field": func() {
				check("fare_attributes_currency_type_field", fields.CurrencyTypeField(db, gtfsRules.Rule("fare_attributes_currency_type_field")))
			},
			"fare_attributes_payment_method_field": func() {
				check("fare_attributes_payment_method_field", fields.PaymentMethodField(db, gtfsRules.Rule("fare_attributes_payment_method_field")))
			},
			"fare_attributes_transfers_field": func() {
				check("fare_attributes_transfers_field", fields.TransfersField(db, gtfsRules.Rule("fare_attributes_transfers_field")))
			},
			"fare_attributes_agency_id_field": func() {
				check("fare_attributes_agency_id_field", fields.FareAttributesAgencyIdField(db, gtfsRules.Rule("fare_attributes_agency_id_field")))
			},
			"fare_attributes_transfer_duration_field": func() {
				check("fare_attributes_transfer_duration_field", fields.TransferDurationField(db, gtfsRules.Rule("fare_attributes_transfer_duration_field")))
			},
			// Standard
			"fare_attributes_fare_id_unique": func() {
				check("fare_attributes_fare_id_unique", standard.FareIdUnique(db, gtfsRules.Rule("fare_attributes_fare_id_unique")))
			},
			"fare_attributes_price_valid": func() {
				check("fare_attributes_price_valid", standard.PriceValid(db, gtfsRules.Rule("fare_attributes_price_valid")))
			},
			"fare_attributes_currency_type_valid": func() {
				check("fare_attributes_currency_type_valid", standard.CurrencyTypeValid(db, gtfsRules.Rule("fare_attributes_currency_type_valid")))
			},
			"fare_attributes_payment_method_valid": func() {
				check("fare_attributes_payment_method_valid", standard.PaymentMethodValid(db, gtfsRules.Rule("fare_attributes_payment_method_valid")))
			},
			"fare_attributes_transfers_valid": func() {
				check("fare_attributes_transfers_valid", standard.TransfersValid(db, gtfsRules.Rule("fare_attributes_transfers_valid")))
			},
			"fare_attributes_agency_id_foreign": func() {
				check("fare_attributes_agency_id_foreign", standard.FareAttributesAgencyIdForeign(db, gtfsRules.Rule("fare_attributes_agency_id_foreign")))
			},
			"fare_attributes_transfer_duration_valid": func() {
				check("fare_attributes_transfer_duration_valid", standard.TransferDurationValid(db, gtfsRules.Rule("fare_attributes_transfer_duration_valid")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating agencies: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed fare_attributes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunFareLegJoinRulesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareLegJoinRules Validations...")
}

func RunFareLegRulesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareLegRules Validations...")
}

func RunFareProductsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareProducts Validations...")
}

func RunFareRulesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "fare_rules")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "fare_rules", config.ProgressThresholdSmall)
	err = tables.ForEachRow("fare_rules", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "fare_rules.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"fare_rules_fare_id_field": func() {
				check("fare_rules_fare_id_field", fields.FareRulesFareIdField(db, rules.Rule("fare_rules_fare_id_field")))
			},
			"fare_rules_route_id_field": func() {
				check("fare_rules_route_id_field", fields.FareRulesRouteIdField(db, rules.Rule("fare_rules_route_id_field")))
			},
			"fare_rules_origin_id_field": func() {
				check("fare_rules_origin_id_field", fields.OriginIdField(db, rules.Rule("fare_rules_origin_id_field")))
			},
			"fare_rules_destination_id_field": func() {
				check("fare_rules_destination_id_field", fields.DestinationIdField(db, rules.Rule("fare_rules_destination_id_field")))
			},
			"fare_rules_contains_id_field": func() {
				check("fare_rules_contains_id_field", fields.ContainsIdField(db, rules.Rule("fare_rules_contains_id_field")))
			},
			"fare_rules_fare_id_foreign": func() {
				check("fare_rules_fare_id_foreign", standard.FareIdForeign(db, rules.Rule("fare_rules_fare_id_foreign")))
			},
			"fare_rules_route_id_foreign": func() {
				check("fare_rules_route_id_foreign", standard.FareRulesRouteIdForeign(db, rules.Rule("fare_rules_route_id_foreign")))
			},
			"fare_rules_origin_id_foreign": func() {
				check("fare_rules_origin_id_foreign", standard.OriginIdForeign(db, rules.Rule("fare_rules_origin_id_foreign")))
			},
			"fare_rules_destination_id_foreign": func() {
				check("fare_rules_destination_id_foreign", standard.DestinationIdForeign(db, rules.Rule("fare_rules_destination_id_foreign")))
			},
			"fare_rules_contains_id_foreign": func() {
				check("fare_rules_contains_id_foreign", standard.ContainsIdForeign(db, rules.Rule("fare_rules_contains_id_foreign")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating fare_rules: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed fare_rules.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunFareTransferRulesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running FareTransferRules Validations...")
}

func RunFeedInfoValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules) {
	runner, dagErr := services.NewRuleRunner(gtfs, gtfsRules, "feed_info")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running FeedInfo Validations...")

	//
	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "feed_info", config.ProgressThresholdSmall)

	//
	// Select the prepared GTFS tables

	tables, err := services.ValidationTables(gtfs.DB())
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Iterate over the feed_info table

	err = tables.ForEachRow("feed_info", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"feed_info_default_lang_field": func() {
				check("feed_info_default_lang_field", fields.DefaultLangField(db, gtfsRules.Rule("feed_info_default_lang_field")))
			},
			"feed_info_feed_lang_field": func() {
				check("feed_info_feed_lang_field", fields.FeedLangField(db, gtfsRules.Rule("feed_info_feed_lang_field")))
			},
			"feed_info_feed_publisher_name_field": func() {
				check("feed_info_feed_publisher_name_field", fields.FeedPublisherNameField(db, gtfsRules.Rule("feed_info_feed_publisher_name_field")))
			},
			"feed_info_feed_publisher_url_field": func() {
				check("feed_info_feed_publisher_url_field", fields.FeedPublisherUrlField(db, gtfsRules.Rule("feed_info_feed_publisher_url_field")))
			},
			"feed_info_feed_contact_email_field": func() {
				check("feed_info_feed_contact_email_field", fields.FeedContactEmailField(db, gtfsRules.Rule("feed_info_feed_contact_email_field")))
			},
			"feed_info_feed_contact_url_field": func() {
				check("feed_info_feed_contact_url_field", fields.FeedContactUrlField(db, gtfsRules.Rule("feed_info_feed_contact_url_field")))
			},
			"feed_info_feed_end_date_field": func() {
				check("feed_info_feed_end_date_field", fields.FeedEndDateField(db, gtfsRules.Rule("feed_info_feed_end_date_field")))
			},
			"feed_info_feed_start_date_field": func() {
				check("feed_info_feed_start_date_field", fields.FeedStartDateField(db, gtfsRules.Rule("feed_info_feed_start_date_field")))
			},
			"feed_info_feed_version_field": func() {
				check("feed_info_feed_version_field", fields.FeedVersionField(db, gtfsRules.Rule("feed_info_feed_version_field")))
			},

			//
			// Standard
			"feed_info_default_lang_valid": func() {
				check("feed_info_default_lang_valid", standard.DefaultLangValid(db, gtfsRules.Rule("feed_info_default_lang_valid")))
			},
			"feed_info_feed_contact_email_valid": func() {
				check("feed_info_feed_contact_email_valid", standard.FeedContactEmailValid(db, gtfsRules.Rule("feed_info_feed_contact_email_valid")))
			},
			"feed_info_feed_contact_url_valid": func() {
				check("feed_info_feed_contact_url_valid", standard.FeedContactUrlValid(db, gtfsRules.Rule("feed_info_feed_contact_url_valid")))
			},
			"feed_info_feed_lang_valid": func() {
				check("feed_info_feed_lang_valid", standard.FeedLangValid(db, gtfsRules.Rule("feed_info_feed_lang_valid")))
			},
			"feed_info_feed_publisher_url_valid": func() {
				check("feed_info_feed_publisher_url_valid", standard.FeedPublisherUrlValid(db, gtfsRules.Rule("feed_info_feed_publisher_url_valid")))
			},
			"feed_info_feed_end_date_format": func() {
				check("feed_info_feed_end_date_format", standard.FeedEndDateFormat(db, gtfsRules.Rule("feed_info_feed_end_date_format")))
			},
			"feed_info_feed_start_date_format": func() {
				check("feed_info_feed_start_date_format", standard.FeedStartDateFormat(db, gtfsRules.Rule("feed_info_feed_start_date_format")))
			},
			"feed_info_start_end_dates_valid": func() {
				check("feed_info_start_end_dates_valid", standard.FeedStartEndDateValid(db, gtfsRules.Rule("feed_info_start_end_dates_valid")))
			},
		}, nil)
		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating feed info: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed feed_info.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

type FileValidation struct{ *types.Validation }

func NewFileValidation() *FileValidation {
	return &FileValidation{Validation: &types.Validation{ID: "file_validation", Description: "Validate file data"}}
}

// Validate runs the feed-level DAG once. Table validators separately seed their
// row DAGs from actual table presence, so a missing file cannot block other files.
func (v *FileValidation) Validate(gtfs types.Gtfs, config *types.GtfsRules) bool {
	initialErrors := services.AppMessageService.TotalErrors()
	findings := &validationutils.Findings{}
	nodes := []rulegraph.Rule[struct{}]{}
	bind := func(id string, action func()) {
		nodes = append(nodes, rulegraph.Rule[struct{}]{ID: id, DependsOn: config.Rule(id).DependsOn, Run: func(struct{}) rulegraph.Status {
			before := services.AppMessageService.RuleIssueCount(id)
			action()
			if services.AppMessageService.RuleIssueCount(id) != before {
				return rulegraph.Failed
			}
			// Presence prerequisites follow the actual database, including when
			// the missing-file diagnostic is configured as Ignore.
			if table, presence := strings.CutSuffix(id, "_file_missing"); presence && !gtfs.HasTable(table) {
				return rulegraph.Failed
			}
			return rulegraph.Passed
		}})
	}
	bind(types.RuleIDGtfsFeedFilePresenceAndIntegrity, func() { standard.FilePresenceAndIntegrity(findings, gtfs, config) })
	for _, table := range types.GtfsRuleFiles {
		bind(table+"_file_missing", func() { standard.FileMissing(findings, gtfs, config, table) })
	}
	manager, err := rulegraph.NewManager(nodes...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return true
	}
	manager.RunRow(struct{}{})
	return services.AppMessageService.TotalErrors() > initialErrors
}

func RunFrequenciesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "frequencies")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "frequencies", config.ProgressThresholdSmall)
	err = tables.ForEachRow("frequencies", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "frequencies.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"frequencies_trip_id_field": func() {
				check("frequencies_trip_id_field", fields.FrequenciesTripIdField(db, rules.Rule("frequencies_trip_id_field")))
			},
			"frequencies_exact_times_field": func() {
				check("frequencies_exact_times_field", fields.ExactTimesField(db, rules.Rule("frequencies_exact_times_field")))
			},
			"frequencies_headway_secs_field": func() {
				check("frequencies_headway_secs_field", fields.HeadwaySecsField(db, rules.Rule("frequencies_headway_secs_field")))
			},
			"frequencies_end_time_field": func() {
				check("frequencies_end_time_field", fields.EndTimeField(db, rules.Rule("frequencies_end_time_field")))
			},
			"frequencies_start_time_field": func() {
				check("frequencies_start_time_field", fields.StartTimeField(db, rules.Rule("frequencies_start_time_field")))
			},
			"frequencies_trip_id_foreign": func() {
				check("frequencies_trip_id_foreign", standard.FrequenciesTripIdForeign(db, rules.Rule("frequencies_trip_id_foreign")))
			},
			"frequencies_exact_times_valid": func() {
				check("frequencies_exact_times_valid", standard.ExactTimesValid(db, rules.Rule("frequencies_exact_times_valid")))
			},
			"frequencies_headway_secs_valid": func() {
				check("frequencies_headway_secs_valid", standard.HeadwaySecsValid(db, rules.Rule("frequencies_headway_secs_valid")))
			},
			"frequencies_end_time_valid": func() {
				check("frequencies_end_time_valid", standard.EndTimeValid(db, rules.Rule("frequencies_end_time_valid")))
			},
			"frequencies_start_time_valid": func() {
				check("frequencies_start_time_valid", standard.StartTimeValid(db, rules.Rule("frequencies_start_time_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating frequencies: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed frequencies.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunLevelsValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "levels")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "levels", config.ProgressThresholdLarge)
	err = tables.ForEachRow("levels", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "levels.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"levels_level_id_field": func() {
				check("levels_level_id_field", fields.LevelsLevelIdField(db, rules.Rule("levels_level_id_field")))
			},
			"levels_level_index_field": func() {
				check("levels_level_index_field", fields.LevelIndexField(db, rules.Rule("levels_level_index_field")))
			},
			"levels_level_name_field": func() {
				check("levels_level_name_field", fields.LevelNameField(db, rules.Rule("levels_level_name_field")))
			},
			"levels_level_id_unique": func() {
				check("levels_level_id_unique", standard.LevelIdUnique(db, rules.Rule("levels_level_id_unique")))
			},
			"levels_level_index_valid": func() {
				check("levels_level_index_valid", standard.LevelIndexValid(db, rules.Rule("levels_level_index_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating levels: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed levels.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunLocationGroupStopsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running LocationGroupStops Validations...")
}

func RunLocationGroupsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running LocationGroups Validations...")
}

func RunMunicipalitiesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Municipalities Validations...")
}

func RunNetworksValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Networks Validations...")
}

func RunPathwaysValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "pathways")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "pathways", config.ProgressThresholdLarge)
	err = tables.ForEachRow("pathways", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "pathways.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"pathways_max_slope_field": func() {
				check("pathways_max_slope_field", fields.MaxSlopeField(db, rules.Rule("pathways_max_slope_field")))
			},
			"pathways_traversal_time_field": func() {
				check("pathways_traversal_time_field", fields.TraversalTimeField(db, rules.Rule("pathways_traversal_time_field")))
			},
			"pathways_to_stop_id_field": func() {
				check("pathways_to_stop_id_field", fields.PathwaysToStopIdField(db, rules.Rule("pathways_to_stop_id_field")))
			},
			"pathways_length_field": func() {
				check("pathways_length_field", fields.LengthField(db, rules.Rule("pathways_length_field")))
			},
			"pathways_min_width_field": func() {
				check("pathways_min_width_field", fields.MinWidthField(db, rules.Rule("pathways_min_width_field")))
			},
			"pathways_reversed_signposted_as_field": func() {
				check("pathways_reversed_signposted_as_field", fields.ReversedSignpostedAsField(db, rules.Rule("pathways_reversed_signposted_as_field")))
			},
			"pathways_stair_count_field": func() {
				check("pathways_stair_count_field", fields.StairCountField(db, rules.Rule("pathways_stair_count_field")))
			},
			"pathways_from_stop_id_field": func() {
				check("pathways_from_stop_id_field", fields.PathwaysFromStopIdField(db, rules.Rule("pathways_from_stop_id_field")))
			},
			"pathways_pathway_id_field": func() {
				check("pathways_pathway_id_field", fields.PathwayIdField(db, rules.Rule("pathways_pathway_id_field")))
			},
			"pathways_is_bidirectional_field": func() {
				check("pathways_is_bidirectional_field", fields.IsBidirectionalField(db, rules.Rule("pathways_is_bidirectional_field")))
			},
			"pathways_signposted_as_field": func() {
				check("pathways_signposted_as_field", fields.SignpostedAsField(db, rules.Rule("pathways_signposted_as_field")))
			},
			"pathways_pathway_mode_field": func() {
				check("pathways_pathway_mode_field", fields.PathwayModeField(db, rules.Rule("pathways_pathway_mode_field")))
			},
			"pathways_max_slope_valid": func() {
				check("pathways_max_slope_valid", standard.MaxSlopeValid(db, rules.Rule("pathways_max_slope_valid")))
			},
			"pathways_traversal_time_valid": func() {
				check("pathways_traversal_time_valid", standard.TraversalTimeValid(db, rules.Rule("pathways_traversal_time_valid")))
			},
			"pathways_to_stop_id_foreign": func() {
				check("pathways_to_stop_id_foreign", standard.PathwaysToStopIdForeign(db, rules.Rule("pathways_to_stop_id_foreign")))
			},
			"pathways_length_valid": func() {
				check("pathways_length_valid", standard.LengthValid(db, rules.Rule("pathways_length_valid")))
			},
			"pathways_min_width_valid": func() {
				check("pathways_min_width_valid", standard.MinWidthValid(db, rules.Rule("pathways_min_width_valid")))
			},
			"pathways_stair_count_valid": func() {
				check("pathways_stair_count_valid", standard.StairCountValid(db, rules.Rule("pathways_stair_count_valid")))
			},
			"pathways_from_stop_id_foreign": func() {
				check("pathways_from_stop_id_foreign", standard.PathwaysFromStopIdForeign(db, rules.Rule("pathways_from_stop_id_foreign")))
			},
			"pathways_pathway_id_unique": func() {
				check("pathways_pathway_id_unique", standard.PathwayIdUnique(db, rules.Rule("pathways_pathway_id_unique")))
			},
			"pathways_is_bidirectional_valid": func() {
				check("pathways_is_bidirectional_valid", standard.IsBidirectionalValid(db, rules.Rule("pathways_is_bidirectional_valid")))
			},
			"pathways_pathway_mode_valid": func() {
				check("pathways_pathway_mode_valid", standard.PathwayModeValid(db, rules.Rule("pathways_pathway_mode_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating pathways: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed pathways.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunPeriodsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Periods Validations...")
}

// ValidationFunction is the signature for a validation function
type ValidationFunction func(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables)

// Registry holds all registered validations
type Registry struct {
	validations map[string]ValidationFunction
	mu          sync.RWMutex
}

var globalRegistry = &Registry{
	validations: make(map[string]ValidationFunction),
}

// Register registers a validation function for a table name
func Register(tableName string, fn func(types.Gtfs, *types.GtfsRules)) {
	RegisterWithTables(tableName, func(gtfs types.Gtfs, rules *types.GtfsRules, _ ...*services.SQLiteTables) {
		fn(gtfs, rules)
	})
}

// RegisterWithTables registers validators that share the prepared table collection.
func RegisterWithTables(tableName string, fn ValidationFunction) {
	globalRegistry.mu.Lock()
	defer globalRegistry.mu.Unlock()
	globalRegistry.validations[tableName] = fn
}

// Get retrieves a validation function for a table name
func Get(tableName string) (ValidationFunction, bool) {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	fn, ok := globalRegistry.validations[tableName]
	return fn, ok
}

// GetAll returns all registered validations
func GetAll() map[string]ValidationFunction {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	result := make(map[string]ValidationFunction)
	for k, v := range globalRegistry.validations {
		result[k] = v
	}
	return result
}

// GetRegisteredTables returns a list of all registered table names
func GetRegisteredTables() []string {
	globalRegistry.mu.RLock()
	defer globalRegistry.mu.RUnlock()
	tables := make([]string, 0, len(globalRegistry.validations))
	for table := range globalRegistry.validations {
		tables = append(tables, table)
	}
	return tables
}

func RunRiderCategoriesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "rider_categories")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "rider_categories", config.ProgressThresholdLarge)
	err = tables.ForEachRow("rider_categories", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "rider_categories.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"rider_categories_rider_category_id_field": func() {
				check("rider_categories_rider_category_id_field", fields.RiderCategoryIdField(db, rules.Rule("rider_categories_rider_category_id_field")))
			},
			"rider_categories_rider_category_name_field": func() {
				check("rider_categories_rider_category_name_field", fields.RiderCategoryNameField(db, rules.Rule("rider_categories_rider_category_name_field")))
			},
			"rider_categories_is_default_fare_category_field": func() {
				check("rider_categories_is_default_fare_category_field", fields.IsDefaultFareCategoryField(db, rules.Rule("rider_categories_is_default_fare_category_field")))
			},
			"rider_categories_eligibility_url_field": func() {
				check("rider_categories_eligibility_url_field", fields.EligibilityUrlField(db, rules.Rule("rider_categories_eligibility_url_field")))
			},
			"rider_categories_rider_category_id_unique": func() {
				check("rider_categories_rider_category_id_unique", standard.RiderCategoryIdUnique(db, rules.Rule("rider_categories_rider_category_id_unique")))
			},
			"rider_categories_is_default_fare_category_valid": func() {
				check("rider_categories_is_default_fare_category_valid", standard.IsDefaultFareCategoryValid(db, rules.Rule("rider_categories_is_default_fare_category_valid")))
			},
			"rider_categories_eligibility_url_valid": func() {
				check("rider_categories_eligibility_url_valid", standard.EligibilityUrlValid(db, rules.Rule("rider_categories_eligibility_url_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating rider_categories: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed rider_categories.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunRouteNetworksValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running RouteNetworks Validations...")
}

func RunRoutesValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for routes.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "routes", config.ProgressThresholdLarge)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "routes")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared routes table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Prepare pickup/drop-off window lookups once for all route rows

	routesWithWindows, err := validationutils.RoutesWithWindows(tables)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing routes with pickup/drop-off windows: %v", err))
		return
	}

	//
	// Iterate over routes table

	err = tables.ForEachRow("routes", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "routes.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"routes_agency_id_field": func() {
				check("routes_agency_id_field", fields.RoutesAgencyIdField(db, gtfsRules.Rule("routes_agency_id_field")))
			},
			"routes_continuous_drop_off_field": func() {
				check("routes_continuous_drop_off_field", fields.RoutesContinuousDropOffField(db, gtfsRules.Rule("routes_continuous_drop_off_field")))
			},
			"routes_continuous_pickup_field": func() {
				check("routes_continuous_pickup_field", fields.RoutesContinuousPickupField(db, gtfsRules.Rule("routes_continuous_pickup_field")))
			},
			"routes_line_id_field": func() {
				check("routes_line_id_field", fields.LineIdField(db, gtfsRules.Rule("routes_line_id_field")))
			},
			"routes_line_long_name_field": func() {
				check("routes_line_long_name_field", fields.LineLongNameField(db, gtfsRules.Rule("routes_line_long_name_field")))
			},
			"routes_line_short_name_field": func() {
				check("routes_line_short_name_field", fields.LineShortNameField(db, gtfsRules.Rule("routes_line_short_name_field")))
			},
			"routes_network_id_field": func() {
				check("routes_network_id_field", fields.NetworkIdField(db, gtfsRules.Rule("routes_network_id_field")))
			},
			"routes_path_type_field": func() {
				check("routes_path_type_field", fields.PathTypeField(db, gtfsRules.Rule("routes_path_type_field")))
			},
			"routes_route_color_field": func() {
				check("routes_route_color_field", fields.RouteColorField(db, gtfsRules.Rule("routes_route_color_field")))
			},
			"routes_route_desc_field": func() {
				check("routes_route_desc_field", fields.RouteDescField(db, gtfsRules.Rule("routes_route_desc_field")))
			},
			"routes_route_id_field": func() {
				check("routes_route_id_field", fields.RoutesRouteIdField(db, gtfsRules.Rule("routes_route_id_field")))
			},
			"routes_route_long_name_field": func() {
				check("routes_route_long_name_field", fields.RouteLongNameField(db, gtfsRules.Rule("routes_route_long_name_field")))
			},
			"routes_route_short_name_field": func() {
				check("routes_route_short_name_field", fields.RouteShortNameField(db, gtfsRules.Rule("routes_route_short_name_field")))
			},
			"routes_route_sort_order_field": func() {
				check("routes_route_sort_order_field", fields.RouteSortOrderField(db, gtfsRules.Rule("routes_route_sort_order_field")))
			},
			"routes_route_text_color_field": func() {
				check("routes_route_text_color_field", fields.RouteTextColorField(db, gtfsRules.Rule("routes_route_text_color_field")))
			},
			"routes_route_type_field": func() {
				check("routes_route_type_field", fields.RouteTypeField(db, gtfsRules.Rule("routes_route_type_field")))
			},
			"routes_route_url_field": func() {
				check("routes_route_url_field", fields.RouteUrlField(db, gtfsRules.Rule("routes_route_url_field")))
			},

			//
			// Standard
			"routes_agency_id_foreign": func() {
				check("routes_agency_id_foreign", standard.RoutesAgencyIdUnique(db, gtfsRules.Rule("routes_agency_id_foreign")))
			},
			"routes_continuous_drop_off_valid": func() {
				check("routes_continuous_drop_off_valid", standard.RoutesContinuousDropOffValid(db, gtfsRules.Rule("routes_continuous_drop_off_valid"), routesWithWindows))
			},
			"routes_continuous_pickup_valid": func() {
				check("routes_continuous_pickup_valid", standard.RoutesContinuousPickupValid(db, gtfsRules.Rule("routes_continuous_pickup_valid"), routesWithWindows))
			},
			"routes_network_id_foreign": func() {
				check("routes_network_id_foreign", standard.NetworkIdForeign(db, gtfsRules.Rule("routes_network_id_foreign")))
			},
			"routes_route_color_valid": func() {
				check("routes_route_color_valid", standard.RouteColorValid(db, gtfsRules.Rule("routes_route_color_valid")))
			},
			"routes_route_id_unique": func() {
				check("routes_route_id_unique", standard.RouteIdUnique(db, gtfsRules.Rule("routes_route_id_unique")))
			},
			"routes_route_sort_order_valid": func() {
				check("routes_route_sort_order_valid", standard.RouteSortOrderValid(db, gtfsRules.Rule("routes_route_sort_order_valid")))
			},
			"routes_route_text_color_valid": func() {
				check("routes_route_text_color_valid", standard.RouteTextColorValid(db, gtfsRules.Rule("routes_route_text_color_valid")))
			},
			"routes_route_type_valid": func() {
				check("routes_route_type_valid", standard.RouteTypeValid(db, gtfsRules.Rule("routes_route_type_valid")))
			},
			"routes_route_url_different_from_agency_url": func() {
				check("routes_route_url_different_from_agency_url", standard.RouteUrlDifferentAgencyUrl(db, gtfsRules.Rule("routes_route_url_different_from_agency_url")))
			},
			"routes_route_url_valid": func() {
				check("routes_route_url_valid", standard.RouteUrlValid(db, gtfsRules.Rule("routes_route_url_valid")))
			},

			//
			// Custom
			"routes_line_id_equal_route_short_name": func() {
				check("routes_line_id_equal_route_short_name", custom.LineIdEqualRouteShortName(db, gtfsRules.Rule("routes_line_id_equal_route_short_name")))
			},
			"routes_line_short_name_equal_route_short_name": func() {
				check("routes_line_short_name_equal_route_short_name", custom.LineShortNameEqualRouteShortName(db, gtfsRules.Rule("routes_line_short_name_equal_route_short_name")))
			},
			"routes_path_type_valid": func() {
				check("routes_path_type_valid", custom.PathTypeValid(db, gtfsRules.Rule("routes_path_type_valid")))
			},
			"routes_route_id_format": func() {
				check("routes_route_id_format", custom.RouteIdFormat(db, gtfsRules.Rule("routes_route_id_format")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating routes: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed routes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunShapesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "shapes")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("shapes")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "shapes.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running Shapes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "shapes", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "shape", "shape_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			//
			// Fields
			"shapes_shape_id_field": func() {
				check(db, "shapes_shape_id_field", fields.ShapesShapeIdField(db, rules.Rule("shapes_shape_id_field")))
			},
			"shapes_shape_pt_lat_field": func() {
				check(db, "shapes_shape_pt_lat_field", fields.ShapePtLatField(db, rules.Rule("shapes_shape_pt_lat_field")))
			},
			"shapes_shape_pt_lon_field": func() {
				check(db, "shapes_shape_pt_lon_field", fields.ShapePtLonField(db, rules.Rule("shapes_shape_pt_lon_field")))
			},
			"shapes_shape_pt_sequence_field": func() {
				check(db, "shapes_shape_pt_sequence_field", fields.ShapePtSequenceField(db, rules.Rule("shapes_shape_pt_sequence_field")))
			},
			"shapes_shape_dist_traveled_field": func() {
				check(db, "shapes_shape_dist_traveled_field", fields.ShapesShapeDistTraveledField(db, rules.Rule("shapes_shape_dist_traveled_field")))
			},

			//
			// Standard
			"shapes_shape_pt_lat_valid": func() {
				check(db, "shapes_shape_pt_lat_valid", standard.ShapePtLatValid(db, rules.Rule("shapes_shape_pt_lat_valid")))
			},
			"shapes_shape_pt_lon_valid": func() {
				check(db, "shapes_shape_pt_lon_valid", standard.ShapePtLonValid(db, rules.Rule("shapes_shape_pt_lon_valid")))
			},
			"shapes_shape_pt_sequence_non_negative": func() {
				check(db, "shapes_shape_pt_sequence_non_negative", standard.ShapePtSequence(db, rules.Rule("shapes_shape_pt_sequence_non_negative")))
			},
			"shapes_shape_dist_traveled_valid": func() {
				check(db, "shapes_shape_dist_traveled_valid", standard.ShapesShapeDistTraveledValid(db, rules.Rule("shapes_shape_dist_traveled_valid")))
			},
			"shape_pt_sequence_strictly_increasing": func() {
				check(db, "shape_pt_sequence_strictly_increasing", standard.ShapePtSequenceStrictlyIncreasing(db, rules.Rule("shape_pt_sequence_strictly_increasing")))
			},
			"shape_dist_traveled_non_decreasing_with_sequence": func() {
				check(db, "shape_dist_traveled_non_decreasing_with_sequence", standard.ShapeDistTraveledNonDecreasing(db, rules.Rule("shape_dist_traveled_non_decreasing_with_sequence")))
			},

			//
			// Custom
			"shapes_shape_point_spacing_valid": func() {
				check(db, "shapes_shape_point_spacing_valid", custom.ShapePointsCoordinatesConsistent(db, rules.Rule("shapes_shape_point_spacing_valid")))
			},
			"shapes_shape_dist_traveled_segment_valid": func() {
				check(db, "shapes_shape_dist_traveled_segment_valid", custom.ShapePointsCoordinatesDistances(db, rules.Rule("shapes_shape_dist_traveled_segment_valid")))
			},
			"shapes_shape_dist_traveled_block_valid": func() {
				check(db, "shapes_shape_dist_traveled_block_valid", custom.ShapeDistancesValid(db, rules.Rule("shapes_shape_dist_traveled_block_valid")))
			},
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating shapes: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed shapes.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunStopAreasValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running StopAreas Validations...")
}

func RunStopTimesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "stop_times")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("stop_times")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running StopTimes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "stop_times", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "trip", "trip_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			//
			// Fields
			"stop_times_arrival_time_field": func() {
				check(db, "stop_times_arrival_time_field", fields.ArrivalTimeField(db, rules.Rule("stop_times_arrival_time_field")))
			},
			"stop_times_continuous_drop_off_field": func() {
				check(db, "stop_times_continuous_drop_off_field", fields.StopTimesContinuousDropOffField(db, rules.Rule("stop_times_continuous_drop_off_field")))
			},
			"stop_times_continuous_pickup_field": func() {
				check(db, "stop_times_continuous_pickup_field", fields.StopTimesContinuousPickupField(db, rules.Rule("stop_times_continuous_pickup_field")))
			},
			"stop_times_departure_time_field": func() {
				check(db, "stop_times_departure_time_field", fields.DepartureTimeField(db, rules.Rule("stop_times_departure_time_field")))
			},
			"stop_times_drop_off_booking_rule_id_field": func() {
				check(db, "stop_times_drop_off_booking_rule_id_field", fields.DropOffBookingRuleIdField(db, rules.Rule("stop_times_drop_off_booking_rule_id_field")))
			},
			"stop_times_drop_off_type_field": func() {
				check(db, "stop_times_drop_off_type_field", fields.DropOffTypeField(db, rules.Rule("stop_times_drop_off_type_field")))
			},
			"stop_times_end_pickup_drop_off_window_field": func() {
				check(db, "stop_times_end_pickup_drop_off_window_field", fields.EndPickupDropOffWindowField(db, rules.Rule("stop_times_end_pickup_drop_off_window_field")))
			},
			"stop_times_location_group_id_field": func() {
				check(db, "stop_times_location_group_id_field", fields.LocationGroupIdField(db, rules.Rule("stop_times_location_group_id_field")))
			},
			"stop_times_pickup_booking_rule_id_field": func() {
				check(db, "stop_times_pickup_booking_rule_id_field", fields.PickupBookingRuleIdField(db, rules.Rule("stop_times_pickup_booking_rule_id_field")))
			},
			"stop_times_pickup_type_field": func() {
				check(db, "stop_times_pickup_type_field", fields.PickupTypeField(db, rules.Rule("stop_times_pickup_type_field")))
			},
			"stop_times_shape_dist_traveled_field": func() {
				check(db, "stop_times_shape_dist_traveled_field", fields.StopTimesShapeDistTraveledField(db, rules.Rule("stop_times_shape_dist_traveled_field")))
			},
			"stop_times_start_pickup_drop_off_window_field": func() {
				check(db, "stop_times_start_pickup_drop_off_window_field", fields.StartPickupDropOffWindowField(db, rules.Rule("stop_times_start_pickup_drop_off_window_field")))
			},
			"stop_times_stop_headsign_field": func() {
				check(db, "stop_times_stop_headsign_field", fields.StopHeadsignField(db, rules.Rule("stop_times_stop_headsign_field")))
			},
			"stop_times_stop_id_field": func() {
				check(db, "stop_times_stop_id_field", fields.StopTimesStopIdField(db, rules.Rule("stop_times_stop_id_field")))
			},
			"stop_times_timepoint_field": func() {
				check(db, "stop_times_timepoint_field", fields.TimepointField(db, rules.Rule("stop_times_timepoint_field")))
			},
			"stop_times_trip_id_field": func() {
				check(db, "stop_times_trip_id_field", fields.StopTimesTripIdField(db, rules.Rule("stop_times_trip_id_field")))
			},

			//
			// Standard
			"stop_times_arrival_departure_time_sequence": func() {
				check(db, "stop_times_arrival_departure_time_sequence", standard.ArrivalDepartureTimeSequence(db, rules.Rule("stop_times_arrival_departure_time_sequence")))
			},
			"stop_times_arrival_time_valid": func() {
				check(db, "stop_times_arrival_time_valid", standard.ArrivalTimeValid(db, rules.Rule("stop_times_arrival_time_valid")))
			},
			"stop_times_continuous_drop_off_valid_gtfs_enum": func() {
				check(db, "stop_times_continuous_drop_off_valid_gtfs_enum", standard.StopTimesContinuousDropOffValid(db, rules.Rule("stop_times_continuous_drop_off_valid_gtfs_enum")))
			},
			"stop_times_continuous_pickup_valid_gtfs_enum": func() {
				check(db, "stop_times_continuous_pickup_valid_gtfs_enum", standard.StopTimesContinuousPickupValid(db, rules.Rule("stop_times_continuous_pickup_valid_gtfs_enum")))
			},
			"stop_times_departure_time_valid": func() {
				check(db, "stop_times_departure_time_valid", standard.DepartureTimeValid(db, rules.Rule("stop_times_departure_time_valid")))
			},
			"stop_times_drop_off_booking_rule_id_foreign": func() {
				check(db, "stop_times_drop_off_booking_rule_id_foreign", standard.DropOffBookingRuleIdForeign(db, rules.Rule("stop_times_drop_off_booking_rule_id_foreign")))
			},
			"stop_times_drop_off_type_valid": func() {
				check(db, "stop_times_drop_off_type_valid", standard.DropOffTypeValid(db, rules.Rule("stop_times_drop_off_type_valid")))
			},
			"stop_times_end_pickup_drop_off_window_valid": func() {
				check(db, "stop_times_end_pickup_drop_off_window_valid", standard.EndPickupDropOffWindowValid(db, rules.Rule("stop_times_end_pickup_drop_off_window_valid")))
			},
			"stop_times_location_group_id_forbidden": func() {
				check(db, "stop_times_location_group_id_forbidden", standard.LocationGroupIdForbidden(db, rules.Rule("stop_times_location_group_id_forbidden")))
			},
			"stop_times_location_id_forbidden": func() {
				check(db, "stop_times_location_id_forbidden", standard.LocationIdForbidden(db, rules.Rule("stop_times_location_id_forbidden")))
			},
			"stop_times_pickup_booking_rule_id_foreign": func() {
				check(db, "stop_times_pickup_booking_rule_id_foreign", standard.PickupBookingRuleIdForeign(db, rules.Rule("stop_times_pickup_booking_rule_id_foreign")))
			},
			"stop_times_pickup_type_valid": func() {
				check(db, "stop_times_pickup_type_valid", standard.PickupTypeValid(db, rules.Rule("stop_times_pickup_type_valid")))
			},
			"stop_times_shape_dist_traveled_valid": func() {
				check(db, "stop_times_shape_dist_traveled_valid", standard.StopTimesShapeDistTraveledValid(db, rules.Rule("stop_times_shape_dist_traveled_valid")))
			},
			"stop_times_start_pickup_drop_off_window_valid": func() {
				check(db, "stop_times_start_pickup_drop_off_window_valid", standard.StartPickupDropOffWindowValid(db, rules.Rule("stop_times_start_pickup_drop_off_window_valid")))
			},
			"stop_times_stop_id_foreign": func() {
				check(db, "stop_times_stop_id_foreign", standard.StopIdForeign(db, rules.Rule("stop_times_stop_id_foreign")))
			},
			"stop_times_timepoint_valid": func() {
				check(db, "stop_times_timepoint_valid", standard.TimepointValid(db, rules.Rule("stop_times_timepoint_valid")))
			},
			"stop_times_trip_id_foreign": func() {
				check(db, "stop_times_trip_id_foreign", standard.StopTimesTripIdForeign(db, rules.Rule("stop_times_trip_id_foreign")))
			},
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating stop_times: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed stop_times.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunStopsValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for stops.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "stops", config.ProgressThresholdLarge)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "stops")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared stops table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}
	table, err := tables.Table("stops")
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error opening stops table: %v", err))
		return
	}

	//
	// Iterate over stops table

	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "stops.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"stops_stop_id_field": func() {
				check("stops_stop_id_field", fields.StopsStopIdField(db, gtfsRules.Rule("stops_stop_id_field")))
			},
			"stops_stop_code_field": func() {
				check("stops_stop_code_field", fields.StopCodeField(db, gtfsRules.Rule("stops_stop_code_field")))
			},
			"stops_stop_name_field": func() {
				check("stops_stop_name_field", fields.StopNameField(db, gtfsRules.Rule("stops_stop_name_field")))
			},
			"stops_tts_stop_name_field": func() {
				check("stops_tts_stop_name_field", fields.TtsStopNameField(db, gtfsRules.Rule("stops_tts_stop_name_field")))
			},
			"stops_stop_desc_field": func() {
				check("stops_stop_desc_field", fields.StopDescField(db, gtfsRules.Rule("stops_stop_desc_field")))
			},
			"stops_stop_lat_field": func() {
				check("stops_stop_lat_field", fields.StopLatField(db, gtfsRules.Rule("stops_stop_lat_field")))
			},
			"stops_stop_lon_field": func() {
				check("stops_stop_lon_field", fields.StopLonField(db, gtfsRules.Rule("stops_stop_lon_field")))
			},
			"stops_zone_id_field": func() {
				check("stops_zone_id_field", fields.ZoneIdField(db, gtfsRules.Rule("stops_zone_id_field")))
			},
			"stops_stop_url_field": func() {
				check("stops_stop_url_field", fields.StopUrlField(db, gtfsRules.Rule("stops_stop_url_field")))
			},
			"stops_location_type_field": func() {
				check("stops_location_type_field", fields.LocationTypeField(db, gtfsRules.Rule("stops_location_type_field")))
			},
			"stops_parent_station_field": func() {
				check("stops_parent_station_field", fields.ParentStationField(db, gtfsRules.Rule("stops_parent_station_field")))
			},
			"stops_stop_timezone_field": func() {
				check("stops_stop_timezone_field", fields.StopTimezoneField(db, gtfsRules.Rule("stops_stop_timezone_field")))
			},
			"stops_wheelchair_boarding_field": func() {
				check("stops_wheelchair_boarding_field", fields.WheelchairBoardingField(db, gtfsRules.Rule("stops_wheelchair_boarding_field")))
			},
			"stops_level_id_field": func() {
				check("stops_level_id_field", fields.StopsLevelIdField(db, gtfsRules.Rule("stops_level_id_field")))
			},
			"stops_platform_code_field": func() {
				check("stops_platform_code_field", fields.PlatformCodeField(db, gtfsRules.Rule("stops_platform_code_field")))
			},
			"stops_stop_access_field": func() {
				check("stops_stop_access_field", fields.StopAccessField(db, gtfsRules.Rule("stops_stop_access_field")))
			},
			"stops_stop_short_name_field": func() {
				check("stops_stop_short_name_field", fields.StopShortNameField(db, gtfsRules.Rule("stops_stop_short_name_field")))
			},
			"stops_region_id_field": func() {
				check("stops_region_id_field", fields.RegionIdField(db, gtfsRules.Rule("stops_region_id_field")))
			},
			"stops_municipality_id_field": func() {
				check("stops_municipality_id_field", fields.MunicipalityIdField(db, gtfsRules.Rule("stops_municipality_id_field")))
			},
			"stops_parish_id_field": func() {
				check("stops_parish_id_field", fields.ParishIdField(db, gtfsRules.Rule("stops_parish_id_field")))
			},
			"stops_public_visible_field": func() {
				check("stops_public_visible_field", fields.PublicVisibleField(db, gtfsRules.Rule("stops_public_visible_field")))
			},
			"stops_shelter_code_field": func() {
				check("stops_shelter_code_field", fields.ShelterCodeField(db, gtfsRules.Rule("stops_shelter_code_field")))
			},
			"stops_shelter_maintainer_field": func() {
				check("stops_shelter_maintainer_field", fields.ShelterMaintainerField(db, gtfsRules.Rule("stops_shelter_maintainer_field")))
			},
			"stops_has_bench_field": func() {
				check("stops_has_bench_field", fields.HasBenchField(db, gtfsRules.Rule("stops_has_bench_field")))
			},
			"stops_has_network_map_field": func() {
				check("stops_has_network_map_field", fields.HasNetworkMapField(db, gtfsRules.Rule("stops_has_network_map_field")))
			},
			"stops_has_pip_real_time_field": func() {
				check("stops_has_pip_real_time_field", fields.HasPipRealTimeField(db, gtfsRules.Rule("stops_has_pip_real_time_field")))
			},
			"stops_has_schedules_field": func() {
				check("stops_has_schedules_field", fields.HasSchedulesField(db, gtfsRules.Rule("stops_has_schedules_field")))
			},
			"stops_has_shelter_field": func() {
				check("stops_has_shelter_field", fields.HasShelterField(db, gtfsRules.Rule("stops_has_shelter_field")))
			},
			"stops_has_stop_sign_field": func() {
				check("stops_has_stop_sign_field", fields.HasStopSignField(db, gtfsRules.Rule("stops_has_stop_sign_field")))
			},
			"stops_has_tariffs_information_field": func() {
				check("stops_has_tariffs_information_field", fields.HasTariffsInformationField(db, gtfsRules.Rule("stops_has_tariffs_information_field")))
			},

			//
			// Standard
			"stops_stop_id_unique": func() {
				check("stops_stop_id_unique", standard.StopIdUnique(db, gtfsRules.Rule("stops_stop_id_unique")))
			},
			"stops_stop_code_unique": func() {
				check("stops_stop_code_unique", standard.StopCodeUnique(db, gtfsRules.Rule("stops_stop_code_unique")))
			},
			"stops_stop_desc_different_stop_name": func() {
				check("stops_stop_desc_different_stop_name", standard.StopDescDifferentStopName(db, gtfsRules.Rule("stops_stop_desc_different_stop_name")))
			},
			"stops_stop_lat_valid": func() {
				check("stops_stop_lat_valid", standard.StopLatValid(db, gtfsRules.Rule("stops_stop_lat_valid")))
			},
			"stops_stop_lon_valid": func() {
				check("stops_stop_lon_valid", standard.StopLonValid(db, gtfsRules.Rule("stops_stop_lon_valid")))
			},
			"stops_stop_url_valid": func() {
				check("stops_stop_url_valid", standard.StopUrlValid(db, gtfsRules.Rule("stops_stop_url_valid")))
			},
			"stops_location_type_allowed": func() {
				check("stops_location_type_allowed", standard.LocationTypeAllowed(db, gtfsRules.Rule("stops_location_type_allowed")))
			},
			"stops_location_type_valid": func() {
				check("stops_location_type_valid", standard.LocationTypeValid(db, gtfsRules.Rule("stops_location_type_valid")))
			},
			"stops_parent_station_empty_location_types": func() {
				check("stops_parent_station_empty_location_types", standard.ParentStationEmptyLocationTypes(db, gtfsRules.Rule("stops_parent_station_empty_location_types")))
			},
			"stops_parent_station_for_location_type_one": func() {
				check("stops_parent_station_for_location_type_one", standard.ParentStationForLocationTypeOne(db, gtfsRules.Rule("stops_parent_station_for_location_type_one")))
			},
			"stops_parent_station_foreign": func() {
				check("stops_parent_station_foreign", standard.ParentStationForeign(db, gtfsRules.Rule("stops_parent_station_foreign")))
			},
			"stops_stop_timezone_valid": func() {
				check("stops_stop_timezone_valid", standard.StopTimezoneValid(db, gtfsRules.Rule("stops_stop_timezone_valid")))
			},
			"stops_wheelchair_boarding_allowed": func() {
				check("stops_wheelchair_boarding_allowed", standard.WheelchairBoardingAllowed(db, gtfsRules.Rule("stops_wheelchair_boarding_allowed")))
			},
			"stops_wheelchair_boarding_valid": func() {
				check("stops_wheelchair_boarding_valid", standard.WheelchairBoardingValid(db, gtfsRules.Rule("stops_wheelchair_boarding_valid")))
			},
			"stops_level_id_foreign": func() {
				check("stops_level_id_foreign", standard.LevelIdForeign(db, gtfsRules.Rule("stops_level_id_foreign")))
			},
			"stops_platform_code_allowed": func() {
				check("stops_platform_code_allowed", standard.PlatformCodeAllowed(db, gtfsRules.Rule("stops_platform_code_allowed")))
			},
			"stops_stop_access_differente_location_type_zero": func() {
				check("stops_stop_access_differente_location_type_zero", standard.StopAccessDifferenteLocationTypeZero(db, gtfsRules.Rule("stops_stop_access_differente_location_type_zero")))
			},
			"stops_stop_access_forbidden_parent_station": func() {
				check("stops_stop_access_forbidden_parent_station", standard.StopAccessForbiddenParentStation(db, gtfsRules.Rule("stops_stop_access_forbidden_parent_station")))
			},
			"stops_stop_access_valid": func() {
				check("stops_stop_access_valid", standard.StopAccessValid(db, gtfsRules.Rule("stops_stop_access_valid")))
			},
			"stops_region_id_allowed": func() {
				check("stops_region_id_allowed", standard.RegionIdAllowed(db, gtfsRules.Rule("stops_region_id_allowed")))
			},
			"stops_municipality_id_allowed": func() {
				check("stops_municipality_id_allowed", standard.MunicipalityIdAllowed(db, gtfsRules.Rule("stops_municipality_id_allowed")))
			},
			"stops_parish_id_allowed": func() {
				check("stops_parish_id_allowed", standard.ParishIdAllowed(db, gtfsRules.Rule("stops_parish_id_allowed")))
			},
			"stops_public_visible_valid": func() {
				check("stops_public_visible_valid", standard.PublicVisibleValid(db, gtfsRules.Rule("stops_public_visible_valid")))
			},
			"stops_has_bench_allowed": func() {
				check("stops_has_bench_allowed", standard.HasBenchAllowed(db, gtfsRules.Rule("stops_has_bench_allowed")))
			},
			"stops_has_bench_valid": func() {
				check("stops_has_bench_valid", standard.HasBenchValid(db, gtfsRules.Rule("stops_has_bench_valid")))
			},
			"stops_has_network_map_allowed": func() {
				check("stops_has_network_map_allowed", standard.HasNetworkMapAllowed(db, gtfsRules.Rule("stops_has_network_map_allowed")))
			},
			"stops_has_network_map_valid": func() {
				check("stops_has_network_map_valid", standard.HasNetworkMapValid(db, gtfsRules.Rule("stops_has_network_map_valid")))
			},
			"stops_has_pip_real_time_allowed": func() {
				check("stops_has_pip_real_time_allowed", standard.HasPipRealTimeAllowed(db, gtfsRules.Rule("stops_has_pip_real_time_allowed")))
			},
			"stops_has_pip_real_time_valid": func() {
				check("stops_has_pip_real_time_valid", standard.HasPipRealTimeValid(db, gtfsRules.Rule("stops_has_pip_real_time_valid")))
			},
			"stops_has_schedules_allowed": func() {
				check("stops_has_schedules_allowed", standard.HasSchedulesAllowed(db, gtfsRules.Rule("stops_has_schedules_allowed")))
			},
			"stops_has_schedules_valid": func() {
				check("stops_has_schedules_valid", standard.HasSchedulesValid(db, gtfsRules.Rule("stops_has_schedules_valid")))
			},
			"stops_has_shelter_allowed": func() {
				check("stops_has_shelter_allowed", standard.HasShelterAllowed(db, gtfsRules.Rule("stops_has_shelter_allowed")))
			},
			"stops_has_shelter_valid": func() {
				check("stops_has_shelter_valid", standard.HasShelterValid(db, gtfsRules.Rule("stops_has_shelter_valid")))
			},
			"stops_has_stop_sign_allowed": func() {
				check("stops_has_stop_sign_allowed", standard.HasStopSignAllowed(db, gtfsRules.Rule("stops_has_stop_sign_allowed")))
			},
			"stops_has_stop_sign_valid": func() {
				check("stops_has_stop_sign_valid", standard.HasStopSignValid(db, gtfsRules.Rule("stops_has_stop_sign_valid")))
			},
			"stops_has_tariffs_information_allowed": func() {
				check("stops_has_tariffs_information_allowed", standard.HasTariffsInformationAllowed(db, gtfsRules.Rule("stops_has_tariffs_information_allowed")))
			},
			"stops_has_tariffs_information_valid": func() {
				check("stops_has_tariffs_information_valid", standard.HasTariffsInformationValid(db, gtfsRules.Rule("stops_has_tariffs_information_valid")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stops: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed stops.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}

func RunTimeframesValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running TimeFrames Validations...")
}

func RunTransfersValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "transfers")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "transfers", config.ProgressThresholdLarge)
	err = tables.ForEachRow("transfers", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "transfers.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"transfers_from_stop_id_field": func() {
				check("transfers_from_stop_id_field", fields.TransfersFromStopIdField(db, rules.Rule("transfers_from_stop_id_field")))
			},
			"transfers_to_stop_id_field": func() {
				check("transfers_to_stop_id_field", fields.TransfersToStopIdField(db, rules.Rule("transfers_to_stop_id_field")))
			},
			"transfers_from_route_id_field": func() {
				check("transfers_from_route_id_field", fields.FromRouteIdField(db, rules.Rule("transfers_from_route_id_field")))
			},
			"transfers_to_route_id_field": func() {
				check("transfers_to_route_id_field", fields.ToRouteIdField(db, rules.Rule("transfers_to_route_id_field")))
			},
			"transfers_from_trip_id_field": func() {
				check("transfers_from_trip_id_field", fields.FromTripIdField(db, rules.Rule("transfers_from_trip_id_field")))
			},
			"transfers_to_trip_id_field": func() {
				check("transfers_to_trip_id_field", fields.ToTripIdField(db, rules.Rule("transfers_to_trip_id_field")))
			},
			"transfers_transfer_type_field": func() {
				check("transfers_transfer_type_field", fields.TransferTypeField(db, rules.Rule("transfers_transfer_type_field")))
			},
			"transfers_min_transfer_time_field": func() {
				check("transfers_min_transfer_time_field", fields.MinTransferTimeField(db, rules.Rule("transfers_min_transfer_time_field")))
			},
			"transfers_from_stop_id_foreign": func() {
				check("transfers_from_stop_id_foreign", standard.TransfersFromStopIdForeign(db, rules.Rule("transfers_from_stop_id_foreign")))
			},
			"transfers_from_route_id_foreign": func() {
				check("transfers_from_route_id_foreign", standard.FromRouteIdForeign(db, rules.Rule("transfers_from_route_id_foreign")))
			},
			"transfers_from_trip_id_foreign": func() {
				check("transfers_from_trip_id_foreign", standard.FromTripIdForeign(db, rules.Rule("transfers_from_trip_id_foreign")))
			},
			"transfers_to_stop_id_foreign": func() {
				check("transfers_to_stop_id_foreign", standard.TransfersToStopIdForeign(db, rules.Rule("transfers_to_stop_id_foreign")))
			},
			"transfers_to_route_id_foreign": func() {
				check("transfers_to_route_id_foreign", standard.ToRouteIdForeign(db, rules.Rule("transfers_to_route_id_foreign")))
			},
			"transfers_to_trip_id_foreign": func() {
				check("transfers_to_trip_id_foreign", standard.ToTripIdForeign(db, rules.Rule("transfers_to_trip_id_foreign")))
			},
			"transfers_transfer_type_valid": func() {
				check("transfers_transfer_type_valid", standard.TransferTypeValid(db, rules.Rule("transfers_transfer_type_valid")))
			},
			"transfers_min_transfer_time_valid": func() {
				check("transfers_min_transfer_time_valid", standard.MinTransferTimeValid(db, rules.Rule("transfers_min_transfer_time_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating transfers: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed transfers.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunTranslationsValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Translations Validations...")
}

func RunTripsValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "trips")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("trips")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "trips", config.ProgressThresholdLarge)
	hashes := map[int]string{}
	reported := map[[2]string]bool{}
	geometry := validationutils.Geometry{}

	// One action map owns all row and grouped rules. Configuration orders each
	// phase's prerequisites; grouped phases receive only their own rows' outcomes.
	actions := func(db *services.SQLiteContext, scope string) services.RuleActions {
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "trips.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		all := services.RuleActions{
			"trips_route_id_field": func() {
				check("trips_route_id_field", fields.TripsRouteIdField(db, rules.Rule("trips_route_id_field")))
			},
			"trips_service_id_field": func() {
				check("trips_service_id_field", fields.TripsServiceIdField(db, rules.Rule("trips_service_id_field")))
			},
			"trips_trip_id_field": func() { check("trips_trip_id_field", fields.TripsTripIdField(db, rules.Rule("trips_trip_id_field"))) },
			"trips_trip_headsign_field": func() {
				check("trips_trip_headsign_field", fields.TripHeadsignField(db, rules.Rule("trips_trip_headsign_field")))
			},
			"trips_trip_short_name_field": func() {
				check("trips_trip_short_name_field", fields.TripShortNameField(db, rules.Rule("trips_trip_short_name_field")))
			},
			"trips_direction_id_field": func() {
				check("trips_direction_id_field", fields.DirectionIdField(db, rules.Rule("trips_direction_id_field")))
			},
			"trips_block_id_field": func() {
				check("trips_block_id_field", fields.BlockIdField(db, rules.Rule("trips_block_id_field")))
			},
			"trips_shape_id_field": func() {
				check("trips_shape_id_field", fields.TripsShapeIdField(db, rules.Rule("trips_shape_id_field")))
			},
			"trips_wheelchair_accessible_field": func() {
				check("trips_wheelchair_accessible_field", fields.TripsWheelchairAccessibleField(db, rules.Rule("trips_wheelchair_accessible_field")))
			},
			"trips_bikes_allowed_field": func() {
				check("trips_bikes_allowed_field", fields.BikesAllowedField(db, rules.Rule("trips_bikes_allowed_field")))
			},
			"trips_pattern_id_field": func() {
				check("trips_pattern_id_field", fields.PatternIdField(db, rules.Rule("trips_pattern_id_field")))
			},
			"trips_trip_id_unique": func() {
				check("trips_trip_id_unique", standard.TripIdUnique(db, rules.Rule("trips_trip_id_unique")))
			},
			"trips_route_id_foreign": func() {
				check("trips_route_id_foreign", standard.TripsRouteIdForeign(db, rules.Rule("trips_route_id_foreign")))
			},
			"trips_shape_id_foreign": func() {
				check("trips_shape_id_foreign", standard.ShapeIdForeign(db, rules.Rule("trips_shape_id_foreign")))
			},
			"trips_service_id_foreign": func() {
				check("trips_service_id_foreign", standard.TripsServiceIdForeign(db, rules.Rule("trips_service_id_foreign")))
			},
			"trips_direction_id_valid": func() {
				check("trips_direction_id_valid", standard.DirectionIdValid(db, rules.Rule("trips_direction_id_valid")))
			},
			"trips_bikes_allowed_valid": func() {
				check("trips_bikes_allowed_valid", standard.BikesAllowedValid(db, rules.Rule("trips_bikes_allowed_valid")))
			},
			"trips_wheelchair_accessible_valid": func() {
				check("trips_wheelchair_accessible_valid", standard.TripsWheelchairAccessibleValid(db, rules.Rule("trips_wheelchair_accessible_valid")))
			},
			"trips_trip_id_max_length": func() {
				check("trips_trip_id_max_length", custom.TripIdMaxLength(db, rules.Rule("trips_trip_id_max_length")))
			},
			"trips_pattern_id_same_shape_id": func() {
				check("trips_pattern_id_same_shape_id", custom.PatternIdSameShapeId(db, rules.Rule("trips_pattern_id_same_shape_id")))
			},
			"trips_shape_id_route_direction_match": func() {
				check("trips_shape_id_route_direction_match", custom.ShapeIdRouteDirectionMatch(db, rules.Rule("trips_shape_id_route_direction_match")))
			},
			"trips_direction_pattern_id_match": func() {
				check("trips_direction_pattern_id_match", custom.DirectionPatternIdMatch(db, rules.Rule("trips_direction_pattern_id_match")))
			},
			"trips_pattern_id_format": func() {
				check("trips_pattern_id_format", custom.PatternIdFormat(db, rules.Rule("trips_pattern_id_format")))
			},
			"trips_route_id_pattern_consistent": func() {
				check("trips_route_id_pattern_consistent", custom.RouteIdPatternConsistent(db, rules.Rule("trips_route_id_pattern_consistent")))
			},
			"trips_direction_id_pattern_consistent": func() {
				check("trips_direction_id_pattern_consistent", custom.DirectionIdPatternConsistent(db, rules.Rule("trips_direction_id_pattern_consistent")))
			},
			"trips_trip_headsign_pattern_consistent": func() {
				check("trips_trip_headsign_pattern_consistent", custom.TripHeadsignPatternConsistent(db, rules.Rule("trips_trip_headsign_pattern_consistent")))
			},
			"trips_shape_id_max_two_per_route": func() {
				check("trips_shape_id_max_two_per_route", custom.ShapeIdMaxTwoPerRoute(db, rules.Rule("trips_shape_id_max_two_per_route")))
			},
			"trips_shape_id_route_direction_consistent": func() {
				check("trips_shape_id_route_direction_consistent", custom.ShapeIdRouteDirectionConsistent(db, rules.Rule("trips_shape_id_route_direction_consistent")))
			},
			"trips_trip_headsign_max_two_per_route": func() {
				check("trips_trip_headsign_max_two_per_route", custom.TripHeadsignMaxTwoPerRoute(db, rules.Rule("trips_trip_headsign_max_two_per_route")))
			},
			"trips_trip_headsign_route_direction_consistent": func() {
				check("trips_trip_headsign_route_direction_consistent", custom.TripHeadsignRouteDirectionConsistent(db, rules.Rule("trips_trip_headsign_route_direction_consistent")))
			},
			"trips_pattern_required_fields": func() {
				check("trips_pattern_required_fields", custom.PatternRequiredFields(db, rules.Rule("trips_pattern_required_fields")))
			},
			"trips_one_shape_per_pattern": func() {
				check("trips_one_shape_per_pattern", custom.OneShapePerPattern(db, rules.Rule("trips_one_shape_per_pattern"), reported))
			},
			"trips_one_pattern_per_shape": func() {
				check("trips_one_pattern_per_shape", custom.OnePatternPerShape(db, rules.Rule("trips_one_pattern_per_shape"), reported))
			},
			"trips_stop_sequence": func() {
				check("trips_stop_sequence", custom.StopSequence(db, rules.Rule("trips_stop_sequence"), hashes))
			},
			"trips_pattern_single_signature": func() {
				check("trips_pattern_single_signature", custom.PatternSingleSignature(db, rules.Rule("trips_pattern_single_signature"), hashes))
			},
			"trips_stop_coordinates": func() {
				check("trips_stop_coordinates", custom.StopCoordinates(db, rules.Rule("trips_stop_coordinates"), &geometry))
			},
		}
		for id := range all {
			if rulegraph.ExecutionScope(id) != scope {
				delete(all, id)
			}
		}
		return all
	}
	type group struct {
		row      int
		statuses map[string]rulegraph.Status
	}
	groups := map[string]map[string]*group{"route": {}, "pattern": {}, "shape": {}}
	order := map[string][]string{}
	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		statuses := runner.Run(actions(db, ""), nil)
		values, err := db.Trips.Fields("route_id", "pattern_id", "shape_id")
		if err != nil {
			return err
		}
		for _, scope := range []string{"route", "pattern", "shape"} {
			key := values[scope+"_id"]
			if key == "" {
				continue
			}
			current := groups[scope][key]
			if current == nil {
				current = &group{row: db.Row}
				groups[scope][key] = current
				order[scope] = append(order[scope], key)
			}
			current.statuses = services.MergeRuleStatuses(current.statuses, statuses)
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating trips: %v", err))
		return
	}
	// Pattern checks must precede shape checks: only actually reported pattern
	// conflicts suppress the corresponding shape-side duplicate diagnostic.
	for _, scope := range []string{"route", "pattern", "shape"} {
		for _, key := range order[scope] {
			current := groups[scope][key]
			runner.Run(actions(table.At(current.row).Context(), scope), current.statuses)
		}
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed trips.txt validation: %d rows processed", tracker.GetProcessedCount()))
}

func RunVehiclesValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "vehicles")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("vehicles")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running Vehicles Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "vehicles", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "vehicle", "vehicle_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			"vehicles_agency_id_field": func() {
				check(db, "vehicles_agency_id_field", fields.VehiclesAgencyIdField(db, rules.Rule("vehicles_agency_id_field")))
			},
			"vehicles_vehicle_id_field": func() {
				check(db, "vehicles_vehicle_id_field", fields.VehicleIdField(db, rules.Rule("vehicles_vehicle_id_field")))
			},
			"vehicles_license_plate_field": func() {
				check(db, "vehicles_license_plate_field", fields.LicensePlateField(db, rules.Rule("vehicles_license_plate_field")))
			},
			"vehicles_make_field": func() {
				check(db, "vehicles_make_field", fields.MakeField(db, rules.Rule("vehicles_make_field")))
			},
			"vehicles_model_field": func() {
				check(db, "vehicles_model_field", fields.ModelField(db, rules.Rule("vehicles_model_field")))
			},
			"vehicles_registration_date_field": func() {
				check(db, "vehicles_registration_date_field", fields.RegistrationDateField(db, rules.Rule("vehicles_registration_date_field")))
			},
			"vehicles_vehicle_type_field": func() {
				check(db, "vehicles_vehicle_type_field", fields.VehicleTypeField(db, rules.Rule("vehicles_vehicle_type_field")))
			},
			"vehicles_emission_field": func() {
				check(db, "vehicles_emission_field", fields.EmissionField(db, rules.Rule("vehicles_emission_field")))
			},
			"vehicles_propulsion_field": func() {
				check(db, "vehicles_propulsion_field", fields.PropulsionField(db, rules.Rule("vehicles_propulsion_field")))
			},
			"vehicles_wheelchair_accessible_field": func() {
				check(db, "vehicles_wheelchair_accessible_field", fields.VehiclesWheelchairAccessibleField(db, rules.Rule("vehicles_wheelchair_accessible_field")))
			},
			"vehicles_bicycles_capacity_field": func() {
				check(db, "vehicles_bicycles_capacity_field", fields.BicyclesCapacityField(db, rules.Rule("vehicles_bicycles_capacity_field")))
			},
			"vehicles_total_capacity_field": func() {
				check(db, "vehicles_total_capacity_field", fields.TotalCapacityField(db, rules.Rule("vehicles_total_capacity_field")))
			},
			"vehicles_car_capacity_field": func() {
				check(db, "vehicles_car_capacity_field", fields.CarCapacityField(db, rules.Rule("vehicles_car_capacity_field")))
			},
			"vehicles_agency_id_foreign": func() {
				check(db, "vehicles_agency_id_foreign", standard.VehiclesAgencyIdForeign(db, rules.Rule("vehicles_agency_id_foreign")))
			},
			"vehicles_vehicle_id_unique": func() {
				check(db, "vehicles_vehicle_id_unique", standard.VehicleIdUnique(db, rules.Rule("vehicles_vehicle_id_unique")))
			},
			"vehicles_propulsion_valid": func() {
				check(db, "vehicles_propulsion_valid", standard.PropulsionValid(db, rules.Rule("vehicles_propulsion_valid")))
			},
			"vehicles_total_capacity_valid": func() {
				check(db, "vehicles_total_capacity_valid", standard.TotalCapacityValid(db, rules.Rule("vehicles_total_capacity_valid")))
			},
			"vehicles_registration_date_valid": func() {
				check(db, "vehicles_registration_date_valid", standard.RegistrationDateValid(db, rules.Rule("vehicles_registration_date_valid")))
			},
			"vehicles_bicycles_capacity_valid": func() {
				check(db, "vehicles_bicycles_capacity_valid", standard.BicyclesCapacityValid(db, rules.Rule("vehicles_bicycles_capacity_valid")))
			},
			"vehicles_vehicle_type_valid": func() {
				check(db, "vehicles_vehicle_type_valid", standard.VehicleTypeValid(db, rules.Rule("vehicles_vehicle_type_valid")))
			},
			"vehicles_car_capacity_valid": func() {
				check(db, "vehicles_car_capacity_valid", standard.CarCapacityValid(db, rules.Rule("vehicles_car_capacity_valid")))
			},
			"vehicles_wheelchair_accessible_valid": func() {
				check(db, "vehicles_wheelchair_accessible_valid", standard.VehiclesWheelchairAccessibleValid(db, rules.Rule("vehicles_wheelchair_accessible_valid")))
			},
			"vehicles_emission_valid": func() {
				check(db, "vehicles_emission_valid", standard.EmissionValid(db, rules.Rule("vehicles_emission_valid")))
			},
			"vehicles_license_plate_valid": func() {
				check(db, "vehicles_license_plate_valid", custom.LicensePlateValid(db, rules.Rule("vehicles_license_plate_valid")))
			},
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating vehicles: %v", err))
		return
	}
	tracker.Complete()
	lib.AppLogger.Info(fmt.Sprintf("Completed vehicles.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
