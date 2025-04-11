import { getapi, postapi } from "../utils/http";

export const getroomapi = (data) => getapi("/luqiao/supervise/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);
/*
* 文库操作
* type	page（分页操作）, get（获取文件夹信息）, all（所有）, update（更新）, add（添加）, delete（删除）,tree（树形展示）,move（移动）,list（获取列表）
*/
export const postlibraryapi = (data) => postapi("/luqiao/supervise/reportInputController?common&id=801b54d933374f40912ab160e85ebc3d", data);
export const getdetailapi = (room_id) => getapi("/api/RoomApi/room/" + room_id);
export const getgame = () => getapi("/api/RoomApi/game");
export const getroom = (room_id) => getapi("/api/RoomApi/live/" + room_id);
