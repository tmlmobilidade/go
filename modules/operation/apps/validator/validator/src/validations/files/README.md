
# Files

|File Name|Presence|Description|
|--- |--- |--- |
|`agency.txt`|Required|Transit agencies with service represented in this dataset.|
|`stops.txt`|Conditionally Required|Stops where vehicles pick up or drop off riders. Also defines stations and station entrances.<br><br>**Conditionally Required**:<ul><li>**Optional** if demand-responsive zones are defined in locations.geojson.</li><li>**Required** otherwise.</li></ul>|
|`routes.txt`|Required|Transit routes. A route is a group of trips that are displayed to riders as a single service.|
|`trips.txt`|Required|Trips for each route. A trip is a sequence of two or more stops that occur during a specific time period.|
|`stop_times.txt`|Required|Times that a vehicle arrives at and departs from stops for each trip.|
|`calendar.txt`|Conditionally Required|Service dates specified using a weekly schedule with start and end dates.<br><br>**Conditionally Required**:<ul><li>**Required** unless all dates of service are defined in `calendar_dates.txt`.</li><li>**Optional** otherwise.</li></ul>|
|`calendar_dates.txt`|Conditionally Required|Exceptions for the services defined in the `calendar.txt`. <br><br>**Conditionally Required**:<ul><li>**Required** if `calendar.txt` is omitted.</li><li>In which case `calendar_dates.txt` must contain all dates of service.</li><li>**Optional** otherwise.</li></ul>|
|`fare_attributes.txt`|Optional|Fare information for a transit agency's routes.|
|`fare_rules.txt`|Optional|Rules to apply fares for itineraries.|
|`timeframes.txt`|Optional|Date and time periods to use in fare rules for fares that depend on date and time factors.|
|`rider_categories.txt`|Optional|Defines categories of riders (e.g. elderly, student).|
|`fare_media.txt`|Optional|To describe the fare media that can be employed to use fare products. File `fare_media.txt` describes concepts that are not represented in `fare_attributes.txt` and `fare_rules.txt`. As such, the use of `fare_media.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_products.txt`|Optional|To describe the different types of tickets or fares that can be purchased by riders.File `fare_products.txt` describes fare products that are not represented in `fare_attributes.txt` and `fare_rules.txt`. As such, the use of `fare_products.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_leg_rules.txt`|Optional|Fare rules for individual legs of travel.File `fare_leg_rules.txt` provides a more detailed method for modeling fare structures. As such, the use of `fare_leg_rules.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`fare_leg_join_rules.txt`|Optional|Rules for defining two or more legs should be considered as a single effective fare leg for the purposes of matching against rules in `fare_leg_rules.txt`|
|`fare_transfer_rules.txt`|Optional|Fare rules for transfers between legs of travel.Along with `fare_leg_rules.txt`, file `fare_transfer_rules.txt` provides a more detailed method for modeling fare structures. As such, the use of `fare_transfer_rules.txt` is entirely separate from files `fare_attributes.txt` and `fare_rules.txt`.|
|`areas.txt`|Optional|Area grouping of locations.|
|`stop_areas.txt`|Optional|Rules to assign stops to areas.|
|`networks.txt`|Conditionally Forbidden|Network grouping of routes.Conditionally Forbidden:<ul><li>**Forbidden** if network_id exists in `routes.txt`.</li><li>Optional otherwise.</li></ul>|
|`route_networks.txt`|Conditionally Forbidden|Rules to assign routes to networks.Conditionally Forbidden:<ul><li>**Forbidden** if network_id exists in `routes.txt`.</li><li>Optional otherwise.</li></ul>|
|`shapes.txt`|Optional|Rules for mapping vehicle travel paths, sometimes referred to as route alignments.|
|`frequencies.txt`|Optional|Headway (time between trips) for headway-based service or a compressed representation of fixed-schedule service.|
|`transfers.txt`|Optional|Rules for making connections at transfer points between routes.|
|`pathways.txt`|Optional|Pathways linking together locations within stations.|
|`levels.txt`|Conditionally Required|Levels within stations.Conditionally Required:<ul><li>**Required** when describing pathways with elevators (`pathway_mode=5`).</li><li>Optional otherwise.</li></ul>|
|`location_groups.txt`|Optional|A group of stops that together indicate locations where a rider may request pickup or drop off.|
|`location_group_stops.txt`|Optional|Rules to assign stops to location groups.|
|locations.geojson|Optional|Zones for rider pickup or drop-off requests by on-demand services, represented as GeoJSON polygons.|
|`booking_rules.txt`|Optional|Booking information for rider-requested services.|
|`translations.txt`|Optional|Translations of customer-facing dataset values.|
|`feed_info.txt`|Conditionally Required|Dataset metadata, including publisher, version, and expiration information.Conditionally Required:<ul><li>**Required** if `translations.txt` is provided.</li><li>Recommended otherwise.</li></ul>|
|`attributions.txt`|Optional|Dataset attributions.|
