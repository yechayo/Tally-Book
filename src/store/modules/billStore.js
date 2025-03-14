// 账单列表相关store

import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

// 确保值是数字类型的辅助函数
const ensureNumber = (value) => {
  if (value === null || value === undefined) return 0
  // 如果是对象，返回0（防止对象被传入）
  if (typeof value === 'object') return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

// 递归处理对象中所有可能的数值字段
const processIncomeFields = (data) => {
  if (!data) return data
  
  if (Array.isArray(data)) {
    return data.map(item => processIncomeFields(item))
  } else if (typeof data === 'object') {
    const result = { ...data }
    
    // 处理常见的数值字段
    const numericFields = ['income', 'expense', 'amount', 'money', 'total', 'price', 'count'];
    numericFields.forEach(field => {
      if (field in result) {
        result[field] = ensureNumber(result[field])
      }
    })
    
    // 特殊处理可能包含income的嵌套对象
    if (result.bills && Array.isArray(result.bills)) {
      result.bills = result.bills.map(bill => processIncomeFields(bill))
    }
    
    if (result.data && typeof result.data === 'object') {
      result.data = processIncomeFields(result.data)
    }
    
    // 处理dayResult特殊情况
    if (result.dayResult && typeof result.dayResult === 'object') {
      if (result.dayResult.income !== undefined) {
        result.dayResult.income = ensureNumber(result.dayResult.income)
      }
    }
    
    // 递归处理所有嵌套对象
    Object.keys(result).forEach(key => {
      if (result[key] && typeof result[key] === 'object') {
        result[key] = processIncomeFields(result[key])
      }
    })
    
    return result
  }
  return data
}

const billStore = createSlice({
  name: 'bill',
  // 数据状态state
  initialState: {
    billList: []
  },
  reducers: {
    // 同步修改方法
    setBillList (state, action) {
      state.billList = action.payload
    },
    //同步添加账单
    addBill(state, action){
      state.billList.push(action.payload)
    }
  }
})

// 解构actionCreater函数
const { setBillList , addBill} = billStore.actions
// 编写异步
const getBillList = () => {
  return async (dispatch) => {
    try {
      const res = await axios.get('http://localhost:8888/ka')
      console.log('原始数据:', JSON.stringify(res.data))
      const formattedData = processIncomeFields(res.data)
      console.log('处理后数据:', JSON.stringify(formattedData))
      dispatch(setBillList(formattedData))
    } catch (error) {
      console.error('获取账单列表失败:', error)
    }
  }
}

const addBillList = (data) => {
  return async (dispatch) => {
    try {
      // 确保发送到服务器的数据格式正确
      const formattedData = processIncomeFields(data)
      const res = await axios.post('http://localhost:8888/ka', formattedData)
      // 确保返回的数据也被处理
      const processedResponse = processIncomeFields(res.data)
      dispatch(addBill(processedResponse))
    } catch (error) {
      console.error('添加账单失败:', error)
    }
  }
}

// 移除或注释掉这行，避免不必要的控制台输出
// console.log(getBillList)

export { getBillList , addBillList }
// 导出reducer
const reducer = billStore.reducer

export default reducer
