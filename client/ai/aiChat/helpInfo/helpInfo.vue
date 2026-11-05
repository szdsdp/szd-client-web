<template>
  <el-dialog
    :title="$t('AI 会话交互流程')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['80%', '85%']" />
    <div class="help-info">
      <!-- 流程总览图 -->
      <div class="flow-overview">
        <div class="flow-overview__header">
          <h3>AI 流程总览</h3>
          <div class="flow-legend">
            <span class="flow-legend__item"><span class="flow-legend__dot flow-legend__dot--user"></span>用户操作</span>
            <span class="flow-legend__item"><span class="flow-legend__dot flow-legend__dot--system"></span>系统自动</span>
            <span class="flow-legend__item"><span class="flow-legend__dot flow-legend__dot--ai"></span>AI 处理</span>
          </div>
        </div>

        <!-- 双栏布局：交互模式 + 自动任务 -->
        <div class="flow-dual">
          <!-- 左栏：交互模式 -->
          <div class="flow-lane">
            <div class="flow-lane__label flow-lane__label--user">👤 交互模式</div>
            <div class="flow-lane__nodes">
              <div class="flow-node flow-node--system">
                <div class="flow-node__num">1</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">加载数据</div>
                  <div class="flow-node__desc">页面数据 + 页面字段</div>
                </div>
                <div class="flow-node__tag flow-node__tag--system">系统自动</div>
              </div>
              <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
              <div class="flow-node flow-node--user">
                <div class="flow-node__num">2</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">编写内容</div>
                  <div class="flow-node__desc">文本 / 语音 / 提示词</div>
                </div>
                <div class="flow-node__tag flow-node__tag--user">用户操作</div>
              </div>
              <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
              <div class="flow-node flow-node--user">
                <div class="flow-node__num">3</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">上传附件</div>
                  <div class="flow-node__desc">点击 / 粘贴 / 拖拽</div>
                </div>
                <div class="flow-node__tag flow-node__tag--user">用户操作</div>
              </div>
              <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
              <div class="flow-node flow-node--user">
                <div class="flow-node__num">4</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">功能选择</div>
                  <div class="flow-node__desc">会话 / 采集 / 审批 / 分析等</div>
                </div>
                <div class="flow-node__tags">
                  <div class="flow-node__tag flow-node__tag--user">用户操作</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右栏：自动任务 -->
          <div class="flow-lane">
            <div class="flow-lane__label flow-lane__label--system">⏱️ 自动模式</div>
            <div class="flow-lane__nodes">
              <div class="flow-node flow-node--user">
                <div class="flow-node__num flow-node__num--letter">A</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">任务授权</div>
                  <div class="flow-node__desc">Skill + 提示词 + 时段</div>
                </div>
                <div class="flow-node__tag flow-node__tag--user">用户设定</div>
              </div>
              <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
              <div class="flow-node flow-node--system">
                <div class="flow-node__num flow-node__num--letter">B</div>
                <div class="flow-node__body">
                  <div class="flow-node__title">定时触发</div>
                  <div class="flow-node__desc">业务数据 + 业务字段</div>
                </div>
                <div class="flow-node__tag flow-node__tag--system">系统自动</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下行箭头 -->
        <div class="flow-down-arrow">
          <span class="flow-down-arrow__line"></span>
          <span class="flow-down-arrow__head"></span>
          <span class="flow-down-arrow__text">
            <span class="flow-down-arrow__hint">两种模式共享</span>
            推送Agent：会话内容 + 业务数据 + 附件内容 + 功能按钮
          </span>
        </div>

        <!-- 共享步骤：5→6→7 -->
        <div class="flow-row">
          <div class="flow-node flow-node--system">
            <div class="flow-node__num">5</div>
            <div class="flow-node__body">
              <div class="flow-node__title">推送Agent</div>
              <div class="flow-node__desc">内容 + 数据 + 附件</div>
            </div>
            <div class="flow-node__tag flow-node__tag--system">系统自动</div>
          </div>
          <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
          <div class="flow-node flow-node--system">
            <div class="flow-node__num">6</div>
            <div class="flow-node__body">
              <div class="flow-node__title">Agent组装</div>
              <div class="flow-node__desc">知识库 + 规范 + 上下文</div>
            </div>
            <div class="flow-node__tag flow-node__tag--system">系统自动</div>
          </div>
          <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
          <div class="flow-node flow-node--ai">
            <div class="flow-node__num">7</div>
            <div class="flow-node__body">
              <div class="flow-node__title">多模态大模型</div>
              <div class="flow-node__desc">内容 + 数据 + 规范 + ...</div>
            </div>
            <div class="flow-node__tag flow-node__tag--ai">AI 处理</div>
          </div>
        </div>

        <!-- 下行箭头 -->
        <div class="flow-down-arrow">
          <span class="flow-down-arrow__line"></span>
          <span class="flow-down-arrow__head"></span>
          <span class="flow-down-arrow__text">结果返回：内容 / 数据 / 完成</span>
        </div>

        <!-- 结果确认 -->
        <div class="flow-row flow-row--center">
          <div class="flow-node flow-node--user flow-node--wide">
            <div class="flow-node__num">8</div>
            <div class="flow-node__body">
              <div class="flow-node__title">结果确认</div>
              <div class="flow-node__desc">内容 / 采集 / 审批 / 技能 / 推送</div>
            </div>
            <div class="flow-node__tags">
              <div class="flow-node__tag flow-node__tag--user">用户操作</div>
              <div class="flow-node__tag flow-node__tag--system">系统自动</div>
            </div>
          </div>
        </div>

        <!-- 下行箭头 -->
        <div class="flow-down-arrow">
          <span class="flow-down-arrow__line"></span>
          <span class="flow-down-arrow__head"></span>
          <span class="flow-down-arrow__text">结果推送：分析结果 → 推送待办</span>
        </div>

        <!-- 推送分发与确认关闭 -->
        <div class="flow-row">
          <div class="flow-node flow-node--system flow-node--wide">
            <div class="flow-node__num">9</div>
            <div class="flow-node__body">
              <div class="flow-node__title">推送待办</div>
              <div class="flow-node__desc">未读任务 + 推送工单 + 工单提交</div>
            </div>
            <div class="flow-node__tags">
              <div class="flow-node__tag flow-node__tag--system">系统自动</div>
              <div class="flow-node__tag flow-node__tag--user">用户操作</div>
            </div>
          </div>
          <div class="flow-arrow"><span class="flow-arrow__line"></span><span class="flow-arrow__head"></span></div>
          <div class="flow-node flow-node--user flow-node--wide">
            <div class="flow-node__num">10</div>
            <div class="flow-node__body">
              <div class="flow-node__title">确认关闭</div>
              <div class="flow-node__desc">用户确认 → 任务关闭</div>
            </div>
            <div class="flow-node__tag flow-node__tag--user">用户操作</div>
          </div>
        </div>
      </div>

      <!-- 详细流程 -->
      <div class="steps-title">
        <h3>AI 流程详情</h3>
      </div>

      <!-- ========== 交互模式流程 ========== -->
      <div class="step-section">
        <span class="step-section__badge step-section__badge--user">交互模式流程</span>
        <span class="step-section__desc">用户实时与 AI 交互</span>
      </div>

      <el-timeline>
        <!-- 步骤1: AI助手加载页面数据 -->
        <el-timeline-item timestamp="Step 1" placement="top" type="warning" size="large">
          <el-card shadow="hover" class="step-card step-card--system">
            <div class="step-header">
              <span class="step-badge step-badge--system">🖥️ 系统</span>
              <h3>1. AI 自动加载页面数据与页面字段</h3>
            </div>
            <p class="step-desc">用户开启 AI 功能时，组件自动采集当前页面数据与页面字段，为 AI 推理提供场景上下文支撑。</p>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📦 页面数据</span></template>
                  <ul>
                    <li>会话勾选「包含业务数据」，页面数据才会推送至 AI，严控数据访问边界，保障数据安全</li>
                    <li>报表类数据分析支持分页、分批次拉取数据并推送 AI<code>[开发工程师增强AI回调]</code></li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🏷️ 页面字段</span></template>
                  <ul>
                    <li>帮助 AI 精准识别、解读页面各项数据的业务含义</li>
                    <li>页面字段是自动采集的必要条件<code>[开发工程师配置字段]</code></li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤2: 用户编写会话内容 -->
        <el-timeline-item timestamp="Step 2" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>2. 编写会话内容</h3>
            </div>
            <p class="step-desc">用户可在输入框撰写对话指令发送至 AI，平台提供三类便捷输入方式，适配不同使用场景。</p>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">⌨️ 文本输入</span></template>
                  <ul>
                    <li>在输入框直接手动录入文字指令</li>
                    <li>支持 Enter 快捷键一键发送消息</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🎤 语音输入</span></template>
                  <ul>
                    <li>长按麦克风按钮进行语音录制</li>
                    <li>松开按键自动完成语音转文字录入</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📝 提示词快选</span></template>
                  <ul>
                    <li>点击「提示词」按钮直接选用预置模板</li>
                    <li><code>[支持终端用户自定义常用提示词]</code></li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤3: 按需上传附件 -->
        <el-timeline-item timestamp="Step 3" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>3. 按需上传附件</h3>
            </div>
            <p class="step-desc">用户按需上传附件，附件将随对话消息一并提交至 AI， AI 完成解析处理，平台兼容各类主流文件格式。</p>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header>
                    <span class="card-title">
                      <el-icon><Paperclip /></el-icon> 点击选择
                    </span>
                  </template>
                  <ul>
                    <li>点击界面回形针附件图标选取本地文件，支持文件批量上传</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📋 粘贴上传</span></template>
                  <ul>
                    <li>复制文件至系统剪贴板后，在对话输入区域直接粘贴即可完成文件上传</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🖱️ 拖拽上传</span></template>
                  <ul>
                    <li>将本地文件直接拖动至消息输入区域，即可完成快捷上传</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤4: 选择功能按钮 -->
        <el-timeline-item timestamp="Step 4" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>4. 选择功能按钮</h3>
            </div>
            <p class="step-desc">
              功能按钮管控 AI 数据处理逻辑与输出样式，绑定定制业务规则，用户在发送对话内容前选定目标按钮，即可触发预设的 AI 业务能力。
            </p>
            <h4>📌 功能按钮</h4>
            <el-card shadow="never" class="inner-card">
              <ul>
                <li>按钮支持自定义创建、编辑与管理，可按会话组场景分配使用</li>
                <li>按钮可配置专属业务规范，若未配置规则，则使用平台默认规则</li>
                <li>支持自定义录入业务规则，结合业务场景按需新增功能按钮及规范</li>
                <li>功能按钮必须绑定功能模式，平台根据功能模式执行不同逻辑处理</li>
              </ul>
            </el-card>

            <h4 style="margin-top: 16px">📋 内置功能模式列表</h4>
            <el-table :data="btnCodeList" border stripe size="small">
              <el-table-column prop="mode" label="模式代码" width="150" align="center" />
              <el-table-column prop="name" label="模式名称" width="150" align="center" />
              <el-table-column prop="desc" label="模式说明" />
            </el-table>

            <div class="step-note">
              <el-icon><Warning /></el-icon>
              <span>默认使用"普通会话"模式，选择其它按钮后 AI 将按照约定格式输出结果</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- ========== 自动任务流程（并行分支） ========== -->
      <div class="step-section">
        <span class="step-section__badge step-section__badge--system">自动任务流程</span>
        <span class="step-section__desc">与交互模式并行，任务授权、定时执行</span>
      </div>

      <el-timeline>
        <!-- 步骤A: 任务授权 -->
        <el-timeline-item timestamp="Step A" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>A. 任务授权配置</h3>
            </div>
            <p class="step-desc">
              用户在自动任务配置模块完成任务参数配置，定义 AI
              自动化执行的触发条件、运行规则、业务逻辑。平台支持两类自动化任务：数据分析推送、智能审批任务。
            </p>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🗂️ 数据分析推送</span></template>
                  <ul>
                    <li>指定业务技能，配置提示词、任务单类型、是否自动提交等，设定任务执行时间</li>
                  </ul>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📝 智能审批任务</span></template>
                  <ul>
                    <li>在审批单据详情页点击 AI 功能按钮，自动带入审批节点，录入审批规则提示词，设定任务执行时间</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤B: 定时触发自动执行 -->
        <el-timeline-item timestamp="Step B" placement="top" type="warning" size="large">
          <el-card shadow="hover" class="step-card step-card--system">
            <div class="step-header">
              <span class="step-badge step-badge--system">🖥️ 系统</span>
              <h3>B. 定时触发自动执行</h3>
            </div>
            <p class="step-desc">系统依据用户在【任务授权配置】中预设的执行时段，自动调度任务，拉取对应业务数据源，推送 AI 推理分析。</p>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🔄 全流程无人值守</span></template>
                  <ul>
                    <li>任务从触发、数据拉取、AI 运算、结果输出/推送全程自动化</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🔁 能力复用性强</span></template>
                  <ul>
                    <li>采用前端调试完成的功能参数，提示词、模型参数、输出格式无需二次配置，保障会话与自动任务逻辑一致，结果可对齐核验</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📋 全链路日志留存</span></template>
                  <ul>
                    <li>每次任务的触发时间、入参数据、AI 执行过程、输出结果、异常报错完整落库</li>
                    <li>可在「自动任务记录」中回溯详情、排查异常、导出执行台账</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
            <div class="step-note">
              <el-icon><Warning /></el-icon>
              <span>自动任务全程无需用户干预，执行过程完整记录，可在"自动任务记录"中查看详情</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- ========== 共享流程（两种模式汇合） ========== -->
      <div class="step-section">
        <span class="step-section__badge step-section__badge--ai">共享 AI 分析流程</span>
        <span class="step-section__desc">交互模式与自动任务汇合，共同进入 AI 分析链路</span>
      </div>

      <el-timeline>
        <!-- 步骤5: 推送数据给Agent -->
        <el-timeline-item timestamp="Step 5" placement="top" type="warning" size="large">
          <el-card shadow="hover" class="step-card step-card--system">
            <div class="step-header">
              <span class="step-badge step-badge--system">🤖 Agent</span>
              <h3>5. 推送数据给 Agent</h3>
            </div>
            <p class="step-desc">前端将所有数据打包，推送给 Agent 处理。</p>
            <div class="context-assembly">
              <el-tag type="success" effect="plain" class="ctx-tag">用户消息</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="warning" effect="plain" class="ctx-tag">页面数据</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="warning" effect="plain" class="ctx-tag">页面字段</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="success" effect="plain" class="ctx-tag">附件信息</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="success" effect="plain" class="ctx-tag">功能按钮</el-tag>
            </div>
          </el-card>
        </el-timeline-item>

        <!-- 步骤6: Agent加载知识与规范 -->
        <el-timeline-item timestamp="Step 6" placement="top" type="warning" size="large">
          <el-card shadow="hover" class="step-card step-card--system">
            <div class="step-header">
              <span class="step-badge step-badge--system">🤖 Agent</span>
              <h3>6. Agent 加载知识库与规范</h3>
            </div>
            <p class="step-desc">Agent 接收请求后，按功能按钮按需加载相关的知识库、业务规范和约定规则，构建完整的上下文环境。</p>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📚 知识库（业务事实支撑底座）</span></template>
                  <ul>
                    <li>
                      <strong>公司知识库</strong> —
                      企业全局公共资料、管理制度、产品手册、行业资料、历史项目案例等，作为全员通用的事实依据与业务参考素材
                    </li>
                    <li><strong>个人知识库</strong> — 员工私有文档、个人业务台账、专属业务资料，支撑个性化问答、私人办公辅助等定制化场景</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📏 业务规范（业务行为刚性约束）</span></template>
                  <ul>
                    <li><strong>公司业务规范</strong> — 企业硬性业务规则、审批红线、业务禁止条款、标准化流程要求，保证业务执行口径一致</li>
                    <li><strong>个人业务规范</strong> — 用户自定义回复风格、话术习惯、固定排版格式、个性化业务约束，适配个人使用偏好</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="16" style="margin-top: 12px">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📌 会话主题规范（对话场景定向约束）</span></template>
                  <ul>
                    <li>配置会话专属主题提示词，锁定单主体对话核心业务场景</li>
                    <li>明确 AI 角色定位、应答立场、沟通语气，统一整场对话的 AI 人设与应答基调</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🔘 按钮规范（功能精准会话管控）</span></template>
                  <ul>
                    <li>根据前端传入功能按钮匹配固定输出格式</li>
                    <li>限定功能用途：数据采集、流程审批、技能调用、数据分析等专项能力约束</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🌐 全局规范（底层合规兜底管控）</span></template>
                  <ul>
                    <li>设置系统级基础提示词、默认 AI 基础人设；</li>
                    <li>统一全局输出格式标准、内容安全风控、敏感信息拦截、合规校验规则，全场景强制生效。</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤7: 结合上下文推送给多模态大模型 -->
        <el-timeline-item timestamp="Step 7" placement="top" type="danger" size="large">
          <el-card shadow="hover" class="step-card step-card--ai">
            <div class="step-header">
              <span class="step-badge step-badge--ai">🤖 Agent</span>
              <h3>7. 结合上下文推送给多模态大模型</h3>
            </div>
            <p class="step-desc">Agent 将用户消息、页面数据、知识库内容、业务规范和约定规则组装成完整的Prompt，发起推理请求至多模态大模型。</p>
            <div class="context-assembly">
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--convention">全局规范</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--knowledge">公司知识库</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--knowledge">个人知识库</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--convention">功能按钮</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--rule">个人业务规范</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--rule">公司业务规范</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="info" effect="plain" class="ctx-tag ctx-tag--topic">会话主题规范</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="warning" effect="plain" class="ctx-tag">页面字段</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="warning" effect="plain" class="ctx-tag">页面数据</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="success" effect="plain" class="ctx-tag">附件信息</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="success" effect="plain" class="ctx-tag">用户消息</el-tag>
              <span class="ctx-plus">+</span>
              <el-tag type="success" effect="plain" class="ctx-tag">历史会话</el-tag>
              <span class="ctx-eq">=</span>
              <el-tag type="danger" effect="dark" class="ctx-tag ctx-tag--final">完整 Prompt → 多模态大模型</el-tag>
            </div>
          </el-card>
        </el-timeline-item>

        <!-- 步骤8: 多模态大模型返回结果 -->
        <el-timeline-item timestamp="Step 8" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>8. 多模态大模型返回约定结果 → 用户确认与操作</h3>
            </div>
            <p class="step-desc">
              多模态大模型按照预设格式输出推理结果，由 Agent
              实时推送至前端页面；前端完成报文解析、可视化渲染后，交由用户完成内容审阅、业务确认、指令执行或是多轮二次对话交互。
            </p>

            <h4>📋 后续确认与操作</h4>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">💬 普通对话 / 数据分析</span></template>
                  <p>AI 输出 Markdown 格式文本内容，前端直接渲染排版展示，用于常规问答、文案解读、结论阅览等信息查阅场景</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🔧 技能调用</span></template>
                  <p>
                    AI 输出可执行业务技能 → 前端生成交互确认按钮 → 用户完成操作确认 → 统搭载确认指令与完整对话上下文发起新一轮 AI
                    请求，实现业务技能端到端闭环调用
                  </p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📊 数据采集</span></template>
                  <p>AI 输出结构化数据 → 前端自动解析，映射到页面表单字段 → 用户核对数据后确认采集，实现表单智能填充</p>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="16" style="margin-top: 12px">
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">✅ 智能审批</span></template>
                  <p>AI 结合既定业务规则完成数据研判，输出审批结论 → 用户复核确认 → 系统自动完成单据流转、审批归档，实现业务流程智能化审批</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🗂️ 数据分析推送</span></template>
                  <p>AI 结合业务规则，输出业务数据分析结论与工单推送建议 → 用户审核确认 → 系统直接触达工单创建、业务推送动作</p>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">🔄 循环交互</span></template>
                  <p>支持递进式多轮对话迭代，用户动态修改需求、补充素材，上下文留存复用，可手动中断流式生成，适配深度研讨、方案迭代场景</p>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>

        <!-- 步骤9: 推送分发 -->
        <el-timeline-item timestamp="Step 9" placement="top" type="warning" size="large">
          <el-card shadow="hover" class="step-card step-card--system">
            <div class="step-header">
              <span class="step-badge step-badge--system">🖥️ 系统</span>
              <h3>9. 推送待办</h3>
            </div>
            <p class="step-desc">AI 返回结果后，系统自动分析判断结论，推送执行结果提醒用户，并将待处理事项分发给对应待办人员。</p>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📤 结果提醒</span></template>
                  <ul>
                    <li>标记已完成的智能任务为未读状态，主动提醒运营人员及时复核、核验 AI 输出的业务处置结论，规避漏审风险。</li>
                  </ul>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="never" class="inner-card">
                  <template #header><span class="card-title">📋 待办分发</span></template>
                  <ul>
                    <li>AI 数据分析产出的业务结论，自动生成待办工单，并定向推送至对应负责人，由负责人承接开展后续业务落地、进度跟踪</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>

            <div class="step-note">
              <el-icon><Warning /></el-icon>
              <span>
                自动化任务进行聚合统计，实时计算未读任务总量、AI 生成待办工单数量，将数据展示在用户工作台首页，全局任务一目了然、重点事项前置提醒
              </span>
            </div>
          </el-card>
        </el-timeline-item>

        <!-- 步骤10: 确认关闭 -->
        <el-timeline-item timestamp="Step 10" placement="top" type="primary" size="large">
          <el-card shadow="hover" class="step-card step-card--user">
            <div class="step-header">
              <span class="step-badge step-badge--user">👤 用户</span>
              <h3>10. 任务确认与关闭</h3>
            </div>
            <p class="step-desc">经办人完成 AI 业务处置结果核验，审核通过则直接将任务标记已读或完成，完成整条业务链路闭环。</p>
            <div class="step-note">
              <el-icon><Warning /></el-icon>
              <span>
                若 AI 输出结论存在偏差、执行结果有误，操作人员可即时优化调整 Prompt 提示词，迭代优化模型输出质量，实现业务任务闭环 +
                模型效果迭代双落地。
              </span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";

  const dg = ref({
    open: false
  });

  const btnCodeList = ref([
    { mode: "chat", name: "普通会话", desc: "默认模式、无提示词；如需定制化效果，可按业务场景维护提示词" },
    {
      mode: "collect",
      name: "数据采集",
      desc: "页面字段支持在路由中配置或在程序中编码，AI 按照页面字段转换成采集的数据，点击自动采集回填页面数据"
    },
    { mode: "approve", name: "智能审批", desc: "AI 根据提示词解析业务单据，生成审批结果和审批意见，自动或人工确认触发审批" },
    {
      mode: "skill_api",
      name: "调用技能",
      desc: "在会话组预设业务技能库，AI 自主判断匹配所需技能、转换接口入参，推送至前端等待用户确认执行【skill_api_confirm】"
    },
    { mode: "skill_api_confirm", name: "调用技能确认", desc: "用户确认技能执行，发起二次对话，Agent 执行接口调用，并推送 AI 分析" },
    { mode: "skill_sql", name: "智能SQL", desc: "AI 解析提示词，生成 SQL 查询语句，自动触发 SQL 查询" },
    { mode: "analy", name: "数据分析", desc: "AI 针对业务数据进行分析，输出分析结论" },
    { mode: "analy_send", name: "数据分析推送", desc: "AI 数据分析完成后，自动将分析报告推送至指定人员，自动生成任务工单" }
  ]);

  const callHelpInfo = () => {
    dg.value.open = true;
  };

  defineExpose({
    callHelpInfo
  });
