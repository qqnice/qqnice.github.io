import {auditLensDesign} from './auditLens.js';
import {battleDesign} from './promptBattle.js';
export const chapters=[
 {title:'鎮門廣場',description:'沿石板路尋找鎮門守衛，走訪小鎮居民與地標。驚嘆號指引主線，靠近人物會出現互動提示。',control:'方向鍵移動，E 鍵交談'},
 {title:'便利通行契約',description:'閱讀鎮門捲軸，檢視預先勾選的第三方共享條款，決定如何取得通行許可。',control:'捲動條款，調整勾選並簽署'},
 {title:'商人的秘密',description:'從報價牌與商人對話看見授權的後果，比對商品價格與背包資訊。',control:'查看報價，開啟日誌比對'},
 auditLensDesign,battleDesign
];
