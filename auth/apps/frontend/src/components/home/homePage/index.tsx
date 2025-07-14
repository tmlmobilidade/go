"use client"
import { quickLinks } from '@/components/home/homePage/data';
import { Grid, Pane, Section } from '@tmlmobilidade/ui';
import { QuickLinkButton } from '../QuickLink';
/* * */


export function HomePage() {
    return(  
       
        <Pane>
            <Section padding='lg'>
                <Grid columns="abcd" gap='md'>
                    {quickLinks.map(item => (
                        <QuickLinkButton item={item} />
                    ))}
                </Grid>
            </Section>
		</Pane>
    );
}