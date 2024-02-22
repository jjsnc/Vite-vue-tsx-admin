import { computed } from 'vue'
import { type EChartsOption } from 'echarts'
import { useAppStore } from '@/stores'

type optionsFn = {
  (isDark: boolean): EChartsOption
}

export default function useChartOption(sourceOption: optionsFn) {
  const appStore = useAppStore()
  const chartOption = computed<EChartsOption>(() => {
    return sourceOption(appStore.isDark)
  })
  return {
    chartOption
  }
}
