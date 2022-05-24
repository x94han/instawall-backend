/**
 *
 * @param {*} obj 要被過濾的物件
 * @param {string[]} allowKeys 要留下的 key
 * @returns 過濾後的物件
 */

module.exports = (obj, allowKeys) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowKeys.includes(key)) filteredObj[key] = obj[key];
  });
  return filteredObj;
};
