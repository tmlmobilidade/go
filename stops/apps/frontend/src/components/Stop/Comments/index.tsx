import Header from '@/components/common/Header';

import { TextArea } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

export default function Comments() {
    return <div className={styles.section}>
        <Header
            title={"Notas e Comentários"}
            description={"Texto livre para informações adicionais."}
        />

        <TextArea
            className={styles.padding_sm}
            maxRows={10}
            minRows={4}
            placeholder="Construção planeada a..."
            autosize
        // withAsterisk
        // {...alertDetailData.form.getInputProps('description')}
        />
    </div>;
}
