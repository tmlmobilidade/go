/* * */

import { useOrganizationsDetailContext } from '@/contexts/OrganizationDetail.context';
import { IconAffiliate, IconBriefcase, IconBuilding, IconBuildingBank, IconBuildingFactory, IconBuildingSkyscraper, IconBuildingStore, IconBuildingWarehouse, IconCalendar, IconCalendarEvent, IconCalendarStats, IconCash, IconChartArea, IconChartBar, IconChartBubble, IconChartDonut, IconChartLine, IconChartPie, IconClipboard, IconClipboardCheck, IconClipboardList, IconCoin, IconCoins, IconCreditCard, IconDeviceDesktop, IconEaseOutControlPointFilled, IconFileCertificate, IconFileDescription, IconFileDollar, IconFileInfo, IconFileInvoice, IconFileSpreadsheet, IconFileText, IconFileTypeSql, IconFlag, IconHierarchy, IconId, IconIdBadge, IconListNumbers, IconMail, IconMailOpened, IconMessageUser, IconNetwork, IconPhone, IconPlant2, IconPrinter, IconReport, IconReportAnalytics, IconReportMoney, IconRubberStamp, IconSignature, IconTicket, IconTransferIn, IconUmbrella, IconUser, IconUserCheck, IconUserDollar, IconUserPlus, IconUsers, IconUserStar, IconWallet } from '@tabler/icons-react';
import { Combobox } from '@tmlmobilidade/ui';

/* * */

const iconMap: Record<string, React.ReactNode> = {
	IconBriefcase: <IconBriefcase size={40} />,
	IconBuilding: <IconBuilding size={40} />,
	IconBuildingBank: <IconBuildingBank size={40} />,
	IconBuildingFactory: <IconBuildingFactory size={40} />,
	IconBuildingSkyscraper: <IconBuildingSkyscraper size={40} />,
	IconBuildingStore: <IconBuildingStore size={40} />,
	IconBuildingWarehouse: <IconBuildingWarehouse size={40} />,
	IconCalendar: <IconCalendar size={40} />,
	IconCalendarEvent: <IconCalendarEvent size={40} />,
	IconCalendarStats: <IconCalendarStats size={40} />,
	IconCash: <IconCash size={40} />,
	IconChartArea: <IconChartArea size={40} />,
	IconChartBar: <IconChartBar size={40} />,
	IconChartBubble: <IconChartBubble size={40} />,
	IconChartDonut: <IconChartDonut size={40} />,
	IconChartLine: <IconChartLine size={40} />,
	IconChartPie: <IconChartPie size={40} />,
	IconClipboard: <IconClipboard size={40} />,
	IconClipboardCheck: <IconClipboardCheck size={40} />,
	IconClipboardList: <IconClipboardList size={40} />,
	IconCoin: <IconCoin size={40} />,
	IconCoins: <IconCoins size={40} />,
	IconCreditCard: <IconCreditCard size={40} />,
	IconDeviceDesktop: <IconDeviceDesktop size={40} />,
	IconEaseOutControlPointFilled: <IconEaseOutControlPointFilled size={40} />,
	IconFileCertificate: <IconFileCertificate size={40} />,
	IconFileDescription: <IconFileDescription size={40} />,
	IconFileDollar: <IconFileDollar size={40} />,
	IconFileInfo: <IconFileInfo size={40} />,
	IconFileInvoice: <IconFileInvoice size={40} />,
	IconFileSpreadsheet: <IconFileSpreadsheet size={40} />,
	IconFileText: <IconFileText size={40} />,
	IconFileTypeSql: <IconFileTypeSql size={40} />,
	IconFlag: <IconFlag size={40} />,
	IconHierarchy: <IconHierarchy size={40} />,
	IconId: <IconId size={40} />,
	IconIdBadge: <IconIdBadge size={40} />,
	IconListNumbers: <IconListNumbers size={40} />,
	IconMail: <IconMail size={40} />,
	IconMailOpened: <IconMailOpened size={40} />,
	IconMessageUser: <IconMessageUser size={40} />,
	IconNetwork: <IconNetwork size={40} />,
	IconPhone: <IconPhone size={40} />,
	IconPlant2: <IconPlant2 size={40} />,
	IconPrinter: <IconPrinter size={40} />,
	IconReport: <IconReport size={40} />,
	IconReportAnalytics: <IconReportAnalytics size={40} />,
	IconReportMoney: <IconReportMoney size={40} />,
	IconSafe: <IconAffiliate size={40} />,
	IconSignature: <IconSignature size={40} />,
	IconStamp: <IconRubberStamp size={40} />,
	IconTicket: <IconTicket size={40} />,
	IconTransferIn: <IconTransferIn size={40} />,
	IconUmbrella: <IconUmbrella size={40} />,
	IconUser: <IconUser size={40} />,
	IconUserCheck: <IconUserCheck size={40} />,
	IconUserDollar: <IconUserDollar size={40} />,
	IconUserPlus: <IconUserPlus size={40} />,
	IconUsers: <IconUsers size={40} />,
	IconUserStar: <IconUserStar size={40} />,
	IconWallet: <IconWallet size={40} />,
};

const iconData = Object.entries(iconMap).map(([key, icon]) => ({ icon, label: key, value: key }));

export function IconChooser() {
	const organizationContext = useOrganizationsDetailContext();
	return (
		<Combobox
			data={iconData}
			label="Ícones"
			fullWidth
			{...organizationContext.data.form.getInputProps('icon')}
		/>
	);
}