</script>

<style scoped lang="scss">
  .help-info {
    padding: 0 12px;
    max-height: 100%;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 4px;

      &:hover {
        background-color: #909399;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f2f6fc;
      border-radius: 4px;
    }

    // ========== 流程总览 ==========
    .flow-overview {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: fit-content;
      background-color: #fafbfc;
      border: 1px solid #ebeef5;
      border-radius: 12px;
      padding: 20px 24px 24px;
      margin-bottom: 4px;

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 20px;
        padding-bottom: 14px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .flow-legend {
      display: flex;
      gap: 20px;

      &__item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #606266;
      }

      &__dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;

        &--user {
          background-color: #409eff;
          box-shadow: 0 0 5px rgba(64, 158, 255, 0.4);
        }

        &--system {
          background-color: #e6a23c;
          box-shadow: 0 0 5px rgba(230, 162, 60, 0.4);
        }

        &--ai {
          background-color: #9b59b6;
          box-shadow: 0 0 5px rgba(155, 89, 182, 0.4);
        }
      }
    }

    .flow-row {
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 0;
      flex-shrink: 0;

      &--center {
        justify-content: center;
      }
    }

    // ========== 双栏布局 ==========
    .flow-dual {
      display: flex;
      gap: 16px;
      justify-content: center;
      align-items: stretch;
      margin-bottom: 4px;
      flex-shrink: 0;
    }

    .flow-lane {
      border-radius: 12px;
      padding: 36px 16px 14px;
      position: relative;
      width: fit-content;

      &__label {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        font-weight: bold;
        padding: 2px 14px;
        border-radius: 10px;
        white-space: nowrap;

        &--user {
          background-color: rgba(64, 158, 255, 0.1);
          color: #409eff;
          border: 1px solid rgba(64, 158, 255, 0.2);
        }

        &--system {
          background-color: rgba(230, 162, 60, 0.1);
          color: #e6a23c;
          border: 1px solid rgba(230, 162, 60, 0.2);
        }
      }

      &__nodes {
        display: flex;
        align-items: stretch;
        justify-content: center;
        gap: 0;

        .flow-node {
          width: 140px;
          min-width: unset;
          max-width: unset;
          padding: 10px 10px 8px;
        }

        .flow-arrow__line {
          width: 20px;
        }
      }

      &:first-child {
        background-color: rgba(64, 158, 255, 0.02);
        border: 1px solid rgba(64, 158, 255, 0.1);
      }

      &:last-child {
        background-color: rgba(230, 162, 60, 0.02);
        border: 1px solid rgba(230, 162, 60, 0.1);
      }
    }

    .flow-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 16px 12px;
      border-radius: 12px;
      width: 140px;
      min-width: unset;
      max-width: unset;
      position: relative;
      transition:
        transform 0.25s,
        box-shadow 0.25s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      }

      &--user {
        background-color: #f8fbff;
        border: 1px solid #d4e7fa;
        box-shadow: 0 2px 6px rgba(64, 158, 255, 0.08);

        .flow-node__title {
          color: #3d8fd6;
        }
      }

      &--system {
        background-color: #fffdf8;
        border: 1px solid #f0e2c8;
        box-shadow: 0 2px 6px rgba(230, 162, 60, 0.08);

        .flow-node__title {
          color: #b88a28;
        }
      }

      &--ai {
        background-color: #fcf8ff;
        border: 1px solid #e2d0f0;
        box-shadow: 0 2px 6px rgba(155, 89, 182, 0.08);

        .flow-node__title {
          color: #8a4fad;
        }
      }

      &__num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: bold;
        margin-bottom: 8px;
        background-color: #909399;
        color: #fff;
      }
      &__body {
        text-align: center;
        flex: 1;
      }

      &__title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 4px;
        white-space: nowrap;
      }

      &__desc {
        font-size: 11px;
        color: #909399;
        white-space: nowrap;
        line-height: 16px;
      }

      &__tag {
        margin-top: 8px;
        font-size: 10px;
        padding: 2px 10px;
        border-radius: 10px;
        font-weight: bold;
        white-space: nowrap;

        &--user {
          background-color: rgba(64, 158, 255, 0.1);
          color: #409eff;
        }

        &--system {
          background-color: rgba(230, 162, 60, 0.1);
          color: #e6a23c;
        }

        &--ai {
          background-color: rgba(155, 89, 182, 0.1);
          color: #9b59b6;
        }
      }

      &__tags {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
    }

    .flow-node--wide {
      width: 180px;
    }

    .flow-arrow {
      display: flex;
      align-items: center;
      padding: 0 4px;
      flex-shrink: 0;

      &__line {
        width: 28px;
        height: 2px;
        background: linear-gradient(90deg, #c0c4cc, #909399);
        border-radius: 1px;
      }

      &__head {
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 8px solid #909399;
      }
    }

    .flow-down-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;

      &__line {
        width: 2px;
        height: 12px;
        background: linear-gradient(180deg, #c0c4cc, #909399);
        border-radius: 1px;
      }

      &__head {
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #909399;
      }

      &__text {
        font-size: 12px;
        color: #606266;
        background-color: #f5f7fa;
        padding: 6px 16px;
        border-radius: 20px;
        margin-top: 6px;
        font-weight: 500;
        border: 1px solid #e4e7ed;
        letter-spacing: 0.3px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        text-align: center;
        line-height: 1.6;
      }

      &__hint {
        display: block;
        font-size: 11px;
        color: #909399;
        font-weight: normal;
        margin-bottom: 2px;
      }
    }

    // ========== 详细步骤 ==========
    .steps-title {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin: 12px 0 8px;
      padding: 0 4px 12px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      &__sub {
        font-size: 12px;
        color: #909399;
      }
    }

    :deep(.el-timeline) {
      padding-left: 0;
      margin-left: 4px;

      .el-timeline-item__wrapper {
        padding-left: 20px;
      }

      .el-timeline-item__timestamp {
        font-size: 12px;
        font-weight: 600;
      }
    }

    .step-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0 14px !important;
      padding: 8px 12px;
      background-color: #f8f9fb;
      border-radius: 8px;
      border: 1px solid #ebeef5;

      &__badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 14px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        letter-spacing: 0.5px;

        &--user {
          background-color: #ecf5ff;
          color: #409eff;
          border: 1px solid #b3d8ff;
        }

        &--system {
          background-color: #fdf6ec;
          color: #e6a23c;
          border: 1px solid #f5dab1;
        }

        &--ai {
          background-color: #f3e8ff;
          color: #9b59b6;
          border: 1px solid #d9c2f0;
        }
      }

      &__desc {
        font-size: 12px;
        color: #909399;
        white-space: nowrap;
      }
    }

    h3 {
      margin: 0 0 10px;
      font-size: 14px;
      color: #303133;
    }

    h4 {
      margin: 0 0 10px;
      font-size: 13px;
      color: #303133;
    }

    .step-desc {
      margin: 0 0 12px;
      line-height: 22px;
      color: #606266;
      font-size: 13px;
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .step-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;

      &--user {
        background-color: #ecf5ff;
        color: #409eff;
        border: 1px solid #b3d8ff;
      }

      &--system {
        background-color: #fdf6ec;
        color: #e6a23c;
        border: 1px solid #f5dab1;
      }

      &--ai {
        background-color: #f3e8ff;
        color: #9b59b6;
        border: 1px solid #d9c2f0;
      }
    }

    .step-card {
      border-left-width: 3px;
      border-left-style: solid;
      border-radius: 8px;

      :deep(.el-card__body) {
        padding: 16px 20px;
      }

      &--user {
        border-left-color: #409eff;
      }

      &--system {
        border-left-color: #e6a23c;
      }

      &--ai {
        border-left-color: #9b59b6;
      }
    }

    .inner-card {
      background-color: #fafbfc;
      border-radius: 6px;
      border: 1px solid #ebeef5;
      overflow: hidden;

      :deep(.el-card__header) {
        padding: 7px 14px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #ebeef5;
      }

      :deep(.el-card__body) {
        padding: 10px 14px;
      }
    }

    .card-title {
      font-size: 12px;
      font-weight: bold;
      color: #303133;
    }

    ul {
      margin: 0;
      padding-left: 18px;

      li {
        line-height: 24px;
        color: #606266;
        font-size: 13px;
      }
    }

    p {
      margin: 4px 0;
      line-height: 22px;
      color: #606266;
      font-size: 13px;
    }

    code {
      background-color: #f4f4f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      color: #409eff;
    }

    .step-note {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 16px;
      background: linear-gradient(90deg, rgba(253, 246, 236, 0.8), rgba(253, 246, 236, 0.4));
      border: 1px solid #f5e6c8;
      border-radius: 8px;
      font-size: 13px;
      color: #b8820a;
    }

    // ========== 上下文组装 ==========
    .context-assembly {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background-color: #f8f9fb;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      margin-top: 12px;

      .ctx-tag {
        font-size: 12px;

        &--topic {
          color: #5c6bc0;
          border-color: #9fa8da;
        }

        &--knowledge {
          color: #1976d2;
          border-color: #90caf9;
        }

        &--rule {
          color: #e65100;
          border-color: #ffcc80;
        }

        &--convention {
          color: #7b1fa2;
          border-color: #ce93d8;
        }

        &--final {
          font-size: 13px;
          font-weight: bold;
        }
      }

      .ctx-plus {
        color: #c0c4cc;
        font-weight: bold;
        font-size: 14px;
      }

      .ctx-eq {
        color: #f56c6c;
        font-weight: bold;
        font-size: 18px;
      }
    }
  }
</style>
