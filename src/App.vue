<script setup>
import { ref } from 'vue'
import AssetChart from './components/AssetChart.vue'
import BasicSettings from './components/BasicSettings.vue'
import IncomeExpenseForm from './components/IncomeExpenseForm.vue'
import { useFinanceStore } from './stores/financeStore'

const store = useFinanceStore()
const showDonateQR = ref(false)
</script>

<template>
  <div class="container">
    <div class="main-content">
      <div class="content-wrapper">
        <div class="chart-section">
          <AssetChart class="asset-chart" />
        </div>
        <div class="right-section">
          <BasicSettings />
        </div>
      </div>
      <div class="form-section">
        <IncomeExpenseForm />
        <div class="donate-section">
          <button class="donate-button" @click="showDonateQR = true">
            ☕️ Buy me a coffee (￥0.5)
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 捐赠二维码弹窗 -->
  <div v-if="showDonateQR" class="modal-overlay" @click="showDonateQR = false">
    <div class="modal-content" @click.stop>
      <img src="/donate-qr.jpg" alt="微信支付" class="qr-code">
      <p class="donate-text">感谢您的支持！</p>
      <button class="close-button" @click="showDonateQR = false">关闭</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10vh 10vw;
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.main-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: fit-content;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.chart-section {
  flex: 4;
}

.right-section {
  flex: 1;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-chart {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.donate-section {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.donate-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.donate-button:hover {
  background-color: #45a049;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  max-width: 300px;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.donate-text {
  margin: 16px 0;
  color: #2c3e50;
}

.close-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: #5a6268;
}
</style>
