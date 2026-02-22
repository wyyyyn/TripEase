# 用户预定流程 (移动端)

| 页面名 | 功能说明 | 权重分数 | 备注 |
|--------|---------|---------|------|
| 酒店查询页（首页） | 1. 顶部 Banner: 酒店的广告,点击后直接跳转该酒店的详情页<br>2. 核心查询区域:<br>&emsp;a. 当前地点(支持定位)<br>&emsp;b. 关键字搜索<br>&emsp;c. 酒店入住日期的选择<br>&emsp;d. 筛选条件(酒店星级或价格等)<br>&emsp;e. 快捷标签(见下方「搜索快捷标签」章节)<br>3. 查询按钮,点击后跳转到列表页 | 5 | 1. 入住日期需开发日历组件<br>2. 此处的筛选条件和快捷标签如有更好的用户体验可以自行定义. |
| 酒店列表页 | 1. 顶部核心条件筛选头:支持城市、入住 / 离店日期、入住间夜 及搜索设置<br>2. 详细筛选区域<br>3. 酒店列表 | 15 | 1. 详细筛选区域如有更好的用户体验可以自行定义.<br>2. 酒店列表需支持上滑自动加载功能<br>3. 酒店每一个列表项中的信息维度(酒店名/评分/地址/价格等)如有更好的用户体验可以自行定义. |
| 酒店详情页 | 1. 顶部导航头:显示酒店名称及返回列表页功能<br>2. 大图 Banner,支持左右滚动查看当前酒店提供的图片<br>3. 酒店基础信息呈现(酒店名/星级/设施/地址)<br>4. 日历+入间夜 Banner<br>5. 酒店当前房型价格列表 | 15 | 1. 下面截图中酒店基础信息中点评及地图可忽略不实现<br>2. 房型价格列表根据商户端的数据价格从低到高的排序 |

---

## 搜索快捷标签

搜索页表单底部展示一行横向滑动的快捷筛选标签，帮助用户一键缩小搜索范围。

### 标签分类

| 类型 | 说明 | 示例 |
|------|------|------|
| 静态标签 | 所有城市通用，运营后台可配置上下架和排序 | 上榜酒店、4.7分以上、免费接送机 |
| 动态标签 | 根据用户选择的目的地城市，展示该城市 1-2 个知名景点 | 上海 → 外滩附近、迪士尼附近<br>北京 → 故宫附近、环球影城附近 |

### 交互规则

1. 标签为 **单选切换**，点击激活/取消；激活后标签高亮，搜索结果自动附带该筛选条件
2. 景点标签点击后按地理围栏（默认半径 3km）筛选该景点附近的酒店
3. 末尾固定「更多筛选」入口，点击打开完整筛选面板
4. 标签总数控制在 **5-8 个**（静态 3 + 动态 2 + 更多筛选 1）

### 前端接口

```
GET /api/search/quick-tags?city={城市名}
```

**Response：**

```json
{
  "tags": [
    { "code": "top_ranked",   "label": "上榜酒店",   "icon": "emoji_events",   "iconColor": "text-accent",    "type": "static" },
    { "code": "high_rating",  "label": "4.7分以上",   "icon": "star",           "iconColor": "text-amber-500", "type": "static" },
    { "code": "free_shuttle", "label": "免费接送机",  "icon": "airport_shuttle", "iconColor": null,             "type": "static" },
    { "code": "landmark_1",   "label": "外滩附近",    "icon": "location_city",   "iconColor": null,             "type": "dynamic", "landmarkId": 1 },
    { "code": "landmark_2",   "label": "迪士尼附近",  "icon": "attractions",     "iconColor": null,             "type": "dynamic", "landmarkId": 2 }
  ]
}
```

### 数据模型

#### cities — 城市表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| name | VARCHAR(50) UNIQUE | 城市名：上海、北京 |
| pinyin | VARCHAR(100) | 拼音，用于模糊搜索 |
| lat / lng | DECIMAL(10,7) | 城市中心坐标 |
| is_hot | BOOLEAN | 热门城市标记 |
| sort_order | INT | 展示排序 |

#### city_landmarks — 城市知名景点

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| city_id | BIGINT FK → cities | 所属城市 |
| name | VARCHAR(100) | 景点原名：外滩 |
| label | VARCHAR(100) | 标签显示文案：外滩附近 |
| icon | VARCHAR(50) | Material Symbol 图标名 |
| lat / lng | DECIMAL(10,7) | 景点坐标 |
| radius_km | DECIMAL(5,2) DEFAULT 3.00 | 筛选半径（公里） |
| sort_order | INT | 同城市内排序 |
| is_active | BOOLEAN | 上下架控制 |

#### quick_tags — 快捷标签定义

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 自增主键 |
| code | VARCHAR(50) UNIQUE | 唯一标识：top_ranked, high_rating, free_shuttle, landmark |
| label | VARCHAR(50) | 前端显示文案 |
| icon | VARCHAR(50) | Material Symbol 图标名 |
| icon_color | VARCHAR(20) | 图标颜色 class |
| tag_type | ENUM('static','dynamic') | static = 全城市通用；dynamic = 从 city_landmarks 动态生成 |
| filter_key | VARCHAR(50) | 后端筛选字段映射（如 rating、amenity、landmark_id） |
| filter_value | VARCHAR(100) | 筛选值（如 4.7、free_shuttle） |
| sort_order | INT | 展示排序 |
| is_active | BOOLEAN | 上下架控制 |
