'use client';

import { LineTag } from '@/components/common/LineTag';
import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { getPatternLabel, groupFeaturesByLine } from '@/utils/lines-overview';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Popup } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

/* * */

export function LinesOverviewMapPopup() {
	//

	//
	// A. Setup variables

	const linesOverviewContext = useLinesOverviewContext();

	const popupInfo = linesOverviewContext.data.popupInfo;
	const popupPatternIds = popupInfo.features.map(feature => feature.pattern_id);

	//
	// B. Handle actions

	const handleLineClick = (line_id: string) => {
		window.open(PAGE_ROUTES.offer.LINES_DETAIL(line_id), '_blank');
	};

	const handlePatternMouseEnter = (patternId: string) => {
		linesOverviewContext.actions.setHighlightedPatternIds([patternId]);
	};

	const handlePatternMouseLeave = () => {
		linesOverviewContext.actions.setHighlightedPatternIds(popupPatternIds);
	};

	const handlePopupClose = () => {
		linesOverviewContext.actions.setHighlightedPatternIds([]);
		linesOverviewContext.actions.setPopupInfo(null);
	};

	//
	// C. Render components

	return (
		<Popup
			anchor="bottom"
			className={styles.popup}
			closeButton={false}
			latitude={popupInfo.latitude}
			longitude={popupInfo.longitude}
			maxWidth="460px"
			offset={16}
			onClose={handlePopupClose}
		>
			<div className={styles.popupContent}>
				<div className={styles.popupLines}>
					{groupFeaturesByLine(popupInfo.features).map(group => (
						<div key={group.line_id} className={styles.popupLineGroup}>
							<div style={{ paddingTop: 'var(--size-spacing-xs)' }}>
								<LineTag
									color={group.color}
									line_id={group.line_id}
									onClick={() => handleLineClick(group.line_id)}
									shortName={group.line_code}
									textColor={group.line_text_color}
								/>
							</div>

							<div className={styles.popupPatterns}>
								{group.patterns.map(pattern => (
									<a
										key={pattern.pattern_id}
										className={styles.popupPatternLink}
										href={PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern.pattern_id, pattern.route_id)}
										onBlur={handlePatternMouseLeave}
										onFocus={() => handlePatternMouseEnter(pattern.pattern_id)}
										onMouseEnter={() => handlePatternMouseEnter(pattern.pattern_id)}
										onMouseLeave={handlePatternMouseLeave}
										rel="noopener noreferrer"
										target="_blank"
									>
										<span className={styles.popupPatternCode}>
											{pattern.pattern_code}
										</span>
										<span className={styles.popupPatternName}>
											{getPatternLabel(pattern)}
										</span>
									</a>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</Popup>
	);

	//
}
