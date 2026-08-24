/* * */

import { IconAffiliate, IconBriefcase, IconBuilding, IconBuildingBank, IconBuildingFactory, IconBuildingSkyscraper, IconBuildingStore, IconBuildingWarehouse, IconCalendar, IconCalendarEvent, IconCalendarStats, IconCash, IconChartArea, IconChartBar, IconChartBubble, IconChartDonut, IconChartLine, IconChartPie, IconClipboard, IconClipboardCheck, IconClipboardList, IconCoin, IconCoins, IconCreditCard, IconDeviceDesktop, IconEaseOutControlPointFilled, IconFileCertificate, IconFileDescription, IconFileDollar, IconFileInfo, IconFileInvoice, IconFileSpreadsheet, IconFileText, IconFileTypeSql, IconFlag, IconHierarchy, IconId, IconIdBadge, IconListNumbers, IconMail, IconMailOpened, IconMessageUser, IconNetwork, IconPhone, IconPlant2, IconPrinter, IconReport, IconReportAnalytics, IconReportMoney, IconRubberStamp, IconSignature, IconTicket, IconTransferIn, IconUmbrella, IconUser, IconUserCheck, IconUserDollar, IconUserPlus, IconUsers, IconUserStar, IconWallet } from '@tabler/icons-react';
import { ReactNode } from 'react';

/* * */

export interface IconDataItem {
	icon: ReactNode
	label: string
	value: string
}

/* * */

export const iconMap: Record<string, ReactNode> = {
	IconBriefcase: <IconBriefcase />,
	IconBuilding: <IconBuilding />,
	IconBuildingBank: <IconBuildingBank />,
	IconBuildingFactory: <IconBuildingFactory />,
	IconBuildingSkyscraper: <IconBuildingSkyscraper />,
	IconBuildingStore: <IconBuildingStore />,
	IconBuildingWarehouse: <IconBuildingWarehouse />,
	IconCalendar: <IconCalendar />,
	IconCalendarEvent: <IconCalendarEvent />,
	IconCalendarStats: <IconCalendarStats />,
	IconCash: <IconCash />,
	IconChartArea: <IconChartArea />,
	IconChartBar: <IconChartBar />,
	IconChartBubble: <IconChartBubble />,
	IconChartDonut: <IconChartDonut />,
	IconChartLine: <IconChartLine />,
	IconChartPie: <IconChartPie />,
	IconClipboard: <IconClipboard />,
	IconClipboardCheck: <IconClipboardCheck />,
	IconClipboardList: <IconClipboardList />,
	IconCoin: <IconCoin />,
	IconCoins: <IconCoins />,
	IconCreditCard: <IconCreditCard />,
	IconDeviceDesktop: <IconDeviceDesktop />,
	IconEaseOutControlPointFilled: <IconEaseOutControlPointFilled />,
	IconFileCertificate: <IconFileCertificate />,
	IconFileDescription: <IconFileDescription />,
	IconFileDollar: <IconFileDollar />,
	IconFileInfo: <IconFileInfo />,
	IconFileInvoice: <IconFileInvoice />,
	IconFileSpreadsheet: <IconFileSpreadsheet />,
	IconFileText: <IconFileText />,
	IconFileTypeSql: <IconFileTypeSql />,
	IconFlag: <IconFlag />,
	IconHierarchy: <IconHierarchy />,
	IconId: <IconId />,
	IconIdBadge: <IconIdBadge />,
	IconListNumbers: <IconListNumbers />,
	IconMail: <IconMail />,
	IconMailOpened: <IconMailOpened />,
	IconMessageUser: <IconMessageUser />,
	IconNetwork: <IconNetwork />,
	IconPhone: <IconPhone />,
	IconPlant2: <IconPlant2 />,
	IconPrinter: <IconPrinter />,
	IconReport: <IconReport />,
	IconReportAnalytics: <IconReportAnalytics />,
	IconReportMoney: <IconReportMoney />,
	IconSafe: <IconAffiliate />,
	IconSignature: <IconSignature />,
	IconStamp: <IconRubberStamp />,
	IconTicket: <IconTicket />,
	IconTransferIn: <IconTransferIn />,
	IconUmbrella: <IconUmbrella />,
	IconUser: <IconUser />,
	IconUserCheck: <IconUserCheck />,
	IconUserDollar: <IconUserDollar />,
	IconUserPlus: <IconUserPlus />,
	IconUsers: <IconUsers />,
	IconUserStar: <IconUserStar />,
	IconWallet: <IconWallet />,
};

export const iconData: IconDataItem[] = Object.entries(iconMap).map(([key, icon]) => ({
	icon,
	label: key,
	value: key,
}));
