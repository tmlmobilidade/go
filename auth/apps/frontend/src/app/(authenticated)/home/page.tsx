'use client';
import MarkdownPage from '@/components/markdown/files/home.mdx';
import { quickLinks } from '@/components/QuickLink/data';
import { Grid, Pane, Section, Tag, Text } from '@tmlmobilidade/ui';

export default function Page() {
	return (
		<Pane header={[<MarkdownPage />]}>
			<Grid columns="abcd">
				{quickLinks.map(item => (
					<div key={item.icon}>
						<Section alignItems="center" flexDirection="column" flexWrap="nowrap" gap="sm">
							<Tag label={item.icon} />
							<Text size="lg">{item.title}</Text>
							<Text size="base">{item.link}</Text>
						</Section>






						{/* <div>{item.icon}</div>
					<h3>{item.title}</h3>
					<a href={item.link}>Acessar</a> */}
					</div>
				))}
			</Grid>
		</Pane>
	);
}
