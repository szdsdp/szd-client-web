<template>
  <div class="app-sub-container token-panel-container">
    <div class="token-panel-toolbar">
      <span class="toolbar-label">{{ $t("统计月份") }}：</span>
      <el-date-picker
        v-model="query.month"
        type="month"
        :clearable="false"
        format="YYYY-MM"
        value-format="YYYY-MM"
        style="width: 160px"
        @change="getList" />
    </div>
    <!-- 第一部分：个人统计 -->
    <div v-if="dg.open" class="token-summary-section">
      <div class="token-summary-cards">
        <div class="token-summary-card" :class="'card-' + item.key" v-for="item in summaryCards" :key="item.key">
          <div class="card-icon">
            <el-icon :size="32"><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-value">{{ item.value }}</div>
            <div class="card-label">{{ $t(item.label) }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 第二部分：Token 用量排名 -->
    <el-row v-if="dg.open" :gutter="8" class="token-rank-section">
      <el-col :span="12">
        <div class="token-rank-block">
          <div class="token-section-title">
            <el-icon><Medal /></el-icon>
            <span>{{ $t("Token 用量排名") }}</span>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in staObj.step21" :key="item.userId" class="rank-item" :class="'rank-top-' + (index + 1)">
              <span class="rank-medal">
                <template v-if="index === 0">🥇</template>
                <template v-else-if="index === 1">🥈</template>
                <template v-else-if="index === 2">🥉</template>
                <template v-else>{{ item.tokenRank }}</template>
              </span>
              <span class="rank-name">{{ item.userName }}</span>
              <div class="rank-bar-wrapper">
                <div class="rank-bar" :style="{ width: getBarWidth(item.tokenTotal, staObj.step21[0]?.tokenTotal) }"></div>
              </div>
              <span class="rank-value">{{ formatNumber(item.tokenTotal) }}</span>
            </div>
            <div v-if="staObj.step21.length === 0" class="rank-empty">{{ $t("暂无数据") }}</div>
          </div>
          <div v-if="staObj.step10.tokenRank" class="my-rank">
            <span class="my-rank-label">{{ $t("我的排名") }}</span>
            <span class="my-rank-no">{{ $t("第") }} {{ staObj.step10.tokenRank }} {{ $t("名") }}</span>
            <span class="my-rank-value">{{ formatNumber(staObj.step10.tokenTotal) }} Token</span>
          </div>
        </div>
      </el-col>
      <!-- 第三部分：会话组用量排名 -->
      <el-col :span="12">
        <div class="token-rank-block">
          <div class="token-section-title">
            <el-icon><OfficeBuilding /></el-icon>
            <span>{{ $t("会话组用量排名") }}</span>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in staObj.step22" :key="item.groupCode" class="rank-item" :class="'rank-top-' + (index + 1)">
              <span class="rank-medal">
                <template v-if="index === 0">🥇</template>
                <template v-else-if="index === 1">🥈</template>
                <template v-else-if="index === 2">🥉</template>
                <template v-else>{{ item.groupRank }}</template>
              </span>
              <span class="rank-name" :title="item.groupName">{{ item.groupName }}</span>
              <div class="rank-bar-wrapper">
                <div class="rank-bar" :style="{ width: getBarWidth(item.tokenTotal, staObj.step22[0]?.tokenTotal) }"></div>
              </div>
              <span class="rank-value">{{ formatNumber(item.tokenTotal) }}</span>
            </div>
            <div v-if="staObj.step22.length === 0" class="rank-empty">{{ $t("暂无数据") }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 第四部分：每日用量趋势 -->
    <div v-if="dg.open" class="token-trend-section">
      <div class="token-trend-header">
        <div class="token-section-title">
          <el-icon><DataLine /></el-icon>
          <span>{{ $t("每日用量趋势") }}</span>
        </div>
        <div class="trend-toolbar">
          <el-radio-group v-model="query.range" size="small" @change="getList">
            <el-radio-button value="7">{{ $t("近7天") }}</el-radio-button>
            <el-radio-button value="14">{{ $t("近14天") }}</el-radio-button>
            <el-radio-button value="30">{{ $t("近30天") }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div ref="trendChartRef" class="trend-chart" />
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onBeforeUnmount, ref, nextTick } from "vue";
  import * as echarts from "echarts";
  import szdDate from "../../../../common/tools/date";
  import { $t } from "../../../../common/utils/globalConfig";
  import { getSessionTokenStats } from "../../api/sessionTokenPanel";

  const props = defineProps({
    mDg: {
      type: Object,
      default: () => {}
    }
  });

  //功能参数
  const dg = ref({
    open: false
  });

  //查询条件
  const query = ref({
    userId: props.mDg.userId,
    month: szdDate.getYearMonth(),
    range: "7"
  });

  //统计数据
  const staObj = ref({
    step10: {
      tokenTotal: 0, //已用Token
      chatCount: 0, //会话轮次
      taskCount: 0, //自动任务
      taskSuccess: 0, //自动任务成功
      taskFail: 0, //自动任务失败
      tokenRank: 0 //已用Token排名
    },
    //消耗Token排名-仅显示前3 [{tokenRank排名 userId 用户ID userName 用户姓名 tokenTotal 已用Token}]
    step21: [],
    //会话组排名-仅显示前4 [{groupRank排名 groupCode 会话组代码 groupName 会话组名称 tokenTotal 已用Token routerCode路由代码 routerName 路由名称}]
    step22: [],
    //每日使用量 [{date日期 tokenUsed已用Token chatCount轮次 chatSuccess成功轮次 chatFail失败轮次}]
    step30: []
  });

  const trendChartRef = ref(null);
  let trendChart = null;
  let chartResizeObserver = null;
  let querySeq = 0;

  const summaryCards = computed(() => [
    { key: "total", label: "已用 Token", value: formatNumber(staObj.value.step10.tokenTotal), icon: "DataLine" },
    { key: "chat", label: "会话轮次", value: formatNumber(staObj.value.step10.chatCount), icon: "ChatDotRound" },
    { key: "task", label: "自动任务", value: formatNumber(staObj.value.step10.taskCount), icon: "Timer" },
    { key: "success", label: "任务成功", value: formatNumber(staObj.value.step10.taskSuccess), icon: "CircleCheck" },
    { key: "fail", label: "任务失败", value: formatNumber(staObj.value.step10.taskFail), icon: "CircleClose" }
  ]);

  onBeforeUnmount(() => {
    if (trendChart) {
      trendChart.dispose();
      trendChart = null;
    }
    if (chartResizeObserver) {
      chartResizeObserver.disconnect();
      chartResizeObserver = null;
    }
  });

  onMounted(() => {
    getList();
  });

  //查询看板数据
  const getList = () => {
    const seq = ++querySeq;
    getSessionTokenStats(query.value)
      .then(res => {
        if (res.code === 200) {
          if (seq !== querySeq) return;
          staObj.value = res.data;
          dg.value.open = true;
          nextTick(() => {
            initTrendChart();
          });
        }
      })
      .catch(() => {
        if (seq !== querySeq) return;
        staObj.value = {
          step10: { tokenTotal: 0, chatCount: 0, taskCount: 0, taskSuccess: 0, taskFail: 0, tokenRank: 0 },
          step21: [],
          step22: [],
          step30: []
        };
        dg.value.open = true;
      });
  };

  const initTrendChart = () => {
    if (!trendChartRef.value) return;
    if (chartResizeObserver) {
      chartResizeObserver.disconnect();
      chartResizeObserver = null;
    }
    if (trendChart) {
      trendChart.dispose();
      trendChart = null;
    }
    chartResizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          if (!trendChart) {
            trendChart = echarts.init(trendChartRef.value);
          }
          trendChart.resize();
          renderTrendChart();
        }
      }
    });
    chartResizeObserver.observe(trendChartRef.value);
  };

  const formatNumber = num => {
    if (num === null || num === undefined) return "0";
    return Number(num).toLocaleString();
  };

  const getBarWidth = (value, maxValue) => {
    if (!maxValue || maxValue === 0) return "0%";
    return Math.max((value / maxValue) * 100, 5) + "%";
  };

  const renderTrendChart = () => {
    if (!trendChart) return;
    const dates = staObj.value.step30.map(item => item.date);
    const tokenUsed = staObj.value.step30.map(item => item.tokenUsed);
    const chatSuccess = staObj.value.step30.map(item => item.chatSuccess);
    const chatFail = staObj.value.step30.map(item => item.chatFail);
    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "#ebeef5",
        textStyle: { color: "#303133", fontSize: 12 }
      },
      legend: {
        data: ["Token 消耗量", "成功轮次", "失败轮次"],
        bottom: 0,
        itemGap: 24,
        textStyle: { fontSize: 12, color: "#606266" }
      },
      grid: { top: 16, right: 60, bottom: 40, left: 60 },
      xAxis: {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#dcdfe6" } },
        axisLabel: { color: "#909399", fontSize: 11 }
      },
      yAxis: [
        {
          type: "value",
          name: "Token",
          nameTextStyle: { color: "#909399", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: "#f0f2f5", type: "dashed" } },
          axisLabel: { color: "#909399", fontSize: 11 }
        },
        {
          type: "value",
          name: "轮次",
          position: "right",
          offset: 10,
          nameTextStyle: { color: "#909399", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { color: "#909399", fontSize: 11 }
        }
      ],
      series: [
        {
          name: "Token 消耗量",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "#409eff" },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(64,158,255,0.25)" },
              { offset: 1, color: "rgba(64,158,255,0.02)" }
            ])
          },
          data: tokenUsed
        },
        {
          name: "成功轮次",
          type: "bar",
          yAxisIndex: 1,
          barWidth: 12,
          itemStyle: { color: "#67c23a", borderRadius: [3, 3, 0, 0] },
          data: chatSuccess
        },
        {
          name: "失败轮次",
          type: "bar",
          yAxisIndex: 1,
          barWidth: 12,
          itemStyle: { color: "#f56c6c", borderRadius: [3, 3, 0, 0] },
          data: chatFail
        }
      ]
    };
    trendChart.setOption(option, true);
  };
