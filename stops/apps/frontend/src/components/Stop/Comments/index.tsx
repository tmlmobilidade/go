import Header from '@/components/common/Header';

// import { Tag, TextArea } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';
import { TextArea } from '@tmlmobilidade/ui';

export default function Comments() {
    return <div className={styles.section}>
        <Header
            title={"Notas e Comentários"}
            description={"Texto livre para informações adicionais."}
        />

        <TextArea />
        {/* <Tag label={"XPTO 123 !"}></Tag> */}
        {/* <TextArea
            className={styles.padding_sm}
            maxRows={10}
            minRows={4}
            placeholder="Construção planeada a..."
            autosize
        // withAsterisk
        // {...alertDetailData.form.getInputProps('description')}
        /> */}
    </div>;
}
