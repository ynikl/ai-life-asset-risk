<script setup>
/**
 *  一个基于 Vue ChartJS 的图表组件，用于显示财务数据趋势
 *
 *  该组件使用了 Vue ChartJS 库，提供了一个简单的 API 来生成图表
 *  该组件的 props 为空，表示它不需要任何外部数据
 */
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useFinanceStore } from '../stores/financeStore'

//  ChartJS.register() 函数用于注册 ChartJS 的插件
//  在这里，我们注册了 CategoryScale、LinearScale、PointElement、LineElement、Title、Tooltip 和 Legend 插件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 初始化 store
const store = useFinanceStore()

//  该函数将 store 中的数据转换为图表所需的格式
const chartData = computed(() => {
  const trendData = store.calculateTrendData
  
  return {
    labels: trendData.map(d => {
      //  将日期字符串转换为 'YYYY/MM' 格式
      const date = new Date(d.date)
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`
    }),
    datasets: [
      {
        //  label 是图例的名称
        label: '资产总额',
        //  borderColor 是折线的颜色
        borderColor: '#2c3e50',
        //  backgroundColor 是填充的颜色
        backgroundColor: 'rgba(44, 62, 80, 0.1)',
        //  data 是图表的数据 points
        data: trendData.map(d => {
          // 统一展示为万元
          return d.assets / 10000;
        }),
        //  tension 是控制曲线的平滑度，值越小，曲线越平滑
        tension: 0.4,
        //  fill 是控制是否填充曲线下面的面积
        fill: false
      }
    ]
  }
})

//  该函数将 store 中的数据转换为图表的配置
const chartOptions = computed(() => {
  const trendData = store.calculateTrendData
  // 获取最大资产（元）
  const maxAssets = Math.max(...trendData.map(d => Math.abs(d.assets)))
  
  return {
    //  使图表响应式，自动适应父容器的大小
    responsive: true,
    //  使图表保持宽高比
    maintainAspectRatio: false,
    //  使图表可以 hover 到某个点时显示 tooltip
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      //  使 y 轴显示为 linear
      y: {
        type: 'linear',
        display: true,
        title: {
          //  使 y 轴的标题显示为 '资产金额 (万元)'
          display: true,
          text: '资产金额 (万元)'
        },
        //  使 y 轴的最大值都在视图中
        max: maxAssets / 10000 * 1.1,
        //  使 y 轴的刻度显示为 'x.xx'
        ticks: {
          callback: function(value) {
            return value.toFixed(1)
          }
        }
      }
    },
    plugins: {
      //  使 tooltip 显示为 '资产总额: x.xx万元'
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return '资产总额: ' + value.toFixed(2) + '万元';
          }
        }
      }
    }
  }
})
</script>

<template>
  <div class="chart-container">
    <!--  该组件将 chartData 和 chartOptions 传递给 Line 组件 -->
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
/*  该样式将 chart-container 的宽高设置为 100%，同时设置最小高度为 500px */
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
