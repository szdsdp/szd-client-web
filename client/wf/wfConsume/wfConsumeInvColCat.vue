<template>
  <!-- 列目录 -->
  <el-table-column label="业务小类" prop="bsub" min-width="250">
    <template v-slot:header>
      <szd-table-col-header required label="业务小类" />
    </template>
    <template v-slot="scope">
      <szd-input-desc
        v-model="scope.row.bsub"
        showHelp
        :help="{ a: 'CORE_BSUB01', b: scope.row, c: ['bsub', 'bsubName'], d: [['bstp', scope.row.bstp]] }"
        :desc="scope.row.bsubName"
        :descSpan="12" />
    </template>
  </el-table-column>
  <el-table-column :label="$t('发票号码')" prop="invNo" min-width="160" />
  <el-table-column :label="$t('票据类型')" prop="invTypeName" min-width="150" />
  <el-table-column :label="$t('发票日期')" prop="invDate" min-width="100" align="center" />
  <el-table-column :label="$t('金额')" prop="invAmt" min-width="100" align="right">
    <template v-slot="scope">
      <szd-dot v-model="scope.row.invAmt" :numDec="2" numDot />
    </template>
  </el-table-column>
  <el-table-column :label="$t('税额')" prop="invAmtTax" min-width="100" align="right">
    <template v-slot="scope">
      <szd-dot v-model="scope.row.invAmtTax" :numDec="2" numDot />
    </template>
  </el-table-column>
  <el-table-column :label="$t('金额(不含税)')" prop="invAmtNoTax" min-width="120" align="right">
    <template v-slot="scope">
      <szd-dot v-model="scope.row.invAmtNoTax" :numDec="2" numDot />
    </template>
  </el-table-column>
  <el-table-column :label="$t('税率')" prop="invTaxRate" min-width="80" align="center" />
  <el-table-column :label="$t('销方信息')" prop="sellerName" min-width="300" />
  <el-table-column :label="$t('纳税人识别号')" prop="sellerTaxNum" min-width="150" />
  <el-table-column :label="$t('座位等级')" prop="bsubPjName" min-width="120" />
  <el-table-column :label="$t('出发城市')" prop="startCityName" min-width="120" />
  <el-table-column :label="$t('到达城市')" prop="endCityName" min-width="120" />
  <el-table-column :label="$t('发票代码')" prop="invCode" min-width="150" />
  <el-table-column :label="$t('是否抵扣')" prop="invFlagName" min-width="120" />
</template>

<script setup>
  import { $t } from "../../common/utils/globalConfig";

  const props = defineProps({
    bussParam: {
      type: Object
    }
  });
</script>
