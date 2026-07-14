<template>
  <el-dialog
    style="max-height: 90%"
    id="shDialog"
    :title="winParams.title"
    v-model="winParams.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    @close="closeDialog('cancel')"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[winParams.pcWidth, winParams.pcHeight]" />
    <!-- 选项卡-帮助集 -->
    <div v-if="winParams.groupFlag">
      <el-tabs v-model="winParams.activeTabGroup" type="card" @tab-click="handleTabClick">
        <el-tab-pane v-for="(item, index) in selfParams.helpArr" :label="item.header.fieldName" :name="item.header.fieldCode" :key="index" />
      </el-tabs>
    </div>

    <!-- 查询条件 -->
    <el-form class="app-el-form" v-if="selectParams.length > 0" @submit.native.prevent>
      <el-row>
        <!-- 查询条件列数winParams.pcSelectCol 循环输出查询条件 更多筛选winParams.advancedSearch = 0仅显示第一行-->
        <template v-for="(item, index) in selectParams" :key="index">
          <el-col :span="24 / Number(winParams.pcSelectCol)" v-if="winParams.advancedSearch === 0 ? index < winParams.pcSelectCol : true">
            <el-form-item :label="$t(item.fieldName)">
              <!-- 基础字段下拉 -->
              <szd-select
                v-if="item.fieldHelpType === 'B'"
                v-model="item.fieldVal"
                :baseField="item.fieldHelpCode"
                :disabled="item.fieldDisplay"
                clearable
                @keyup.enter="getSearch" />
              <!-- 日期和日期时间 -->
              <szd-date
                v-else-if="['date', 'datetime'].includes(item.fieldDataType)"
                v-model="item.fieldVal"
                :type="item.fieldDataType"
                :disabled="item.fieldDisplay"
                clearable
                @keyup.enter="getSearch" />
              <!-- 时间 -->
              <szd-time
                v-else-if="item.fieldDataType === 'time'"
                v-model="item.fieldVal"
                :disabled="item.fieldDisplay"
                clearable
                @keyup.enter="getSearch" />
              <!-- 基础字段帮助 -->
              <szd-radio
                v-else-if="item.fieldDataType === 'boolean'"
                v-model="item.fieldVal"
                :baseArr="[
                  { svalue: 'A', sname: $t('全部') },
                  { svalue: '1', sname: $t('是') },
                  { svalue: '0', sname: $t('否') }
                ]"
                :disabled="item.fieldDisplay"
                @keyup.enter="getSearch" />
              <!-- 基础字段帮助 -->
              <szd-input
                v-else
                v-model="item.fieldVal"
                :type="item.fieldDataType"
                :disabled="item.fieldDisplay"
                :show-help="item.fieldHelpType === 'A' && item.fieldHelpCode"
                @help="szdSh({ a: item.fieldHelpCode, b: item, c: ['fieldVal-' + item.fieldHelpMap], f: item.fieldMode === 'IN' ? 6 : 1 })"
                clearable
                @keyup.enter="getSearch" />
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>

    <!-- 页标签 和 查询按钮 无常用值 winParams.commonFlag 且无查询条件selectParams.length 不输出-->
    <el-row class="tabBox" v-if="winParams.commonFlag || selectParams.length > 0">
      <!-- 页标签设置 -->
      <el-col :span="12" class="tabBoxCol">
        <div style="display: flex" v-if="winParams.commonFlag">
          <div class="tabBoxTab" :style="{ color: tabStyle.allFontColor }" @click="setTab(0)">{{ $t("所有值") }}</div>
          <div class="tabBoxTab" :style="{ color: tabStyle.comFontColor }" @click="setTab(1)">{{ $t("常用值") }}</div>
          <div class="tabBoxLine" :style="{ left: tabStyle.left }" />
        </div>
      </el-col>
      <!-- 查询按钮设置 selectParams.length<pcSelectCol 查询条件小于列数，不输出更多筛选 -->
      <el-col :span="12" class="searchBox" v-if="selectParams.length > 0 || winParams.jobCode">
        <szd-button v-if="selectParams.length > 0" label="搜索" type="primary" icon="Search" @click="getSearch" />
        <szd-button v-if="selectParams.length > 0" label="重置" type="primary" icon="Refresh" @click="setReset" />
        <szd-button v-if="winParams.jobCode" label="同步" type="primary" icon="Sort" @click="getSync" />
        <szd-button v-if="selectParams.length > winParams.pcSelectCol" label="更多筛选" type="primary" icon="DCaret" @click="setAdvancedSearch" />
      </el-col>
    </el-row>

    <!-- 数据输出 单元格双击事件 复选选择事件 排序事件 -->
    <el-table
      stripe
      border
      ref="refSearchHelpTable"
      :data="tableData"
      @cell-dblclick="handCellDblclick"
      @selection-change="handleSelectionChange"
      @sort-change="handleSort">
      <!-- 复选框 -->
      <el-table-column v-if="winParams.multipleChoice === 2" type="selection" align="center" width="55" />
      <!-- 数据列 -->
      <el-table-column
        v-for="(item, index) in columnParams"
        :key="index"
        :prop="item.fieldId"
        :label="$t(item.fieldName)"
        :min-width="item.fieldColWidthPc"
        :align="item.fieldColAlign"
        :sortable="item.fieldColSort" />
      <!-- 操作列输出 无常用值winParams.commonFlag不输出 添加常用之winParams.activeTab===0 -->
      <el-table-column v-if="winParams.commonFlag" :label="$t('操作')" align="center">
        <template v-slot="scope">
          <!-- 添加常用winParams.activeTab===0 -->
          <szd-button
            label="添加常用"
            type="primary"
            link
            @click="handleClickRowAdd(scope.row)"
            v-if="winParams.activeTab === 0"
            :disabled="scope.row.SZDcommonValFlagSZD === '1'" />
          <!-- 删除常用winParams.activeTab===0 -->
          <szd-button label="删除常用" type="primary" link @click="handleClickRowDel(scope.row, scope.$index)" v-if="winParams.activeTab === 1" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页设置 和 确定按钮 -->
    <template #footer>
      <div class="main-button">
        <div class="main-button-left" style="width: 70%">
          <szd-pagination
            v-if="!winParams.noPage"
            position="left"
            :total="page.total"
            v-model:page="page.pageNum"
            :page-sizes="page.pageSizes"
            v-model:limit="page.pageSize"
            @pagination="getSelectParams" />
        </div>
        <div class="main-button-right" style="width: 30%">
          <szd-button label="确定" v-if="winParams.multipleChoice === 2" type="primary" @click="okay" />
          <szd-button label="取消" type="primary" @click="cancel" />
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script>
  import { searchHelpList, addCommonValues, delCommonValues, syncMdm } from "../api/searchHelp.js";

  export default {
    props: ["selectKeys"],
    data() {
      return {
        //URL参数传入
        urlParams: {
          urlAll: "/core/common/sh/all/list", //所有值请求地址
          urlCom: "/core/common/sh/com/list" //常用值请求地址
        },
        //页签样式
        tabStyle: {
          allFontColor: "#1890ff", //所有值下划线
          comFontColor: "", //常用值
          left: "0px"
        },
        //窗口大小和参数
        winParams: {
          open: false,
          activeTab: 0, //0所有值 1常用值
          advancedSearch: 0, //更多查询条件

          activeTabGroup: "", //集标签
          multipleChoice: 1, //单选多选
          title: "搜索帮助", //窗口标题
          pcWidth: 1000, //窗口宽度
          pcHeight: 600, //窗口高度
          pcSelectCol: 2, //查询列
          commonFlag: true, //显示常用值
          noPage: false, //不启用分页
          urlCus: "", //自定义后端请求
          jobCode: "", //同步接口程序
          groupFlag: false, //帮助集
          baseField: "", //基础字段
          baseFixComFieldArr: [] //固定常用值字段
        },
        //页设置
        page: {
          total: 0, //总条数
          pageSizes: [], //分页大小
          pageSize: 20, //页大小
          pageNum: 1 //当前页
        },
        //排序列
        sortGroup: [
          {
            sortField: "", //排序字段
            sortType: "" //排序方式
          }
        ],
        //备份参数
        selfParams: {
          helpArr: [], //帮助数组
          objStyle: {} //样式
        },
        //搜索帮助
        objHelp: {},
        //查询条件
        selectParams: [],
        //查询结果列头
        columnParams: [],
        //输出数据
        tableData: [],
        //多选行
        listSel: [],
        //返回参数
        retParam: {
          defFieldId: ""
        }
      };
    },
    methods: {
      //接受数据
      getAcceptData(objParam) {
        this.objHelp = objParam;
        //窗口样式
        this.setStyles(this.objHelp.header);
        //设置查询条件
        this.setSelectParams(this.objHelp.filter);
        //设置表头列
        this.setColumnParams(this.objHelp.output);
        //设置固定常用值字段
        this.setBaseFixComFieldArr(this.objHelp.filter);
        //获取后台数据
        this.getSelectParams();
        this.winParams.open = true;
      },
      //设置窗口样式
      setStyles(header) {
        if (header.pcPageSizes) {
          try {
            this.page.pageSizes = JSON.parse(header.pcPageSizes);
            if (!Array.isArray(this.page.pageSizes) || this.page.pageSizes.length === 0) {
              this.page.pageSizes = [20, 50, 200, 500];
            }
          } catch (e) {
            this.page.pageSizes = [20, 50, 200, 500];
          }
        } else {
          this.page.pageSizes = [20, 50, 200, 500];
        }
        this.page.pageSize = this.page.pageSizes[0];
        this.page.pageNum = 1;

        this.winParams.pcSelectCol = header.pcSelectCol ? header.pcSelectCol : 2; //查询列
        this.winParams.commonFlag = header.commonFlag; //显示常用值
        this.winParams.noPage = header.noPage === true; //不启用分页
        this.winParams.urlCus = header.urlCus; //自定义后端请求
        this.winParams.jobCode = header.jobCode; //同步接口程序
        this.retParam.defFieldId = ""; //默认回填字段代码
      },
      //设置查询条件
      setSelectParams(filter) {
        this.selectParams = [];
        for (let i = 0; i < filter.length; i++) {
          let _fieldVal = filter[i].fieldVal ? filter[i].fieldVal : "";
          if (filter[i].fieldDataType === "boolean") {
            if (filter[i].fieldVal === true || filter[i].fieldVal === "true") {
              _fieldVal = "1";
            } else if (filter[i].fieldVal === false || filter[i].fieldVal === "false") {
              _fieldVal = "0";
            } else {
              _fieldVal = "A";
            }
          }
          this.selectParams.push({
            fieldId: filter[i].fieldId,
            fieldName: filter[i].fieldName,
            fieldVal: _fieldVal,
            fieldDataType: filter[i].fieldDataType,
            fieldMode: filter[i].fieldMode,
            fieldDisplay: filter[i].fieldDisplay,
            fieldHelpType: filter[i].fieldHelpType,
            fieldHelpCode: filter[i].fieldHelpCode,
            fieldHelpMap: filter[i].fieldHelpMap
          });
        }
      },
      //设置表列头赋值
      setColumnParams(output) {
        this.columnParams = [];
        for (let i = 0; i < output.length; i++) {
          if (output[i].fieldRetDef) {
            this.retParam.defFieldId = output[i].fieldId; //默认回填
          }
          if (!output[i].fieldColHide) {
            this.columnParams.push({
              fieldId: output[i].fieldId,
              fieldName: output[i].fieldName,
              fieldColWidthPc: output[i].fieldColWidthPc ? output[i].fieldColWidthPc : "", //列宽度
              fieldColAlign: output[i].fieldColAlign ? output[i].fieldColAlign : "", //对齐方式
              fieldColDetail: output[i].fieldColDetail ? output[i].fieldColDetail : false, //是否详情
              fieldColSort: output[i].fieldColSort //排序
            });
          }
          if (!this.retParam.defFieldId && this.columnParams.length > 0) {
            this.retParam.defFieldId = this.columnParams[0].fieldId;
          }
        }
      },
      //设置固定常用值字段
      setBaseFixComFieldArr(filter) {
        this.winParams.baseFixComFieldArr = [];
        for (let i = 0; i < filter.length; i++) {
          if (filter[i].fieldFixComWhere === true) this.winParams.baseFixComFieldArr.push(filter[i].fieldId);
        }
        if (this.winParams.baseFixComFieldArr.length > 0) this.winParams.baseFixComFieldArr.sort((a, b) => a - b);
      },

      /**************从后台获取数据列表******************/
      //后台查询数据-获取查询条件参数
      getSelectParams() {
        let arr = [];
        for (let i = 0; i < this.selectParams.length; i++) {
          let _paramValue = this.selectParams[i].fieldVal;
          if (this.selectParams[i].fieldDataType === "boolean") {
            _paramValue = this.selectParams[i].fieldVal === "0" ? false : this.selectParams[i].fieldVal === "1" ? true : "";
          }
          arr.push({
            paramName: this.selectParams[i].fieldId,
            paramValue: _paramValue,
            paramMode: this.selectParams[i].fieldMode,
            paramType: this.selectParams[i].fieldDataType
          });
        }
        let json = {
          baseField: this.winParams.baseField,
          baseFixComWhere: "",
          pageNum: this.page.pageNum,
          pageSize: this.page.pageSize,
          _paramGroup: arr,
          _sortGroup: this.sortGroup
        };
        this.getRequest(json);
      },
      //后台查询数据-获取清单
      getRequest(requestJson) {
        let url = "";
        this.tableData = [];
        if (this.winParams.activeTab === 0) {
          url = this.winParams.urlCus ? this.winParams.urlCus : this.urlParams.urlAll;
        } else {
          url = this.urlParams.urlCom;
        }
        requestJson.baseFixComWhere = this.getBaseFixComWhere();
        searchHelpList(requestJson, url).then(res => {
          if (res.code === 200) {
            this.tableData = res.rows;
            this.page.total = res.total;
            //设置选中行
            if (this.tableData && this.selectKeys && this.selectKeys.fKeyS && this.selectKeys.keys.length > 0) {
              this.$nextTick(() => {
                for (let i = 0; i < this.tableData.length; i++) {
                  let _row = this.tableData[i];
                  if (_row[this.selectKeys.fKeyS] && this.selectKeys.keys.includes(_row[this.selectKeys.fKeyS])) {
                    this.$refs.refSearchHelpTable.toggleRowSelection(_row, true);
                  }
                }
              });
            }
          }
        });
      },
      //页签切换(所有值和常用值)
      setTab(tab) {
        if (tab === this.winParams.activeTab) {
          return;
        }
        this.winParams.activeTab = tab;
        if (tab === 0) {
          this.tabStyle.left = 0 + "px";
          this.tabStyle.comFontColor = "";
          this.tabStyle.allFontColor = "#1890ff";
        } else if (tab === 1) {
          this.tabStyle.left = 60 + "px";
          this.tabStyle.comFontColor = "#1890ff";
          this.tabStyle.allFontColor = "";
        }
        this.getSelectParams();
      },

      /***********查询数据(查询、重置、更多筛选、同步数据)**************/
      //查询数据
      getSearch() {
        //点击搜索按钮要把页码重置为1
        this.page.pageNum = 1;
        this.getSelectParams();
      },
      //显示更多筛选
      setAdvancedSearch() {
        this.winParams.advancedSearch = this.winParams.advancedSearch === 0 ? 1 : 0;
      },
      //重置
      setReset() {
        //设置查询条件
        this.setSelectParams(this.objHelp.filter);
        this.getSearch();
      },
      //同步数据
      getSync() {
        syncMdm(this.winParams.baseField).then(res => {
          if (res.code === 200) {
            this.$m("CORE_CLIENT.S005"); //同步成功
            this.getSearch();
          }
        });
      },
      /***********事件处理(排序、多选、双击、确定)**************/
      //排序
      handleSort(column) {
        this.sortGroup[0].sortField = column.prop;
        this.sortGroup[0].sortType = column.order;
        this.getSelectParams();
      },
      //多选
      handleSelectionChange(val) {
        this.listSel = val;
      },
      //双击
      handCellDblclick(row) {
        let arr = [];
        arr.push(row);
        this.okayExitSearchHelp(arr);
      },
      //确定传输数据
      okay() {
        let _listSel = [];
        if (this.listSel.length > 0 && this.selectKeys && this.selectKeys.f !== 6 && this.selectKeys.fKeyS && this.selectKeys.keys.length > 0) {
          for (let i = 0; i < this.listSel.length; i++) {
            if (!this.selectKeys.keys.includes(this.listSel[i][this.selectKeys.fKeyS])) _listSel.push(this.listSel[i]);
          }
        } else {
          _listSel = this.listSel;
        }
        if (_listSel.length === 0) {
          this.$mE("请至少选择一行数据");
        } else {
          this.okayExitSearchHelp(_listSel);
        }
      },
      //返回选中值
      okayExitSearchHelp(selectRows) {
        this.$emit("exitSearchHelp", selectRows, this.winParams.baseField, this.retParam);
        this.winParams.open = false;
        this.closeDialog("okay");
      },
      // 关闭窗口
      cancel() {
        this.winParams.open = false;
        this.closeDialog("cancel");
      },
      //关闭窗口
      closeDialog(type) {
        this.$emit("closeDialog", type);
      },

      /***********常用值(添加、删除、固定常用值条件值)**************/
      //添加常用值
      handleClickRowAdd(row) {
        let params = {
          baseField: this.winParams.baseField,
          baseFixComWhere: this.getBaseFixComWhere(),
          fieldVal: JSON.stringify(row)
        };
        addCommonValues(params).then(res => {
          if (res.code === 200) {
            row.SZDcommonValFlagSZD = "1";
            this.$mS("添加成功");
          }
        });
      },
      //删除常用
      handleClickRowDel(row, index) {
        let params = {
          baseField: this.winParams.baseField,
          baseFixComWhere: this.getBaseFixComWhere(),
          fieldVal: JSON.stringify(row)
        };
        delCommonValues(params).then(res => {
          if (res.code === 200) {
            this.tableData.splice(index, 1);
            this.$mS("删除成功");
          }
        });
      },
      //获取固定常用值条件值
      getBaseFixComWhere() {
        let _baseFixComWhere = "N";
        if (this.winParams.baseFixComFieldArr.length > 0) {
          _baseFixComWhere = "Y";
          for (let i = 0; i < this.winParams.baseFixComFieldArr.length; i++) {
            const _fieldId = this.winParams.baseFixComFieldArr[i];
            const _selectObj = this.selectParams.find(r => r.fieldId === _fieldId);
            if (_selectObj) {
              let _paramValue = _selectObj.fieldVal ? _selectObj.fieldVal.toString() : "";
              _baseFixComWhere = _baseFixComWhere + ":" + _fieldId + "=" + _paramValue;
            }
          }
        }
        return _baseFixComWhere;
      },

      /************************搜索帮助集-选中当前搜索帮助**************************/
      //TAB标签搜索帮助切换事件
      handleTabClick(tab) {
        this.getReqParams(this.selfParams.helpArr, tab.paneName, this.selfParams.objStyle);
      },
      //获取配置参数文件 帮助数组,基础字段,样式
      getReqParams(helpArr, fieldCode, objStyle) {
        //记录历史值
        this.selfParams.helpArr = helpArr; //帮助数组
        this.selfParams.objStyle = objStyle; //样式

        this.winParams.activeTabGroup = fieldCode; //帮助集标签
        this.winParams.multipleChoice = objStyle.multipleChoice; //单选多选
        this.winParams.title = objStyle.title; //窗口标题
        this.winParams.pcWidth = objStyle.pcWidth; //窗口宽度
        this.winParams.pcHeight = objStyle.pcHeight; //窗口高度
        this.winParams.groupFlag = objStyle.groupFlag; //帮助集
        this.winParams.baseField = fieldCode; //基础字段

        //获得当前展示的屏幕信息
        let tempHelp = {};
        for (let i = 0; i < helpArr.length; i++) {
          if (helpArr[i].header.fieldCode === fieldCode) {
            tempHelp = helpArr[i];
            break;
          }
        }
        this.getAcceptData(tempHelp);
      }
    }
  };
</script>

<style scoped>
  .tabBox {
    border-bottom: 2px solid #dfe4ed;
    margin-bottom: 10px;
    display: flex;
  }

  .tabBoxCol {
    height: 40px;
    display: flex;
    position: relative;
  }

  .tabBoxTab {
    font-size: 12px;
    width: 50px;
    margin-right: 10px;
    text-align: justify;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 8px;
    font-weight: 600;
  }

  .tabBoxLine {
    background: #1890ff;
    width: 50px;
    height: 2px;
    position: absolute;
    bottom: -2px;
  }

  .searchBox {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .el-tabs--card :deep(.el-tabs__header .el-tabs__nav) {
    border-radius: 0 0 0 0;
    height: auto;
  }

  :deep(.el-tabs__header) {
    margin: 0 0 10px 0;
    height: auto;
  }

  .el-tabs--card :deep(.el-tabs__header) {
    border-bottom: 2px solid #dfe4ed;
  }

  :deep(.el-tabs--card .el-tabs__header .el-tabs__item.is-active) {
    border-bottom: 2px solid #1890ff;
  }
</style>
