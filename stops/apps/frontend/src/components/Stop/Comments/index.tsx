import { TextArea } from '@tmlmobilidade/ui';

import Header from '@/components/common/Header';

import styles from '../styles.module.css';

export default function Comments() {
    return <div className={styles.section}>
        <Header
            title={"Notas e Comentários"}
            description={"Texto livre para informações adicionais."}
        />

        <TextArea
            className={styles.text_area}
            maxRows={10}
            minRows={4}
            placeholder="Construção planeada a..."
        // {...alertDetailData.form.getInputProps('description')}
        />
    </div>;
}
