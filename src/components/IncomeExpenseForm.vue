<script setup>
import { ref, computed, nextTick } from 'vue'
import { useFinanceStore } from '../stores/financeStore'
import { ElDatePicker, ElTooltip } from 'element-plus'

const store = useFinanceStore()

const defaultEndDate = computed(() => store.getTargetDate)

// 编辑状态管理
const editingItem = ref(null)
const editingValue = ref('')

// 新建项状态
const showNewIncome = ref(false)
const showNewExpense = ref(false)

const getEmptyIncome = (type = 'salary') => ({
  id: Date.now(),
  type,
  amount: '',
  startDate: store.formatDate(store.currentDate),
  endDate: defaultEndDate.value,
  growthRate: 0,
  growthPeriod: 1
})

const getEmptyExpense = (type = 'living') => ({
  id: Date.now(),
  type,
  amount: '',
  startDate: store.formatDate(store.currentDate),
  endDate: defaultEndDate.value,
  inflationRate: store.inflationRate,
  description: ''
})

const newIncome = ref(getEmptyIncome())
const newExpense = ref(getEmptyExpense())

// 开始编辑
function startEdit(item, field) {
  editingItem.value = { id: item.id, field, type: 'income' }
  editingValue.value = item[field].toString()
  nextTick(() => {
    const input = document.querySelector('.edit-input')
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function startEditExpense(item, field) {
  editingItem.value = { id: item.id, field, type: 'expense' }
  editingValue.value = item[field].toString()
  nextTick(() => {
    const input = document.querySelector('.edit-input')
    if (input) {
      input.focus()
      input.select()
    }
  })
}

// 保存编辑
function saveEdit() {
  if (!editingItem.value) return
  
  const value = parseFloat(editingValue.value)
  if (isNaN(value)) return
  
  const updates = {
    [editingItem.value.field]: value
  }
  
  if (editingItem.value.type === 'income') {
    store.updateIncome(editingItem.value.id, updates)
  } else {
    store.updateExpense(editingItem.value.id, updates)
  }
  
  editingItem.value = null
  editingValue.value = ''
}

// 处理按键事件
function handleKeyPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveEdit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    editingItem.value = null
    editingValue.value = ''
  }
}

function addIncome() {
  if (!newIncome.value.amount) return
  
  store.addIncome({
    ...newIncome.value,
    amount: Number(newIncome.value.amount)
  })
  
  showNewIncome.value = false
  newIncome.value = getEmptyIncome()
}

function addExpense() {
  if (!newExpense.value.amount) return
  
  store.addExpense({
    ...newExpense.value,
    amount: Number(newExpense.value.amount)
  })
  
  showNewExpense.value = false
  newExpense.value = getEmptyExpense()
}

function startNewIncome() {
  showNewIncome.value = true
  newIncome.value = getEmptyIncome()
}

function startNewExpense() {
  showNewExpense.value = true
  newExpense.value = getEmptyExpense()
}

// 格式化金额
const formatMoney = (amount) => {
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// 计算下一次增长后的金额
const calculateNextGrowth = (income) => {
  return income.amount * (1 + income.growthRate / 100);
};
</script>

<template>
  <div class="form-container">
    <!-- 收入部分 -->
    <div class="section">
      <div class="section-header">
        <h3>收入明细</h3>
        <button class="add-button" @click="showNewIncome = !showNewIncome">
          <i class="el-icon-plus"></i> {{ showNewIncome ? '取消' : '添加收入' }}
        </button>
      </div>
      
      <!-- 收入列表 -->
      <div class="items-list">
        <!-- 新增收入表单 -->
        <transition name="list">
          <div v-if="showNewIncome" class="new-item-form" key="new-income">
            <select v-model="newIncome.type" class="form-select">
              <option v-for="type in store.incomeTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            
            <template v-if="newIncome.type === 'salary'">
              <div class="form-group">
                <label>月收入金额</label>
                <div class="input-with-unit">
                  <input
                    v-model="newIncome.amount"
                    type="text"
                    placeholder="请输入金额"
                    inputmode="decimal"
                  >
                  <span class="unit">元/月</span>
                </div>
              </div>

              <div class="growth-settings">
                <div class="form-group">
                  <label>增长周期</label>
                  <div class="input-with-unit">
                    <input
                      v-model="newIncome.growthPeriod"
                      type="number"
                      min="1"
                      placeholder="增长周期"
                    >
                    <span class="unit">年</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>增长幅度</label>
                  <div class="input-with-unit">
                    <input
                      v-model="newIncome.growthRate"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="增长比例"
                    >
                    <span class="unit">%</span>
                  </div>
                </div>
              </div>

              <div class="growth-preview" v-if="newIncome.amount && newIncome.growthRate > 0">
                <div class="preview-title">增长预览：</div>
                <div class="preview-content">
                  每 {{ newIncome.growthPeriod }} 年增长 {{ newIncome.growthRate }}%
                  <div class="preview-example">
                    示例：{{ formatMoney(newIncome.amount) }}/月 
                    → {{ formatMoney(calculateNextGrowth(newIncome)) }}/月
                    <span class="preview-note">({{ newIncome.growthPeriod }}年后)</span>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="form-group">
                <label>月收入金额</label>
                <div class="input-with-unit">
                  <input
                    v-model="newIncome.amount"
                    type="text"
                    placeholder="请输入金额"
                    inputmode="decimal"
                  >
                  <span class="unit">元/月</span>
                </div>
              </div>
            </template>
            
            <div class="form-actions">
              <button @click="addIncome" class="save-button">保存</button>
            </div>
          </div>
        </transition>

        <transition-group name="list">
          <div v-for="item in store.incomeList" :key="item.id" class="list-item">
            <div class="item-header">
              <div class="item-type">{{ store.incomeTypes.find(t => t.value === item.type)?.label }}</div>
              <button @click="store.removeIncome(item.id)" class="remove-button">删除</button>
            </div>
            
            <div class="item-content">
              <div class="amount" @dblclick="startEdit(item, 'amount')">
                <label>月收入：</label>
                <template v-if="editingItem?.id === item.id && editingItem?.field === 'amount'">
                  <input
                    v-model="editingValue"
                    @keydown="handleKeyPress"
                    @blur="saveEdit"
                    class="edit-input"
                  >
                </template>
                <template v-else>
                  {{ formatMoney(item.amount) }}元/月
                </template>
              </div>

              <template v-if="item.type === 'salary'">
                <div class="growth-info">
                  每{{ item.growthPeriod }}年增长{{ item.growthRate }}%
                </div>
              </template>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 支出部分 -->
    <div class="section">
      <div class="section-header">
        <h3>支出明细</h3>
        <button class="add-button" @click="showNewExpense = !showNewExpense">
          <i class="el-icon-plus"></i> {{ showNewExpense ? '取消' : '添加支出' }}
        </button>
      </div>
      
      <!-- 支出列表 -->
      <div class="items-list">
        <!-- 新增支出表单 -->
        <transition name="list">
          <div v-if="showNewExpense" class="new-item-form" key="new-expense">
            <select v-model="newExpense.type">
              <option v-for="type in store.expenseTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            
            <template v-if="newExpense.type === 'living'">
              <input
                v-model="newExpense.amount"
                type="text"
                placeholder="月支出金额"
                inputmode="decimal"
              >
            </template>
            
            <template v-if="newExpense.type === 'bigExpense'">
              <input
                v-model="newExpense.amount"
                type="text"
                placeholder="支出金额"
                inputmode="decimal"
              >
              <input
                v-model="newExpense.description"
                type="text"
                placeholder="用途说明"
              >
            </template>
            
            <template v-if="newExpense.type === 'house'">
              <input
                v-model="newExpense.downPayment"
                type="text"
                placeholder="首付金额"
                inputmode="decimal"
              >
              <input
                v-model="newExpense.monthlyPayment"
                type="text"
                placeholder="月供金额"
                inputmode="decimal"
              >
              <input
                v-model="newExpense.months"
                type="text"
                placeholder="贷款月数"
                inputmode="decimal"
              >
            </template>
            
            <template v-if="newExpense.type === 'child'">
              <input
                v-model="newExpense.amount"
                type="text"
                placeholder="月育儿成本"
                inputmode="decimal"
              >
            </template>
            
            <div class="form-actions">
              <button @click="addExpense" class="save-button">保存</button>
            </div>
          </div>
        </transition>

        <transition-group name="list">
          <div v-for="item in store.expenseList" :key="item.id" class="list-item">
            <div class="item-header">
              <div class="item-type">{{ store.expenseTypes.find(t => t.value === item.type)?.label }}</div>
              <button @click="store.removeExpense(item.id)" class="remove-button">删除</button>
            </div>
            
            <div class="item-content">
              <div class="amount" @dblclick="startEditExpense(item, 'amount')">
                <label>{{ item.type === 'living' ? '月支出：' : '支出金额：' }}</label>
                <template v-if="editingItem?.id === item.id && editingItem?.field === 'amount'">
                  <input
                    v-model="editingValue"
                    @keydown="handleKeyPress"
                    @blur="saveEdit"
                    class="edit-input"
                    inputmode="decimal"
                    pattern="[0-9]*"
                  >
                </template>
                <template v-else>
                  {{ item.amount }}元
                </template>
              </div>
              
              <div v-if="item.description" class="description">
                <label>说明：</label>
                <span>{{ item.description }}</span>
              </div>
              
              <div class="date-range">
                <label>时间范围：</label>
                <span>{{ item.startDate }} 至 {{ item.endDate }}</span>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #2c3e50;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.new-item-form {
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.new-item-form:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.new-item-form select,
.new-item-form input {
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.new-item-form select:focus,
.new-item-form input:focus {
  border-color: #409eff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.add-button {
  background: #409eff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.add-button:hover {
  background: #66b1ff;
  transform: translateY(-1px);
}

.save-button {
  background: #67c23a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.save-button:hover {
  background: #85ce61;
  transform: translateY(-1px);
}

.remove-button {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: #f78989;
}

.list-item {
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.list-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-type {
  font-weight: 500;
  color: #606266;
}

.item-content {
  display: grid;
  gap: 8px;
}

.amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount label {
  color: #606266;
  min-width: 70px;
}

.edit-input {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 120px;
}

.edit-input:focus {
  border-color: #409eff;
  outline: none;
}

/* 滚动条样式 */
.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 过渡动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit input {
  flex: 1;
}

.unit {
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
}

.growth-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.growth-preview {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.preview-content {
  color: #409eff;
  font-size: 14px;
}

.preview-example {
  margin-top: 8px;
  color: #67c23a;
  font-size: 13px;
}

.preview-note {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.growth-info {
  color: #409eff;
  font-size: 14px;
  margin-top: 4px;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.form-select:focus {
  border-color: #409eff;
  outline: none;
}
</style>
