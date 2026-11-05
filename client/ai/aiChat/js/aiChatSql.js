import { $mList } from "../../../common/utils/globalConfig";

/**
 * 检查SQL
 * */
export function checkSql(skillSql, skillDbList, msgList) {
  let s = skillSql.trim();
  // 先提取字符串字面量，防止内容干扰注释移除和关键词检测
  const strLiterals = [];
  s = s.replace(/'(?:[^'\\]|\\.)*'/g, match => {
    strLiterals.push(match);
    return `__STR${strLiterals.length - 1}__`;
  });
  s = s.replace(/"(?:[^"\\]|\\.)*"/g, match => {
    strLiterals.push(match);
    return `__STR${strLiterals.length - 1}__`;
  });
  // 移除各类注释
  const cleanSql = s
    .replace(/\/\*[\s\S]*?\*\//g, "") // 块注释 /* */
    .replace(/--.*/g, "") // -- 单行注释
    .replace(/#.*/g, ""); // # mysql单行注释
  const sql = cleanSql.trim().toUpperCase();

  if (!sql.startsWith("SELECT")) {
    $mList(msgList, ["提示词-SQL技能仅允许SELECT查询语句，不允许INSERT、UPDATE、DELETE等操作数据库语法"]);
  }
  if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|MERGE|GRANT|REVOKE)\b/.test(sql)) {
    $mList(msgList, ["提示词-SQL语句中不允许包含写操作或数据库结构操作"]);
  }
  if (/\bUNION\b/.test(sql)) {
    $mList(msgList, ["提示词-SQL语句中不允许使用UNION联合查询"]);
  }
  if (/\bINTO\s+(OUTFILE|DUMPFILE)\b/.test(sql)) {
    $mList(msgList, ["提示词-SQL语句中不允许使用INTO导出文件"]);
  }
  if (/\bLOAD_FILE\s*\(/.test(sql)) {
    $mList(msgList, ["提示词-SQL语句中不允许使用LOAD_FILE读取文件"]);
  }
  if (/\b(SLEEP|BENCHMARK)\s*\(/.test(sql)) {
    $mList(msgList, ["提示词-SQL禁止使用SLEEP、BENCHMARK等耗时函数"]);
  }
  if (sql.includes(";")) {
    $mList(msgList, ["提示词-不允许执行多条SQL语句，禁止使用分号"]);
  }
  //获取SQL使用的表
  let tables = getSqlTables(sql);
  //检查是否可用数据表
  if (tables.length > 0) {
    for (let i = 0; i < tables.length; i++) {
      const rawTable = tables[i].trim();
      const tableName = rawTable.split(".").pop();
      const targetUpper = tableName.toUpperCase();

      const exist = skillDbList.some(r => r.tableCode.toUpperCase() === targetUpper);
      if (!exist) {
        $mList(msgList, [`提示词-SQL技能只能查询指定数据表，不允许访问：${rawTable}`]);
      }
    }
  }
}

/**
 * 获取SQL使用的表
 */
function getSqlTables(rawSql) {
  const tables = new Set();

  // 匹配 FROM 后多表 FROM a,b,c
  const fromMultiReg = /\bFROM\s+([\w.`]+(?:\s*,\s*[\w.`]+)+)/g;
  let m;
  while ((m = fromMultiReg.exec(rawSql)) !== null) {
    m[1].split(/\s*,\s*/).forEach(t => tables.add(t.replace(/[`]/g, "")));
  }

  // 匹配剩余单独 FROM 表（排除已经被多表正则捕获的内容）
  const fromSingleReg = /\bFROM\s+([\w.`]+)(?!\s*,)/g;
  while ((m = fromSingleReg.exec(rawSql)) !== null) {
    tables.add(m[1].replace(/[`]/g, ""));
  }

  // 匹配各类 JOIN
  const joinReg = /\b(?:INNER|LEFT|RIGHT|CROSS)\s+JOIN\s+([\w.`]+)|\bJOIN\s+([\w.`]+)/g;
  while ((m = joinReg.exec(rawSql)) !== null) {
    const tbl = m[1] || m[2];
    if (tbl) tables.add(tbl.replace(/[`]/g, ""));
  }

  // 匹配子查询后逗号表 FROM (sub) alias, t2
  const subCommaReg = /\)\s*\w+\s*,\s*([\w.`]+)/g;
  while ((m = subCommaReg.exec(rawSql)) !== null) {
    tables.add(m[1].replace(/[`]/g, ""));
  }

  return [...tables];
}
