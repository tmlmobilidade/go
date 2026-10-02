package types

/* * */

type GTFSBool int

const (
	NOT_SPECIFIED GTFSBool = iota
	YES
	NO
)

func (b GTFSBool) String() string {
	return []string{"NOT_SPECIFIED", "YES", "NO"}[b]
}

/* * */

type Align int

const (
	AVAILABLE Align = iota
	NOT_AVAILABLE
	MUST_CONTACT_AGENCY
	MUST_CONTACT_DRIVER
)

type ExceptionType int

const (
	SERVICE_ADDED ExceptionType = iota + 1
	SERVICE_REMOVED
)

type TransferType int

const (
	RECOMMENDED TransferType = iota
	TIMED_TRANSFER
	TIME_REQUIRED
	NO_TRANSFER_POSSIBLE
	IN_SEAT_TRANSFER
	RE_BOARD_TRANSFER
)

type LocationType uint8

const (
	LOCATION_TYPE_STOP LocationType = iota
	LOCATION_TYPE_STATION
	LOCATION_TYPE_ENTRANCE_EXIT
	LOCATION_TYPE_GENERIC_NODE
	LOCATION_TYPE_BOARDING_AREA
)

func LocationTypeCount() int {
	return len([]string{"STOP", "STATION", "ENTRANCE_EXIT", "GENERIC_NODE", "BOARDING_AREA"})
}

func (l LocationType) String() string {
	return []string{"STOP", "STATION", "ENTRANCE_EXIT", "GENERIC_NODE", "BOARDING_AREA"}[l]
}

func (l LocationType) Value() uint8 {
	return uint8(l)
}

/* * */

type WheelchairBoardingType int

const (
	UNKNOWN_OR_INHERIT WheelchairBoardingType = iota
	ACCESSIBLE
	NOT_ACCESSIBLE
)

func (b WheelchairBoardingType) String() string {
	return []string{"UNKNOWN_OR_INHERIT", "ACCESSIBLE", "NOT_ACCESSIBLE"}[b]
}

func (b WheelchairBoardingType) Value() int {
	return int(b)
}

/* * */

type PickupDropoffType int

const (
	CONTINUOUS PickupDropoffType = iota
	NON_CONTINUOUS
	PICKUP_MUST_CONTACT_AGENCY
	PICKUP_MUST_CONTACT_DRIVER
)

type PaymentMethod int

const (
	PAID_ON_BOARD PaymentMethod = iota
	PAID_BEFORE_BOARDING
)

type TransfersNumber int

const (
	NO_TRANSFERS_PERMITTED TransfersNumber = iota
	RIDERS_MAY_TRANSFER_ONCE
	RIDERS_MAY_TRANSFER_TWICE
	UNLIMITED_TRANSFERS_ARE_PERMITTED TransfersNumber = -1
)

type PathwayMode int

const (
	WALKWAY PathwayMode = iota + 1
	STAIRS
	MOVING_SIDEWALK_TRAVELATOR
	ESCALATOR
	ELEVATOR
	FARE_PAYMENT_GATE
	EXIT_GATE
)

type TranslationsTableName string

const (
	AGENCY       TranslationsTableName = "agency"
	ATTRIBUTIONS TranslationsTableName = "attributions"
	FEED_INFO    TranslationsTableName = "feed_info"
	LEVELS       TranslationsTableName = "levels"
	PATHWAYS     TranslationsTableName = "pathways"
	ROUTES       TranslationsTableName = "routes"
	STOP_TIMES   TranslationsTableName = "stop_times"
	STOPS        TranslationsTableName = "stops"
	TRIPS        TranslationsTableName = "trips"
)

type FareMediaType int

const (
	NONE FareMediaType = iota
	PHYSICAL_TICKET
	PHYSICAL_CARD
	CONTACTLESS_EMV
	MOBILE_APP
)

type BookingType int

const (
	REAL_TIME BookingType = iota
	SAME_DAY
	PRIOR_DAY
)

type DurationLimit int

const (
	DEPARTURE_TO_ARRIVAL DurationLimit = iota
	DEPARTURE_TO_DEPARTURE
	ARRIVAL_TO_DEPARTURE
	ARRIVAL_TO_ARRIVAL
)

type FareTransferType int

const (
	LEG_TRANSFER FareTransferType = iota
	LEG_TRANSFER_LEG
	TRANSFER
)
