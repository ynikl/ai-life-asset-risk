import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('finance', () => {
  // 初始化当前时间
  const currentDate = new Date()
  
  // 格式化日期为YYYY-MM
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  // 从localStorage获取保存的状态或使用默认值
  const getInitialState = () => {
    const savedState = localStorage.getItem('financeState')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      return {
        currentAge: parsed.currentAge || 27,
        targetAge: parsed.targetAge || 80,
        expectedReturn: parsed.expectedReturn || 6,
        inflationRate: parsed.inflationRate || 2,
        currentAssets: parsed.currentAssets || 1000000, // 以元为单位
        incomeList: parsed.incomeList || [],
        expenseList: parsed.expenseList || []
      }
    }
    return {
      currentAge: 27,
      targetAge: 80,
      expectedReturn: 6,
      inflationRate: 2,
      currentAssets: 1000000, // 以元为单位
      incomeList: [],
      expenseList: []
    }
  }

  // 获取默认收入列表
  const getDefaultIncome = () => {
    const currentDate = new Date()
    const defaultEndDate = formatDate(new Date(currentDate.getFullYear() + (targetAge.value - currentAge.value), currentDate.getMonth()))
    
    return [
      {
        id: Date.now(),
        type: 'salary',
        amount: 10000, // 10000元/月
        startDate: formatDate(currentDate),
        endDate: defaultEndDate,
        growthRate: 10,
        growthPeriod: 3
      },
      {
        id: Date.now() + 1,
        type: 'partTime',
        amount: 500, // 500元/月
        startDate: formatDate(currentDate),
        endDate: formatDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth())),
        growthRate: 0,
        growthPeriod: 1
      }
    ]
  }

  // 获取默认支出列表
  const getDefaultExpense = () => {
    const currentDate = new Date()
    const defaultEndDate = formatDate(new Date(currentDate.getFullYear() + (targetAge.value - currentAge.value), currentDate.getMonth()))
    
    return [
      {
        id: Date.now(),
        type: 'living',
        amount: 5000, // 5000元/月
        startDate: formatDate(currentDate),
        endDate: defaultEndDate,
        inflationRate: 2,
        description: '基本生活开支'
      }
    ]
  }

  // 收入类型定义
  const incomeTypes = [
    { 
      value: 'salary', 
      label: '工资收入',
      fields: ['amount', 'startDate', 'endDate', 'growthRate'],
      description: '每月固定工资收入，可设置年度增长率'
    },
    { 
      value: 'partTime', 
      label: '兼职收入',
      fields: ['amount', 'startDate', 'endDate'],
      description: '临时或兼职收入'
    }
  ]

  // 支出类型定义
  const expenseTypes = [
    { 
      value: 'living', 
      label: '生活花销',
      fields: ['amount', 'startDate', 'endDate', 'inflationRate'],
      description: '日常生活开支，受通货膨胀影响'
    },
    { 
      value: 'bigExpense', 
      label: '大额支出',
      fields: ['amount', 'date', 'description'],
      description: '一次性大额支出'
    },
    { 
      value: 'house', 
      label: '购房支出',
      fields: ['downPayment', 'monthlyPayment', 'months', 'startDate'],
      description: '房屋购置相关支出'
    },
    { 
      value: 'child', 
      label: '育儿支出',
      fields: ['amount', 'startDate'],
      description: '育儿相关支出，持续298个月'
    }
  ]

  // 初始化状态
  const initialState = getInitialState()

  // 基础设置
  const currentAge = ref(initialState.currentAge)
  const targetAge = ref(initialState.targetAge)
  const expectedReturn = ref(initialState.expectedReturn)
  const inflationRate = ref(initialState.inflationRate)
  const currentAssets = ref(initialState.currentAssets) // 以元为单位

  // 收入和支出列表
  const incomeList = ref(initialState.incomeList.length > 0 ? initialState.incomeList : getDefaultIncome())
  const expenseList = ref(initialState.expenseList.length > 0 ? initialState.expenseList : getDefaultExpense())

  // 计算目标年份
  const targetYear = computed(() => {
    const yearsToTarget = targetAge.value - currentAge.value
    return currentDate.getFullYear() + yearsToTarget
  })

  // 获取目标日期字符串
  const getTargetDate = computed(() => {
    return `${targetYear.value}-12`
  })

  // 保存状态到localStorage
  const saveState = () => {
    const state = {
      currentAge: currentAge.value,
      targetAge: targetAge.value,
      expectedReturn: expectedReturn.value,
      inflationRate: inflationRate.value,
      currentAssets: currentAssets.value,
      incomeList: incomeList.value,
      expenseList: expenseList.value
    }
    localStorage.setItem('financeState', JSON.stringify(state))
  }

  // 监听状态变化并保存
  watch([currentAge, targetAge, expectedReturn, inflationRate, currentAssets, incomeList, expenseList], 
    () => {
      saveState()
    },
    { deep: true }
  )

  // 计算资产趋势数据
  const calculateTrendData = computed(() => {
    const years = targetAge.value - currentAge.value;
    const months = years * 12;
    const monthlyData = [];
    
    // 设置起始日期为当前月份的1号
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    // 初始资产
    let currentAssetValue = currentAssets.value;

    // 计算实际年化收益率（扣除通货膨胀）
    const annualNominalReturn = expectedReturn.value / 100;  // 名义年化收益率
    const annualInflation = inflationRate.value / 100;       // 年化通货膨胀率
    // 使用Fisher方程：(1 + 实际利率) = (1 + 名义利率) / (1 + 通货膨胀率)
    const annualRealReturn = annualNominalReturn -  annualInflation;
    // 转换为月度实际收益率
    const monthlyRealReturn = Math.pow(1 + annualRealReturn, 1/12) - 1;

    // 生成月度数据
    for (let i = 0; i <= months; i++) {
      // 创建当前月份的日期对象
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      
      // 计算当月总收入
      let monthlyIncome = 0;
      for (const income of incomeList.value) {
        monthlyIncome += calculateMonthlyIncome(currentDate, income);
      }

      // 计算当月总支出
      let monthlyExpense = 0;
      for (const expense of expenseList.value) {
        monthlyExpense += calculateMonthlyExpense(currentDate, expense);
      }

      // 计算当月净收入
      const monthlyNet = monthlyIncome - monthlyExpense;

      // 资产增值 = 当前资产 * (1 + 月度实际收益率) + 月度净收入
      currentAssetValue = currentAssetValue * (1 + monthlyRealReturn) + monthlyNet;
      
      // 添加当月数据
      monthlyData.push({
        date: formatDate(currentDate),
        assets: Math.round(currentAssetValue),
        income: Math.round(monthlyIncome),
        expense: Math.round(monthlyExpense),
        monthlyNet: Math.round(monthlyNet)
      });
    }

    return monthlyData;
  })

  // 计算每月收入
  const calculateMonthlyIncome = (date, income) => {
    if (income.type === 'salary') {
      const startDate = new Date(income.startDate);
      const endDate = new Date(income.endDate);
      
      if (date >= startDate && date <= endDate) {
        // 计算从开始日期到当前日期的年数
        const yearsSinceStart = (date.getFullYear() - startDate.getFullYear()) + 
                              (date.getMonth() - startDate.getMonth()) / 12;
        
        // 计算已经经过了多少个增长周期
        const growthCycles = Math.floor(yearsSinceStart / income.growthPeriod);
        
        // 计算累计增长率
        const totalGrowth = Math.pow(1 + income.growthRate / 100, growthCycles);
        
        // 返回增长后的月收入
        return income.amount * totalGrowth;
      }
    } else {
      // 其他类型的收入保持不变
      const startDate = new Date(income.startDate);
      const endDate = new Date(income.endDate);
      if (date >= startDate && date <= endDate) {
        return income.amount;
      }
    }
    return 0;
  };

  // 计算每月支出
  const calculateMonthlyExpense = (date, expense) => {
    const startDate = new Date(expense.startDate);
    const endDate = new Date(expense.endDate);
    
    if (date >= startDate && date <= endDate) {
      return expense.amount;  // 直接返回支出金额，不再考虑通货膨胀
    }
    return 0;
  };

  // 更新基础设置
  function updateBasicSettings(settings) {
    currentAge.value = settings.currentAge
    targetAge.value = settings.targetAge
    expectedReturn.value = settings.expectedReturn
    inflationRate.value = settings.inflationRate
    currentAssets.value = settings.currentAssets

    // 更新所有收入和支出的结束时间
    const targetDate = getTargetDate.value
    incomeList.value = incomeList.value.map(income => ({
      ...income,
      endDate: targetDate
    }))
    expenseList.value = expenseList.value.map(expense => {
      if (expense.type === 'periodic') {
        return {
          ...expense,
          endDate: targetDate
        }
      }
      return expense
    })
    
    // 保存更新后的状态
    saveState()
  }

  // 添加收入
  function addIncome(income) {
    incomeList.value.push({
      ...income,
      id: Date.now()
    })
    saveState()
  }

  // 添加支出
  function addExpense(expense) {
    expenseList.value.push({
      ...expense,
      id: Date.now()
    })
    saveState()
  }

  // 删除收入
  function removeIncome(id) {
    incomeList.value = incomeList.value.filter(item => item.id !== id)
    saveState()
  }

  // 删除支出
  function removeExpense(id) {
    expenseList.value = expenseList.value.filter(item => item.id !== id)
    saveState()
  }

  // 更新收入
  function updateIncome(id, updates) {
    const index = incomeList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      incomeList.value[index] = {
        ...incomeList.value[index],
        ...updates
      }
    }
    saveState()
  }

  // 更新支出
  function updateExpense(id, updates) {
    const index = expenseList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      expenseList.value[index] = {
        ...expenseList.value[index],
        ...updates
      }
    }
    saveState()
  }

  // 重置为默认值
  function resetToDefault() {
    const defaultState = {
      currentAge: 27,
      targetAge: 80,
      expectedReturn: 6,
      inflationRate: 2,
      currentAssets: 1000000, // 以元为单位
      incomeList: getDefaultIncome(),
      expenseList: getDefaultExpense()
    }
    
    currentAge.value = defaultState.currentAge
    targetAge.value = defaultState.targetAge
    expectedReturn.value = defaultState.expectedReturn
    inflationRate.value = defaultState.inflationRate
    currentAssets.value = defaultState.currentAssets
    incomeList.value = defaultState.incomeList
    expenseList.value = defaultState.expenseList
    
    saveState()
  }

  return {
    currentAge,
    targetAge,
    expectedReturn,
    inflationRate,
    currentAssets,
    incomeList,
    expenseList,
    calculateTrendData,
    updateBasicSettings,
    addIncome,
    addExpense,
    removeIncome,
    removeExpense,
    updateIncome,
    updateExpense,
    formatDate,
    currentDate,
    getTargetDate,
    resetToDefault,
    incomeTypes,
    expenseTypes
  }
})
