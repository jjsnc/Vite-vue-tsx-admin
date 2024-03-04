import { defineComponent, ref, computed, nextTick } from "vue";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Divider,
    Dropdown,
    Link,
    Popover,
    Space,
    Table,
    Tooltip,
    Upload,
    type PaginationProps,
    type TableColumnData
} from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import useLoading from '@/hooks/loading'
import TableSearchForm from './TableSearchForm'
import { queryPolicyList, type PolicyQuery, type PolicyRecord } from '@/api/list'
import { type Pagination } from '@/types/global'
import {
    IconDownload,
    IconDragArrow,
    IconLineHeight,
    IconPlus,
    IconSettings
} from '@arco-design/web-vue/es/icon'
import { exchangeArray } from '@/utils/sort'
import Sortable from 'sortablejs'
import usePermission from '@/hooks/permission'
export default defineComponent({
    name: 'search-table',
    setup() {
        const { t } = useI18n()
        const { checkButtonPermission } = usePermission()
        const { loading, setLoading } = useLoading()

        const initPagination: Pagination = {
            current: 1,
            pageSize: 20
        }
        const paginationConfig = ref<PaginationProps & Pagination>({
            ...initPagination,
            showTotal: true
        })
        const resetPagination = () => {
            paginationConfig.value = {
                ...paginationConfig.value,
                ...initPagination
            }
        }
        const searchQuery = ref<PolicyQuery>({
            number: '',
            name: '',
            contentType: '',
            filterType: '',
            createdTime: [],
            status: ''
        })
        const renderData = ref<PolicyRecord[]>([])
        const fetchData = async () => {
            setLoading(true)
            try {
                const query = searchQuery.value
                const params = {
                    ...query,
                    current: paginationConfig.value.current,
                    pageSize: paginationConfig.value.pageSize
                }
                const { data } = await queryPolicyList(params)

                renderData.value = data.list
                paginationConfig.value.total = data.total
            } catch (err) {
                // you can report use errorHandler or other
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        const handleQuerySearch = () => {
            resetPagination()
            fetchData()
        }
        type TableSize = 'medium' | 'mini' | 'small' | 'large'
        const tableSize = ref<TableSize>('medium')
        const densityList = computed(() => [
            {
                name: t('searchTable.size.mini'),
                value: 'mini'
            },
            {
                name: t('searchTable.size.small'),
                value: 'small'
            },
            {
                name: t('searchTable.size.medium'),
                value: 'medium'
            },
            {
                name: t('searchTable.size.large'),
                value: 'large'
            }
        ])
        const handleSelectDensity = (val: unknown) => {
            tableSize.value = val as TableSize
        }
        const colList = ref([
            {
                getTitle: () => t('searchTable.columns.number'),
                dataIndex: 'number',
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.name'),
                dataIndex: 'name',
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.contentType'),
                dataIndex: 'contentType',
                render: ({ record }: { record: PolicyRecord }) => {
                    const map: Record<PolicyRecord['contentType'], string> = {
                        img: '//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/581b17753093199839f2e327e726b157.svg~tplv-49unhts6dw-image.image',
                        horizontalVideo:
                            '//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/77721e365eb2ab786c889682cbc721c1.svg~tplv-49unhts6dw-image.image',
                        verticalVideo:
                            '//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/ea8b09190046da0ea7e070d83c5d1731.svg~tplv-49unhts6dw-image.image'
                    }
                    return (
                        <>
                            <Space>
                                <Avatar size={16} shape="square">
                                    <img alt="avatar" src={map[record.contentType]} />
                                </Avatar>
                                {t(`searchTable.form.contentType.${record.contentType}`)}
                            </Space>
                        </>
                    )
                },
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.filterType'),
                dataIndex: 'filterType',
                render: ({ record }: { record: PolicyRecord }) => (
                    <>{t(`searchTable.form.filterType.${record.filterType}`)}</>
                ),
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.count'),
                dataIndex: 'count',
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.createdTime'),
                dataIndex: 'createdTime',
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.status'),
                dataIndex: 'status',
                render: ({ record }: { record: PolicyRecord }) => {
                    return (
                        <Space>
                            <Badge status={record.status === 'offline' ? 'danger' : 'success'}></Badge>
                            {t(`searchTable.form.status.${record.status}`)}
                        </Space>
                    )
                },
                checked: true
            },
            {
                getTitle: () => t('searchTable.columns.operations'),
                dataIndex: 'operations',
                render: () =>
                    checkButtonPermission(['admin']) && (
                        <Link>{t('searchTable.columns.operations.view')}</Link>
                    ),
                checked: true
            }
        ])
        const popupVisibleChange = (val: boolean) => {
            if (val) {
                nextTick(() => {
                    const el = document.getElementById('tableSetting') as HTMLElement
                    new Sortable(el, {
                        onEnd(e: any) {
                            const { oldIndex, newIndex } = e
                            exchangeArray(colList.value, oldIndex, newIndex)
                        }
                    })
                })
            }
        }
        const tableColumns = computed(() => {
            return colList.value
                .filter((col) => col.checked)
                .map((item) => {
                    const ret: TableColumnData = {
                        title: item.getTitle(),
                        dataIndex: item.dataIndex
                    }
                    if (item.render) ret.render = item.render as unknown as TableColumnData['render']
                    return ret
                })
        })
        const handleCurrentChange = (page: number) => {
            paginationConfig.value.current = page
            fetchData()
        }
        const handlePageSizeChange = (pageSize: number) => {
            paginationConfig.value.pageSize = pageSize
            fetchData()
        }
        return () => (
            <div>
                <Card class="general-card " title={t('menu.list.searchTable')}>
                    <TableSearchForm
                        searchLoading={loading.value}
                        searchQuery={searchQuery.value}
                        onOnSearch={handleQuerySearch}
                    ></TableSearchForm>
                    <Divider />
                    <div class="flex justify-between mb-4">
                        <Space>
                            <Button
                                v-slots={{
                                    icon: () => <IconPlus />
                                }}
                                type="primary"
                            >
                                {t('searchTable.operation.create')}
                            </Button>
                            <Upload action="/" showFileList={false}>
                                {{
                                    'upload-button': () => <Button>{t('searchTable.operation.import')}</Button>
                                }}
                            </Upload>
                        </Space>
                        <Space size="medium">
                            <Button
                                v-slots={{
                                    icon: () => <IconDownload />
                                }}
                            >
                                {t('searchTable.operation.download')}
                            </Button>
                            <Dropdown onSelect={handleSelectDensity}>
                                {{
                                    default: () => (
                                        <Tooltip content={t('searchTable.actions.density')}>
                                            <IconLineHeight class="cursor-pointer" size="18" />
                                        </Tooltip>
                                    ),
                                    content: () =>
                                        densityList.value.map((item) => (
                                            <Dropdown.Option value={item.value}>
                                                <span>{item.name}</span>
                                            </Dropdown.Option>
                                        ))
                                }}
                            </Dropdown>
                            <Tooltip content={t('searchTable.actions.columnSetting')}>
                                <Popover trigger="click" position="left" onPopupVisibleChange={popupVisibleChange}>
                                    {{
                                        default: () => <IconSettings size="18" class="cursor-pointer" />,
                                        content: () => (
                                            <div id="tableSetting">
                                                {colList.value.map((item) => (
                                                    <div class="w-32">
                                                        <Space>
                                                            <IconDragArrow class="cursor-move" />
                                                            <Checkbox v-model={item.checked} />
                                                            <div
                                                                class="text-ellipsis whitespace-nowrap  overflow-hidden w-20"
                                                                title={item.getTitle()}
                                                            >
                                                                {item.getTitle()}
                                                            </div>
                                                        </Space>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    }}
                                </Popover>
                            </Tooltip>
                        </Space>
                    </div>
                    <Table
                        loading={loading.value}
                        data={renderData.value}
                        bordered={false}
                        size={tableSize.value}
                        pagination={paginationConfig.value as PaginationProps}
                        columns={tableColumns.value}
                        onPageChange={handleCurrentChange}
                        onPageSizeChange={handlePageSizeChange}
                    ></Table>
                </Card>
            </div>
        )
    }
})