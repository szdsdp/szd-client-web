<template>
  <div class="app-sub-container cron">
    <el-tabs v-model="activeName" :style="tabStyle">
      <el-tab-pane :label="$t('秒')" name="s">
        <second-and-minute v-model="sVal" labelDesc="秒" @check="validateVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('分')" name="m">
        <second-and-minute v-model="mVal" labelDesc="分" @check="validateVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('时')" name="h">
        <hour v-model="hVal" @check="validateVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('日')" name="d">
        <day v-model="dVal" @check="validateVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('月')" name="month">
        <month v-model="monthVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('周')" name="week">
        <week v-model="weekVal" @check="validateVal" />
      </el-tab-pane>
      <el-tab-pane :label="$t('年')" name="year">
        <year v-model="yearVal" @check="validateVal" />
      </el-tab-pane>
    </el-tabs>

    <!-- table -->
    <el-table :data="tableData" border>
      <el-table-column prop="sVal" label="秒" />
      <el-table-column prop="mVal" label="分" />
      <el-table-column prop="hVal" label="时" />
      <el-table-column prop="dVal" label="日" />
      <el-table-column prop="monthVal" label="月" />
      <el-table-column prop="weekVal" label="周" />
      <el-table-column prop="yearVal" label="年" />
    </el-table>
  </div>
</template>

<script>
  import SecondAndMinute from "./cron/secondAndMinute";
  import hour from "./cron/hour";
  import day from "./cron/day";
  import month from "./cron/month";
  import week from "./cron/week";
  import year from "./cron/year";
  import { $t } from "../../common/utils/globalConfig";

  export default {
    props: {
      modelValue: {
        type: String
      }
    },
    data() {
      return {
        activeName: "s",
        sVal: "",
        mVal: "",
        hVal: "",
        dVal: "",
        monthVal: "",
        weekVal: "",
        yearVal: "",
        tabStyle: "pointer-events: auto;"
      };
    },
    watch: {
      modelValue: {
        handler(nv, ov) {
          this.updateVal(nv);
        }
      }
    },
    computed: {
      tableData() {
        return [
          {
            sVal: this.sVal,
            mVal: this.mVal,
            hVal: this.hVal,
            dVal: this.dVal,
            monthVal: this.monthVal,
            weekVal: this.weekVal,
            yearVal: this.yearVal
          }
        ];
      }
    },
    methods: {
      $t,
      updateVal(nv) {
        if (!nv) {
          return;
        }
        let arrays = nv.split(" ");
        this.sVal = arrays[0];
        this.mVal = arrays[1];
        this.hVal = arrays[2];
        this.dVal = arrays[3];
        this.monthVal = arrays[4];
        this.weekVal = arrays[5];
        this.yearVal = arrays[6];
      },
      validateVal() {
        if (this.dVal === "?" && this.weekVal === "?") {
          this.$m("CORE_CLIENT.W084");
          if (this.activeName === "d") {
            this.weekVal = "*";
          } else {
            this.dVal = "*";
          }
        } else if (this.dVal !== "?" && this.weekVal !== "?") {
          this.$m("CORE_CLIENT.W084");
          if (this.activeName === "d") {
            this.weekVal = "?";
          } else {
            this.dVal = "?";
          }
        }
        let v = `${this.sVal} ${this.mVal} ${this.hVal} ${this.dVal} ${this.monthVal} ${this.weekVal} ${this.yearVal}`;
        if (v !== this.modelValue) {
          this.$emit("update:modelValue", v);
        }
        return v;
      }
    },
    created() {
      this.updateVal(this.modelValue);
    },
    components: {
      SecondAndMinute,
      hour,
      day,
      month,
      week,
      year
    }
  };
</script>

<style lang="scss" scoped>
  .cron {
    text-align: left;
    padding: 10px;
    background: #fff;
    border: 1px solid #dcdfe6;
    font-size: $fz;
    box-shadow:
      0 2px 4px 0 rgba(0, 0, 0, 0.12),
      0 0 6px 0 rgba(0, 0, 0, 0.04);
  }
</style>