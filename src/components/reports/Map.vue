<template>
  <div id="map"></div>
</template>

<script>
// 导入Echarts
import echarts from 'echarts'
// 导入中国地图
import 'echarts/map/js/china'
// 引入jsonp
import jsonp from 'jsonp'

const option = {
  title: {
    text: '模拟二月份疫情地图'
  },
  visualMap: [
    {
      // 分段型
      type: 'piecewise',
      show: true,
      splitNumber: 6,
      pieces: [
        {
          min: 10000
        }, // 不指定 max，表示 max 为无限大（Infinity）。
        {
          min: 1000,
          max: 9999
        },
        {
          min: 100,
          max: 999
        },
        {
          min: 10,
          max: 99
        },
        {
          min: 1,
          max: 9
        },
        {
          min: 0,
          max: 0
        }
      ],
      inRange: {
        symbol: 'rect',
        color: ['#fff', '#ffaa85', '#ff7b69', '#cc2929', '#8c0d0d', '#660208']
      },
      itemHeight: 10,
      itemWidth: 20
    }
  ],
  // 鼠标悬浮的提示信息
  // 地图 : {a}（系列名称），{b}（区域名称），{c}（合并数值）, {d}（无）
  tooltip: {
    trigger: 'item',
    formatter: '地区：{b}<br/>确诊：{c}',
    position: function(point, params, dom, rect, size) {
      // 固定在顶部
      return [point[0], '10%']
    }
  },
  series: [
    {
      // 图表的类型
      type: 'map',
      map: 'china',
      label: {
        // 显示各个省份名称
        show: true,
        fontSize: 12,
        color: 'black'
      },
      itemStyle: {
        // 区域的背景颜色
        areaColor: '#fff'
      },
      // 高亮状态下
      emphasis: {
        label: {
          fontSize: 15,
          color: '#4adbaf'
        },
        // 控制鼠标滑过时的高亮样式
        itemStyle: {
          // 地图区域的多边形 图形颜色
          areaColor: '#c7fffd',
          borderColor: '#B03A5B'
        }
      },
      // 当前视角的缩放比例
      zoom: 1.2,
      data: [
        { name: '北京', value: 200 },
        { name: '湖北', value: 20000 }
      ]
    }
  ]
}

export default {
  data() {
    return {
      myChart: ''
    }
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    this.myChart = echarts.init(document.getElementById('map'))
    // 指定图表的配置项和数据
    // 使用刚指定的配置项和数据显示图表。
    this.myChart.setOption(option)
  },
  created() {
    this.getData()
  },
  methods: {
    // 获得真实数据
    getData() {
      // 解决访问跨域问题
      jsonp(
        'http://interface.sina.cn/news/wap/fymap2020_data.d.json?_=1580892522427',
        {},
        (erros, data) => {
          // console.log(data);
          // console.log(data.data.list)
          var lists = data.data.list.map(item => {
            return {
              name: item.name,
              value: item.value
            }
          })
          option.series[0].data = lists
          this.myChart.setOption(option)
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
#map {
  width: 1050px;
  height: 620px;
}
</style>
