import { quickLinks } from '@/components/home/homePage/data';
import { Grid, Pane, Section } from '@tmlmobilidade/ui';
import { QuickLinkButton } from '../QuickLink';
import { WikiFiles } from '@/components/markdown/wiki-generator';
/* * */


export function HomePage() {
    return(  
       
        // <Pane>
        //     <Section padding='lg'>
        //         <Grid columns="abcd" gap='md'>
        //             {quickLinks.map(item => (
        //                 <QuickLinkButton key={item.href} item={item} />
        //             ))}
        //         </Grid>

        //         <WikiFiles/>
        //     </Section>
		// </Pane>
        <>
        <WikiFiles/>
        </>
    );
}