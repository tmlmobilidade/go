## `fare_attributes.txt`

**Presence:** Optional<br>
**Primary key:** `fare_id`

---

### Field Definitions

|Field Name|Type|Presence|Description|
|--- |--- |--- |--- |
|`fare_id`|Unique ID|Required|Identifies a fare class.|
|`price`|Non-negative float|Required|Fare price, in the unit specified by `currency_type`.|
|`currency_type`|Currency code|Required|Currency used to pay the fare.|
|`payment_method`|Enum|Required|Indicates when the fare must be paid.<br>Valid options are:<ul><li>`0` - Fare is paid on board.</li><li>`1` - Fare must be paid before boarding.</li></ul>|
|`transfers`|Enum|Required|Indicates the number of transfers permitted on this fare.<br>Valid options are:<ul><li>`0` - No transfers permitted on this fare.</li><li>`1` - Riders may transfer once.</li><li>`2` - Riders may transfer twice.</li><li>`empty` - Unlimited transfers are permitted.</li></ul>|
|`agency_id`|Foreign ID referencing `agency.agency_id`|Conditionally Required|Identifies the relevant agency for a fare.<br><br>**Conditionally Required**:<ul><li>Required if multiple agencies are defined in `agency.txt`.</li><li>Recommended otherwise.</li></ul>|
|`transfer_duration`|Non-negative integer|Optional|Length of time in seconds before a transfer expires.<br>When `transfers=0` this field may be used to indicate how long a ticket is valid for or it may be left empty.|
