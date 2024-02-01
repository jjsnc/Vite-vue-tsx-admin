import { defineComponent } from "vue";
import { Spin, Card } from '@arco-design/web-vue'
import useLoading from '@/hooks/loading'
import { useI18n } from 'vue-i18n'
export default defineComponent({
    name: 'ContentChar',
    setup() {
        const { loading, setLoading } = useLoading(true)
        const { t } = useI18n()
        return () => (
            <Spin loading={loading.value} class="w-full">
                <Card
                    bordered={false}
                    title={t('workplace.contentData')}
                >

                </Card>
            </Spin>
        )
    }
})