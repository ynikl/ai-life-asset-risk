<script setup>
import { useFinanceStore } from '../stores/financeStore'
import { ref, watch } from 'vue'

const store = useFinanceStore()

// 创建本地状态
const localSettings = ref({
  currentAge: store.currentAge,
  targetAge: store.targetAge,
  expectedReturn: store.expectedReturn,
  inflationRate: store.inflationRate,
  currentAssets: store.currentAssets
})

// 监听本地状态变化并更新store
watch(localSettings, (newSettings) => {
  store.updateBasicSettings(newSettings)
}, { deep: true })

// 监听store变化并更新本地状态
watch(() => ({
  currentAge: store.currentAge,
  targetAge: store.targetAge,
  expectedReturn: store.expectedReturn,
  inflationRate: store.inflationRate,
  currentAssets: store.currentAssets
}), (newSettings) => {
  Object.assign(localSettings.value, newSettings)
}, { deep: true })
</script>

<template>
  <div class="settings-container">
    <h3>基础设置</h3>
    
    <div class="setting-item">
      <label>当前资产</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="localSettings.currentAssets"
          placeholder="请输入金额（元）">
        <span class="unit">元</span>
      </div>
    </div>

    <div class="setting-item">
      <label>当前年龄</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="localSettings.currentAge">
        <span class="unit">岁</span>
      </div>
    </div>

    <div class="setting-item">
      <label>目标年龄</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="localSettings.targetAge">
        <span class="unit">岁</span>
      </div>
    </div>

    <div class="setting-item">
      <label>预期年化收益率</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="localSettings.expectedReturn">
        <span class="unit">%</span>
      </div>
    </div>

    <div class="setting-item">
      <label>预期通货膨胀率</label>
      <div class="input-group">
        <input 
          type="number" 
          v-model="localSettings.inflationRate">
        <span class="unit">%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 16px;
  width: 100%;
}

h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #2c3e50;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 8px;
}

.unit {
  color: #606266;
  width: 30px;
}

input:focus {
  outline: none;
  border-color: #409eff;
}
</style>
