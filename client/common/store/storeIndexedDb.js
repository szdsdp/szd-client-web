class storeIndexedDb {
  constructor() {
    this.dbName = "SZD_CORE_DB";
    this.db = null;
  }

  /**
   * 打开数据库和创建数据表和索引
   * @param {Array} tableList 数据库表清单
   * @param {Number} version 数据库版本
   */
  connectDb(tableList = [], version = 1) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve({ status: false, message: `当前浏览器不支持IndexedDB` });
        console.error("当前浏览器不支持IndexedDB");
        return;
      }
      if (!this.db || tableList.length !== 0) this.db = null;
      // 打开数据库
      const request = indexedDB.open(this.dbName, version);
      // 创建数据库
      request.onupgradeneeded = e => {
        for (let i = 0; i < tableList.length; i++) {
          const item = tableList[i];
          this.createTable(e.target.result, item.tableCode, item.tablePk, item.tableIdx);
        }
      };
      // 数据库连接成功
      request.onsuccess = () => {
        this.db = request.result;
        resolve({ status: true, message: `数据库连接成功` });
      };
      // 数据库连接失败
      request.onerror = () => {
        console.error("数据库连接失败:", request.error);
        resolve({ status: false, message: `数据库连接成功:${request.error}` });
      };
    });
  }

  /**
   * 仅内部调用-创建数据表和索引
   * @param dbInstance 数据库连接池
   * @param {String} tableCode 数据库表代码
   * @param {Object} tablePk 表主键
   * @param {String} tablePk.keyPath 主键
   * @param {Boolean} tablePk.autoIncrement 自增
   * @param {Array} tableIdx 表索引 [{name：索引代码,keyPath：索引（字符串或数组）}]
   */
  createTable(dbInstance, tableCode, tablePk, tableIdx = []) {
    if (!tableCode) return;
    if (!dbInstance.objectStoreNames.contains(tableCode)) {
      // 创建表
      let _optionsParam = { keyPath: tablePk.keyPath, autoIncrement: tablePk.autoIncrement === true };
      const dbStore = dbInstance.createObjectStore(tableCode, _optionsParam);
      // 创建索引
      for (let i = 0; i < tableIdx.length; i++) {
        const item = tableIdx[i];
        dbStore.createIndex(item.name, item.key, item.options || { unique: false });
      }
    }
  }

  /**
   * 查询
   * @param {String} tableCode 表名
   * @param {Object} condition 查询条件（可选）
   * @param {String} condition.type 类型：'PK'（主键）| 'index'（批量）
   * @param {String} condition.key 主键值/索引名
   * @param {any} condition.option 操作类型 精准匹配（=）| 前缀 （PRE） | 范围匹配（>=、<=、>、<） | 区间匹配 （BT.包含条件值,BTN.不包含条件值）
   * @param {any} condition.value 查询值
   * @param {any} condition.btMin 查询值
   * @param {any} condition.btMax 查询值
   * @returns {Promise} 查询结果
   */
  selectList(tableCode, condition) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ status: false, message: `请先调用connectDb打开数据库` });
        return;
      }
      if (!this.db.objectStoreNames.contains(tableCode)) {
        resolve({ status: false, message: `数据库表不存在` });
        return;
      }

      const transaction = this.db.transaction([tableCode], "readonly");
      const store = transaction.objectStore(tableCode);
      let request;

      // 构建范围查询条件（IDBKeyRange）
      if (condition && condition.type === "PK") {
        request = store.get(condition.value);
      } else if (!condition) {
        request = store.getAll();
      } else {
        if (!condition.key) {
          console.error(`表${tableCode}索引不能为空`);
          resolve({ status: false, message: `表${tableCode}索引不能为空` });
          return;
        }
        if (!store.indexNames.contains(condition.key)) {
          console.error(`表${tableCode}索引${condition.key}不存在`);
          resolve({ status: false, message: `表${tableCode}索引${condition.key}不存在` });
          return;
        }
        let range = null;
        if (condition.option === "=") {
          range = IDBKeyRange.only(condition.value);
        } else if (condition.option === ">=" || condition.option === ">") {
          range = IDBKeyRange.lowerBound(condition.value, condition.option === ">=");
        } else if (condition.option === "<=" || condition.option === "<") {
          range = IDBKeyRange.upperBound(condition.value, condition.option === "<=");
        } else if (condition.option === "BT" || condition.option === "BTN" || condition.option === "BTMIN" || condition.option === "BTMAX") {
          range = IDBKeyRange.bound(
            condition.btMin,
            condition.btMax,
            ["BTN", "BTMAX"].includes(condition.option),
            ["BTN", "BTMIN"].includes(condition.option)
          );
        } else if (condition.option === "PRE") {
          range = IDBKeyRange.bound(condition.value, condition.value + "\uFFFF", false, false);
        } else {
          console.error(`表${tableCode}查询条件操作符不存在`);
          resolve({ status: false, message: `表${tableCode}查询条件操作符不存在`, data: null });
          return;
        }
        request = store.index(condition.key).getAll(range);
      }

      request.onsuccess = e => {
        const result = e.target.result;
        resolve({ status: true, message: `查询到${result.length}条数据`, data: result });
      };

      request.onerror = e => {
        resolve({ status: false, message: `查询数据失败：${e.target.error.message}`, data: null });
      };
    });
  }

  /**
   * 保存数据（主键存在则覆盖，不存在则新增）
   * @param {String} tableCode 表名
   * @param {Object} data 要保存的数据（必须包含主键字段）
   * @returns {Promise} 保存结果
   */
  saveData(tableCode, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ status: false, message: `请先调用connectDb打开数据库` });
        return;
      }
      if (!this.db.objectStoreNames.contains(tableCode)) {
        resolve({ status: false, message: `数据库表不存在` });
        return;
      }

      // 开启读写事务
      const transaction = this.db.transaction([tableCode], "readwrite");
      const store = transaction.objectStore(tableCode);

      // 保存数据（put：新增/覆盖；add：仅新增，主键重复报错）
      const request = store.put(data);

      request.onsuccess = () => {
        resolve({ status: true, message: `数据保存成功` });
      };

      request.onerror = e => {
        resolve({ status: false, message: `数据保存失败：${e.target.error.message}` });
      };
    });
  }

  /**
   * 删除数据（支持主键删除/索引条件批量删除）
   * @param {String} tableCode 表名
   * @param {Object} condition 查询条件（可选）
   * @param {String} condition.type 类型：'PK'（主键）| 'index'（批量）
   * @param {String} condition.key 主键值/索引名
   * @param {String} condition.option 操作类型 精准匹配（=）| 前缀 （PRE） | 范围匹配（>=、<=、>、<） | 区间匹配 （BT.包含条件值,BTN.不包含条件值）
   * @param {any} condition.value 查询值
   * @param {any} condition.btMin 查询值
   * @param {any} condition.btMax 查询值
   * @returns {Promise} 删除结果
   */
  deleteData(tableCode, condition) {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        resolve({ status: false, message: `请先调用connectDb打开数据库` });
        return;
      }
      if (!this.db.objectStoreNames.contains(tableCode)) {
        resolve({ status: false, message: `数据库表不存在` });
        return;
      }

      const transaction = this.db.transaction([tableCode], "readwrite");
      const store = transaction.objectStore(tableCode);

      // 主键删除
      if (condition && condition.type === "PK") {
        const request = store.delete(condition.value);
        request.onsuccess = () => {
          resolve({ status: true, message: `数据删除成功` });
        };
        request.onerror = e => {
          resolve({ status: true, message: `数据删除失败：${e.target.error.message}` });
        };
      } else {
        try {
          // 查询数据
          const queryResult = await this.selectList(tableCode, condition);
          if (queryResult.status === false || !queryResult.data) {
            resolve({ status: false, message: `数据删除失败：${queryResult.message}` });
            return;
          }
          if (queryResult.data.length === 0) {
            resolve({ status: true, message: "无需要删除的数据" });
            return;
          }
          // 删除每条数据
          queryResult.data.forEach(item => {
            store.delete(item[store.keyPath]);
          });
          resolve({ status: true, message: `成功删除${queryResult.data.length}条数据` });
        } catch (err) {
          resolve({ status: true, message: `删除失败：${err}` });
        }
      }
    });
  }

  /**
   * 清空所有数据
   * @param {String} tableCode 表名
   * @returns {Promise} 清空结果
   */
  clearTable(tableCode) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ status: false, message: `请先调用connectDb打开数据库` });
        return;
      }
      if (!this.db.objectStoreNames.contains(tableCode)) {
        resolve({ status: false, message: `数据库表不存在` });
        return;
      }
      const transaction = this.db.transaction([tableCode], "readwrite");
      const store = transaction.objectStore(tableCode);
      const request = store.clear();
      request.onsuccess = () => {
        resolve({ status: true, message: `清空表数据成功` });
      };
      request.onerror = e => {
        reject({ status: true, message: `清空表数据失败：${e.target.error.message}` });
      };
    });
  }

  /**
   * 删除表
   * @param {String} tableCode 表名
   * @param {Number} version 数据库版本
   * @returns {Promise} 删除结果
   */
  dropTable(tableCode, version = 1) {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        resolve({ status: false, message: `当前浏览器不支持IndexedDB` });
        console.error("当前浏览器不支持IndexedDB");
        return;
      }
      // 打开数据库
      const request = indexedDB.open(this.dbName, version);
      // 删除数据库
      request.onupgradeneeded = e => {
        if (e.target.result.objectStoreNames.contains(tableCode)) {
          e.target.result.deleteObjectStore(tableCode);
        }
      };
      resolve({ status: true, message: `表${tableCode}删除成功` });
    });
  }

  /**
   * 关闭数据库
   */
  closeDb() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default storeIndexedDb;
