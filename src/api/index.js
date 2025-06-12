import {baseURL, getapi, postapi, postContentJSONPostApi} from "../utils/http";

export const getroomapi = (data) => getapi("/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);
/*
* 文库操作
* type	page（分页操作）, get（获取文件夹信息）, all（所有）, update（更新）, add（添加）, delete（删除）,tree（树形展示）,move（移动）,list（获取列表）
*/
export const postlibraryapi = (data) => postapi("/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);
/*
* 文件收藏
* type	page（分页查询，当前用户）all（所有收藏）add（添加收藏）delete（取消收藏）
* favorite_id
*/
export const postcollectapi = (data) => postapi("/reportInputController?common&id=4050a0a5134a49a6b7ea826198b6ea81", data);
/*
* 文件操作
* type	page(分页展示),get（id_,获取单个文件信息）,all（所有文件）,update（更新）,add（添加单个文件，多个文件循环添加，file_name,file_id,classification_id）,move（移动）,
  delete（逻辑删除）,realDelete（物理删除）,revert（还原）,recycleBin（回收站）
* favorite_id
*/

export const postFileapi = (data) => postapi("/reportInputController?common&id=32905c7ca6254ac9bd5eab45313ec029", data);
/*
* 文件上传
*
*/

export const postFileUpload = (data) => postapi("/system/file/fileUpload?code=&biz_type=CLOUD_DISK", data, {});
/*
* 文件下载,预览，编辑
*
*/

export const postDownloadFile = (data) => postapi("/jxload/bulid", data, {});

/*
* 部门公司列表
*
*/

export const postTreeDataByDemid = (data) => postapi("/org/org/getTreeDataByDemid", data, {});
/*
* 人员列表
*
*/

export const postUserListJson = (data) => postapi("/org/user/listJson", data, {});
/*
* 资料库文件夹权限配置
*
*/

export const postPermissionApi = (data) => postapi("/reportInputController?common&id=1c534328a32648e2b87b1b7fe638f674", data, {});

export const updatePermissionApi = (requestUrl, data) => postContentJSONPostApi(requestUrl, data, {});

/*
* 获取部门树权限
*
*/
export const getOrgTreeApi = (data) => getapi("/reportInputController?common&id=0e5e211791ab432f891cb97395f87e93", data);
/*
* 获取部门树权限
*
*/
export const getLogApi = (data) => postapi("/reportInputController?common&id=797e8725120c47c2a61807f1786b2967", data);

//    http://localhost:9015/luqiao/supervise/system/file/fileUpload?code=&biz_type=
//    `/luqiao/system/file/fileUpload?code=&biz_type=CLOUD_DISK`

export const uploadFileApi = baseURL + "system/file/fileUpload?code=&biz_type=CLOUD_DISK"


export const getFileAuthApi = (data) => postapi("/reportInputController?common&id=4b907bebe0114d70a5b9a984b6c8c530", data);

// 获取融资部的文件的接口等

// 获取文件审核的列表
