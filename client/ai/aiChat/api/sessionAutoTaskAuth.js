import request from "../../../common/utils/request";
import { $mW } from "../../../common/utils/globalConfig";

// 自动任务列表-个人
export function perListApi(query) {
  return request({
    url: "/skis/ai/auto-task/auth/per",
    method: "post",
    data: query
  });
}

// 自动任务列表-公司
export function cmpListApi(query) {
  return request({
    url: "/skis/ai/auto-task/auth/cmp",
    method: "post",
    data: query
  });
}

//自动任务-详情
export function getSessionTask(taskAuthId) {
  return request({
    url: "/skis/ai/chat/session/task/get/" + taskAuthId,
    method: "get"
  });
}

//自动任务-新增任务
// {groupCode,userId,title,bstp,nodeId,nodeName,skillCode,taskType,routerCode,skillInputParam,taskHourSeg,promptContent,taskStatus }
export function addSessionTask(data) {
  return request({
    url: "/skis/ai/chat/session/task/add",
    method: "post",
    data: data
  });
}

//自动任务-更改任务
// {taskAuthId,title,skillCode,taskType,skillInputParam,taskHourSeg,promptContent,taskStatus  }
export function updateSessionTask(data) {
  return request({
    url: "/skis/ai/chat/session/task/update",
    method: "post",
    data: data
  });
}

//自动任务-开启任务/关闭任务 {taskAuthId,taskStatus  }
export function updateSessionTaskStatus(data) {
  return request({
    url: "/skis/ai/chat/session/task/update/status",
    method: "post",
    data: data
  });
}
//自动任务-删除 { taskAuthId,deleFlag }
export function deleteSessionTask(data) {
  return request({
    url: "/skis/ai/chat/session/task/delete",
    method: "post",
    data: data
  });
}

//自动任务-技能检查是否存在
export function checkSessionTaskSkill(taskAuthId, skillCode) {
  if (!skillCode) return;
  checkSessionTaskSkillApi(taskAuthId, skillCode).then(res => {
    if (res.code === 200 && res.data.duplicated) {
      let msg = "";
      for (let i = 0; i < res.data.repeatList.length; i++) {
        let item = res.data.repeatList[i];
        if (!msg.includes(item.groupCode + ".")) msg += item.groupCode + "." + item.groupName + "; ";
      }
      $mW(["当前技能已被启用定时任务", msg]);
    }
  });
}

function checkSessionTaskSkillApi(taskAuthId, skillCode) {
  return request({
    url: "/skis/ai/chat/session/task/skill/check",
    method: "post",
    data: { taskAuthId, skillCode }
  });
}

// Skill 调用参数详情
export function getSkillMdmApi(skillCode) {
  return request({
    url: "/skis/ai/confige/skill/mdm/" + skillCode,
    method: "get"
  });
}
