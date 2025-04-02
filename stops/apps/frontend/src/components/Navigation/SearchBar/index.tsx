import { Button, TextInput } from '@tmlmobilidade/ui';
import { IconDots } from '@tabler/icons-react';

import styles from './styles.module.css';

// import { IconLink } from '@tabler/icons-react';

export default function SearchBar() {
    return <div className={styles.container}>
        {/* <input className={styles.input} type="text" placeholder="Pesquisar..." /> */}
        <TextInput
            className={styles.input_text}
            maxLength={255}
            placeholder={"Pesquisar..."}
        // leftSection={<IconLink size={18} />}
        // disabled
        // {...alertDetailData.form.getInputProps('title')}
        />

        {/* <Button className={styles.button} leftSection={<IconDots size={14} />}></Button> */}

        <div className={styles.icon}>
            <IconDots />
        </div>


        {/* <button className={styles.settings}></button> */}
        {/* <TextInput
            description="Opcionalmente inclua o URL de um website onde é possivel obter mais informação"
            label="Link Adicional"
            leftSection={<IconLink size={18} />}
            // placeholder="https://www.cm-setubal.com/..."
            // {...alertDetailData.form.getInputProps('link')}
        /> */}
    </div>;
}
