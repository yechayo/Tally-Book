import { useState } from 'react'
import { NavBar, DatePicker } from 'antd-mobile'
import './index.scss'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import _, { set } from 'lodash'
import { useEffect } from 'react'
import DailyBill from './components/DayBill'

const Month = () => {
    //按月数据分组
    const billList = useSelector(state => state.bill.billList)
    const monthGroup = useMemo(()=>{
      //return出去计算后的值
      return _.groupBy(billList,(item) => dayjs(item.date).format('YYYY-MM'))
    },[billList])
    console.log(monthGroup)
    //控制弹窗显示
    const [dataVisible, setDataVisible] = useState(false)
    //控制时间按显示
    const [currentDate,setCurrentdate] = useState(() => {
      return dayjs(new Date()).format('YYYY-MM')
    })

    const [currentMonthList,setMonthList] = useState([])

    const monthResult = useMemo(() => {
      // 添加空数据保护和数值转换
      const validList = currentMonthList || []
      const pay = Number(validList.filter(item => item.type === 'pay').reduce((a, c) => a + c.money, 0)) || 0
      const income = Number(validList.filter(item => item.type === 'income').reduce((a, c) => a + c.money, 0)) || 0
      return {
        pay,
        income,
        total: income + pay
      }
    }, [currentMonthList])
    //初始化时显示当月数据
    useEffect(()=> {
      const nowDate = dayjs().format("YYYY-MM")
      if(monthGroup[nowDate]) {
        setMonthList(monthGroup[nowDate])}
    },[monthGroup])
    // 初始化逻辑添加保护
    useEffect(() => {
      const nowDate = dayjs().format("YYYY-MM")
      setMonthList(monthGroup[nowDate] || []) // 添加空数组
    }, [monthGroup])
    //确认回调添加保护
    const onConfirm = (date) => {
      setDataVisible(false)
      // 删除重复的 formatDate 声明
      const formatDate = dayjs(date).format('YYYY-MM')
      console.log(date)
      console.log(formatDate)
      setMonthList(monthGroup[formatDate] || [])
      setCurrentdate(formatDate)
    }

    //当月按日分组
    const dayGroup = useMemo(()=>{
      //return出去计算后的值
      const groupData = _.groupBy(currentMonthList,(item)=> dayjs(item.date).format('YYYY-MM-DD'))
      const keys = Object.keys(groupData)
      return{
        groupData,
        keys
      }
      return _.groupBy(currentMonthList,(item) => dayjs(item.date).format('YYYY-MM-DD'))
    },[currentMonthList])

    return (
    <div className="monthlyBill">
      <NavBar className="nav" backArrow={false}>
        月度收支
      </NavBar>

      <div className="content">
        <div className="header">
          {/* 时间切换区域 */}
          <div className="date" onClick={()=>setDataVisible(true)}>
            <span className="text">
              {currentDate + ''}月账单
            </span>
        {/* 思路：根据弹框状态控制expend是否存在 */}
            <span className={classNames('arrow', dataVisible && 'expand')}></span>

          </div>

          {/* 统计区域 */}
        <div className='tf'>
          <div className='twoLineOverview'>
            <div className="item">
              <span className="money">{monthResult.pay.toFixed(2)}</span>

              <span className="type">支出</span>

            </div>

            <div className="item">
              <span className="money">{monthResult.income.toFixed(2)}</span>

              <span className="type">收入</span>

            </div>

            <div className="item">
              <span className="money">{monthResult.total.toFixed(2)}</span>

              <span className="type">结余</span>

            </div>
{/* <div className='twoLineOverview'>
  <div className="item">
    <span className="money">{(monthResult?.pay ?? 0).toFixed(2)}</span>
    <span className="type">支出</span>
  </div>
  
  <div className="item">
    <span className="money">{(monthResult?.income ?? 0).toFixed(2)}</span>
    <span className="type">收入</span>
  </div>
  
  <div className="item">
    <span className="money">{(monthResult?.total ?? 0).toFixed(2)}</span>
    <span className="type">结余</span>
  </div>
</div> */}
          </div>
        </div>

          {/* 时间选择器 */}
          <DatePicker
            className="kaDate"
            title="记账日期"
            precision="month"
            visible={dataVisible}
            onCancel={() => setDataVisible(false)}
            onConfirm={onConfirm}
            onClose={() => setDataVisible(false)}
            max={new Date()}
          />
        </div>
      {/* 单日列表统计 */}
      {
        dayGroup.keys.map(key => {
          return <DailyBill key={key} date={key} billList={dayGroup.groupData[key]} />
        })
      }
      </div>

    </div >

  )
}

export default Month