</script>

<style lang="scss" scoped>
  .token-panel-container {
    padding: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .token-panel-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 2px;

    .toolbar-label {
      font-size: 13px;
      color: #606266;
      flex-shrink: 0;
    }
  }

  .token-section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .token-summary-section {
    margin-bottom: 10px;
  }

  .token-summary-cards {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
  }

  .token-summary-cards .token-summary-card {
    flex: 1;
    min-width: 0;
  }

  .token-summary-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 10px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    background: #fff;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .card-value {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
      color: #303133;
      white-space: nowrap;
    }

    .card-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .card-total .card-icon {
    background: linear-gradient(135deg, #e8f4fd, #d0e8ff);
    color: #409eff;
  }

  .card-chat .card-icon {
    background: linear-gradient(135deg, #e8f4fd, #d0e8ff);
    color: #409eff;
  }

  .card-task .card-icon {
    background: linear-gradient(135deg, #fdf6e8, #faecd0);
    color: #e6a23c;
  }

  .card-success .card-icon {
    background: linear-gradient(135deg, #e8f8ef, #d0f0dc);
    color: #67c23a;
  }

  .card-fail .card-icon {
    background: linear-gradient(135deg, #fde8e8, #fcd0d0);
    color: #f56c6c;
  }

  .card-rank .card-icon {
    background: linear-gradient(135deg, #f0e8fd, #e0d0fa);
    color: #9b59b6;
  }

  .token-rank-section {
    margin-bottom: 12px;
  }

  .token-rank-block {
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    background: #fff;
    height: 100%;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }
  }

  .rank-top-1 {
    background: linear-gradient(90deg, #fff7e6, #fffaf0);
  }

  .rank-top-2 {
    background: linear-gradient(90deg, #f0f5ff, #f5f8ff);
  }

  .rank-top-3 {
    background: linear-gradient(90deg, #fff0f0, #fff5f5);
  }

  .rank-medal {
    width: 28px;
    text-align: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .rank-name {
    width: 120px;
    flex-shrink: 0;
    font-size: 13px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-bar-wrapper {
    flex: 1;
    height: 18px;
    background: #f0f2f5;
    border-radius: 9px;
    overflow: hidden;
    min-width: 60px;
  }

  .rank-bar {
    height: 100%;
    border-radius: 9px;
    background: linear-gradient(90deg, #409eff, #79bbff);
    transition: width 0.6s ease;
  }

  .rank-top-1 .rank-bar {
    background: linear-gradient(90deg, #e6a23c, #f0c78a);
  }

  .rank-top-2 .rank-bar {
    background: linear-gradient(90deg, #409eff, #79bbff);
  }

  .rank-top-3 .rank-bar {
    background: linear-gradient(90deg, #f56c6c, #f9a8a8);
  }

  .rank-value {
    width: 80px;
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    flex-shrink: 0;
  }

  .rank-empty {
    text-align: center;
    color: #c0c4cc;
    padding: 30px 0;
    font-size: 13px;
  }

  .my-rank {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding: 10px 14px;
    background: linear-gradient(90deg, #ecf5ff, #f0f9ff);
    border: 1px dashed #409eff;
    border-radius: 6px;
  }

  .my-rank-label {
    font-size: 13px;
    color: #909399;
  }

  .my-rank-no {
    font-size: 16px;
    font-weight: 700;
    color: #409eff;
  }

  .my-rank-value {
    font-size: 13px;
    color: #606266;
    margin-left: auto;
  }

  .token-trend-section {
    width: 100%;

    .token-trend-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 0 2px 10px 2px;
      border-bottom: 1px solid #ebeef5;
    }

    .token-section-title {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .trend-toolbar {
      margin-bottom: 0;
    }

    .trend-chart {
      width: 100%;
      height: 200px;
    }
  }
</style>
