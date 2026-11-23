'use client';

import { LineTag } from '@/components/common/LineTag';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { useLinesOverviewContext } from '@/components/lines/overview/LinesOverview.context';
import { getPatternLabel, groupFeaturesByOrganization } from '@/utils/lines-overview';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { Popup } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LinesOverviewMapPopup() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: linesListData } = useLinesListContext();
	const linesOverviewContext = useLinesOverviewContext();

	const popupInfo = linesOverviewContext.data.popupInfo;
	const popupPatternIds = popupInfo.features.map(feature => feature.pattern_id);
	const organizationGroups = useMemo(() => groupFeaturesByOrganization(popupInfo.features, linesListData.organizations), [popupInfo.features, linesListData.organizations]);

	//
	// B. Handle actions

	const handleLineClick = (line_id: string) => {
		window.open(keepUrlParams(PAGE_ROUTES.offer.LINES_DETAIL(line_id)), '_blank');
	};

	const handlePatternMouseEnter = (patternId: string) => {
		linesOverviewContext.actions.setHighlightedPatternIds([patternId]);
	};

	const handlePatternsMouseLeave = () => {
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
				{organizationGroups.map(organizationGroup => (
					<section key={organizationGroup.id} className={styles.popupOrganization}>
						<div className={styles.popupOrganizationName}>
							{organizationGroup.organizations.length
								? organizationGroup.organizations.map(organization => organization.long_name).join(' · ')
								: t('lines:overview.LinesOverviewMapPopup.no_organization')}
						</div>
						<div className={styles.popupLines}>
							{organizationGroup.lines.map(group => (
								<div key={group.line_id} className={styles.popupLineGroup}>
									<div className={styles.popupLineTag}>
										<LineTag
											color={group.color}
											line_id={group.line_id}
											onClick={() => handleLineClick(group.line_id)}
											shortName={group.line_code}
											textColor={group.line_text_color}
										/>
									</div>

									<div className={styles.popupPatterns} onMouseLeave={handlePatternsMouseLeave}>
										{group.patterns.map(pattern => (
											<a
												key={pattern.pattern_id}
												className={styles.popupPatternLink}
												href={keepUrlParams(PAGE_ROUTES.offer.PATTERN_DETAIL(pattern.line_id, pattern.pattern_id, pattern.route_id))}
												onBlur={handlePatternsMouseLeave}
												onFocus={() => handlePatternMouseEnter(pattern.pattern_id)}
												onMouseEnter={() => handlePatternMouseEnter(pattern.pattern_id)}
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
					</section>
				))}
			</div>
		</Popup>
	);

	//
}
