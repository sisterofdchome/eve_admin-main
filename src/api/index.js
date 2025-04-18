import { getapi, postapi } from "../utils/http";

export const getroomapi = (data) => getapi("/supervise/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);
/*
* 文库操作
* type	page（分页操作）, get（获取文件夹信息）, all（所有）, update（更新）, add（添加）, delete（删除）,tree（树形展示）,move（移动）,list（获取列表）
*/
export const postlibraryapi = (data) => postapi("/supervise/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);

/*
* 文件收藏
* type	page（分页查询，当前用户）all（所有收藏）add（添加收藏）delete（取消收藏）
* favorite_id
*/
export const postcollectapi = (data) => postapi("/supervise/reportInputController?common&id=4050a0a5134a49a6b7ea826198b6ea81", data);


/*
* 文件操作
* type	page(分页展示),get（id_,获取单个文件信息）,all（所有文件）,update（更新）,add（添加单个文件，多个文件循环添加，file_name,file_id,classification_id）,move（移动）,
  delete（逻辑删除）,realDelete（物理删除）,revert（还原）,recycleBin（回收站）
* favorite_id
*/

export const postFileapi = (data) => postapi("/supervise/reportInputController?common&id=32905c7ca6254ac9bd5eab45313ec029", data);

/*
* 文件上传
*
*/

export const postFileUpload = (data) => postapi("/system/file/fileUpload?code=&biz_type=CLOUD_DISK", data, {});
