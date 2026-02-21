import type { Hotel, SearchParams } from '../types/hotel';

export const defaultSearch: SearchParams = {
  city: '上海',
  citySubtext: '当前定位',
  checkIn: '2月24日',
  checkInDay: '周一',
  checkOut: '2月26日',
  checkOutDay: '周三',
  nights: 2,
  guests: 2,
  keyword: '',
};

export const hotels: Hotel[] = [
  {
    id: '1',
    name: '上海安曼纳卓悦酒店',
    rating: 4.8,
    reviewCount: 7494,
    address: '莫干山路步行1.8公里',
    distanceFromCenter: '距市中心2.3公里',
    pricePerNight: 658,
    originalPrice: 1045,
    currency: '¥',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    tags: ['豪华', '泳池', 'Spa'],
    amenities: ['免费WiFi', '泳池', '餐厅', '健身房', 'Spa', '停车场', '行李寄存', '24小时前台', '洗衣服务', '商务中心', '会议室', '接机服务'],
    starRating: 5,
    badge: '限时特惠',
    badgeColor: 'red',
    rooms: [
      {
        id: 'r1',
        name: '豪华大床房',
        description: '宽敞明亮的大床房，配备高品质寝具和现代设施，可欣赏城市景观。',
        pricePerNight: 658,
        originalPrice: 820,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=400&q=80',
        bedType: '大床',
        size: '32m²',
        badge: '免费取消',
        badgeColor: 'green',
        features: ['含早餐', '免费WiFi'],
      },
      {
        id: 'r2',
        name: '行政双床房',
        description: '精致双床房，优质寝具，大窗采光，豪华浴室。',
        pricePerNight: 858,
        originalPrice: 1050,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
        bedType: '双床',
        size: '45m²',
        badge: '含早餐',
        badgeColor: 'accent',
        features: ['行政酒廊', '免费WiFi'],
      },
      {
        id: 'r3',
        name: '行政套房',
        description: '顶层套房，独立客厅，全景城市景观，行政酒廊特权。',
        pricePerNight: 1580,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
        bedType: '大床',
        size: '68m²',
        badge: '人气之选',
        badgeColor: 'purple',
        features: ['行政酒廊', '管家服务'],
      },
      {
        id: 'r4',
        name: '总统套房',
        description: '极致奢华体验，私人餐厅、管家服务与按摩浴缸。',
        pricePerNight: 3880,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1609766418204-94aae0ecef68?w=400&q=80',
        bedType: '大床',
        size: '120m²',
        badge: '管家服务',
        badgeColor: 'orange',
        features: ['按摩浴缸', '管家服务'],
      },
    ],
  },
  {
    id: '2',
    name: '上海静安洲际酒店',
    rating: 4.7,
    reviewCount: 10234,
    address: '静安区',
    distanceFromCenter: '距市中心0.5公里',
    pricePerNight: 968,
    currency: '¥',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    ],
    tags: ['精品', '环保'],
    amenities: ['免费WiFi', '泳池', '中式餐厅', '健身房', '下午茶', '城市夜景'],
    starRating: 5,
    badge: '人气之选',
    badgeColor: 'dark',
    rooms: [
      {
        id: 'r5',
        name: '高级大床房',
        description: '精心设计的大床房，现代风格装饰，城市景观。',
        pricePerNight: 968,
        originalPrice: 1200,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=400&q=80',
        bedType: '大床',
        size: '35m²',
        badge: '免费取消',
        badgeColor: 'green',
        features: ['含早餐', '免费WiFi'],
      },
      {
        id: 'r6',
        name: '豪华套房',
        description: '宽敞套房，独立起居室，全景落地窗。',
        pricePerNight: 1880,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
        bedType: '大床',
        size: '72m²',
        badge: '含早餐',
        badgeColor: 'accent',
        features: ['行政酒廊', '免费迷你吧'],
      },
    ],
  },
  {
    id: '3',
    name: '全季酒店(上海江宁路地铁站店)',
    rating: 4.5,
    reviewCount: 1590,
    address: '外滩',
    distanceFromCenter: '地铁直达',
    pricePerNight: 480,
    originalPrice: 619,
    currency: '¥',
    images: [
      'https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=800&q=80',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80',
    ],
    tags: ['免费取消', '免费WiFi'],
    amenities: ['免费WiFi', '免费停车', '无障碍', '自助服务', '机器人服务'],
    starRating: 4,
    badgeColor: 'green',
    rooms: [
      {
        id: 'r7',
        name: '标准大床房',
        description: '温馨舒适的大床房，简约设计，配备齐全设施。',
        pricePerNight: 480,
        originalPrice: 619,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
        bedType: '大床',
        size: '25m²',
        badge: '超值优选',
        badgeColor: 'green',
        features: ['免费WiFi'],
      },
    ],
  },
  {
    id: '4',
    name: '上海静安洲际行政公寓',
    rating: 4.6,
    reviewCount: 3771,
    address: '静安区南京西路',
    distanceFromCenter: '距市中心1.2公里',
    pricePerNight: 780,
    originalPrice: 980,
    currency: '¥',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
    tags: ['公寓', '长住优惠'],
    amenities: ['免费WiFi', '厨房', '洗衣机', '健身房', '游泳池'],
    starRating: 4,
    rooms: [
      {
        id: 'r8',
        name: '一居室公寓',
        description: '独立厨房和客厅，适合商旅和长住客人。',
        pricePerNight: 780,
        originalPrice: 980,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=400&q=80',
        bedType: '大床',
        size: '55m²',
        badge: '长住优惠',
        badgeColor: 'accent',
        features: ['厨房', '洗衣机'],
      },
    ],
  },
  {
    id: '5',
    name: '上海外滩华尔道夫酒店',
    rating: 4.9,
    reviewCount: 5210,
    address: '外滩中山东一路2号',
    distanceFromCenter: '外滩核心',
    pricePerNight: 2380,
    originalPrice: 2980,
    currency: '¥',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    tags: ['奢华', '外滩景观', 'Spa'],
    amenities: ['免费WiFi', '泳池', '米其林餐厅', '健身房', 'Spa', '管家服务', '行政酒廊'],
    starRating: 5,
    badge: '尊享特惠',
    badgeColor: 'accent',
    rooms: [
      {
        id: 'r9',
        name: '外滩景观房',
        description: '可将外滩天际线尽收眼底的奢华客房。',
        pricePerNight: 2380,
        originalPrice: 2980,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
        bedType: '大床',
        size: '48m²',
        badge: '免费取消',
        badgeColor: 'green',
        features: ['含早餐', '行政酒廊'],
      },
      {
        id: 'r10',
        name: '外滩套房',
        description: '超大套房，180度外滩全景，独立会客厅。',
        pricePerNight: 4880,
        currency: '¥',
        image: 'https://images.unsplash.com/photo-1609766418204-94aae0ecef68?w=400&q=80',
        bedType: '大床',
        size: '95m²',
        badge: '管家服务',
        badgeColor: 'orange',
        features: ['管家服务', '行政酒廊', '含早晚餐'],
      },
    ],
  },
];

export const categories = [
  { icon: 'family_restroom', label: '亲子' },
  { icon: 'diamond', label: '豪华' },
  { icon: 'local_parking', label: '停车' },
  { icon: 'pool', label: '泳池' },
  { icon: 'pets', label: '宠物友好' },
  { icon: 'spa', label: 'Spa' },
];

export const filterTags = [
  { label: '智能排序', icon: 'expand_more', active: true },
  { label: '价格', icon: 'expand_more', active: false },
  { label: '评分4.5+', active: false },
  { label: '含早餐', active: false },
  { label: '免费取消', active: false },
  { label: '距离', active: false },
];

export const recentSearches = [
  { city: '北京', dates: '2月10日 - 2月13日', guests: '2位成人' },
  { city: '杭州', dates: '1月25日 - 1月28日', guests: '1位成人' },
];

export const featuredHotel = {
  name: '上海外滩华尔道夫酒店',
  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  rating: 4.9,
  reviewCount: 5210,
  discount: '8折优惠',
};

// Tab categories
export const homeTabs = [
  { key: 'hotel', label: '酒店', icon: 'apartment' },
  { key: 'homestay', label: '民宿', icon: 'cottage' },
  { key: 'hourly', label: '钟点房', icon: 'schedule' },
] as const;

export type HomeTabKey = (typeof homeTabs)[number]['key'];

// Banner slide type
type BannerSlide = { id: string; name: string; image: string; rating: number; reviewCount: number; badge: string; subtitle: string };
type PopularHotel = { id: string; image: string; name: string; city: string; dates: string; price: number; nights: number; rating: number };
type EditorPick = { id: string; image: string; name: string; price: number; rating: number };

// Banner carousel slides per tab
export const bannersByTab: Record<HomeTabKey, BannerSlide[]> = {
  hotel: [
    {
      id: '5',
      name: '上海外滩华尔道夫酒店',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      rating: 4.9,
      reviewCount: 5210,
      badge: '春日尊享 8折',
      subtitle: '外滩景观·米其林晚宴·Spa礼遇',
    },
    {
      id: '2',
      name: '上海静安洲际酒店',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      rating: 4.7,
      reviewCount: 10234,
      badge: '连住3晚减600',
      subtitle: '城市天际线·行政酒廊·双人下午茶',
    },
    {
      id: '1',
      name: '上海安曼纳卓悦酒店',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      rating: 4.8,
      reviewCount: 7494,
      badge: '亲子套餐立减',
      subtitle: '无边泳池·儿童乐园·家庭套房',
    },
  ],
  homestay: [
    {
      id: 'hs1',
      name: '莫干山竹林隐居',
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      rating: 4.9,
      reviewCount: 3280,
      badge: '春日特惠',
      subtitle: '山景竹屋·私汤温泉·管家服务',
    },
    {
      id: 'hs2',
      name: '大理古城白族庭院',
      image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80',
      rating: 4.8,
      reviewCount: 2150,
      badge: '连住立减200',
      subtitle: '苍山洱海·古城漫步·手作体验',
    },
    {
      id: 'hs3',
      name: '安吉帐篷客野奢',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      rating: 4.7,
      reviewCount: 1890,
      badge: '亲子首选',
      subtitle: '竹海星空·户外营地·采茶体验',
    },
  ],
  hourly: [
    {
      id: 'hr1',
      name: '上海虹桥亚朵酒店',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=800&q=80',
      rating: 4.6,
      reviewCount: 4520,
      badge: '4h ¥128起',
      subtitle: '高铁直达·即刻入住·安静休息',
    },
    {
      id: 'hr2',
      name: '浦东机场CitiGO',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      rating: 4.5,
      reviewCount: 3100,
      badge: '中转首选 ¥99',
      subtitle: '机场步行5分钟·24h自助·行李寄存',
    },
    {
      id: 'hr3',
      name: '南京路全季钟点房',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      rating: 4.4,
      reviewCount: 2680,
      badge: '午休特惠 ¥68',
      subtitle: '地铁上盖·品质午休·灵活时段',
    },
  ],
};

// Keep legacy export for backward compat
export const bannerSlides = bannersByTab.hotel;

// Popular hotels per tab
export const popularByTab: Record<HomeTabKey, PopularHotel[]> = {
  hotel: [
    { id: 'ph1', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80', name: '外滩景观套房', city: '上海', dates: '3月15–17日', price: 1280, nights: 2, rating: 4.95 },
    { id: 'ph2', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', name: '故宫旁精品酒店', city: '北京', dates: '3月20–22日', price: 980, nights: 2, rating: 4.92 },
    { id: 'ph3', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80', name: '西湖畔五星酒店', city: '杭州', dates: '4月1–3日', price: 860, nights: 2, rating: 4.88 },
    { id: 'ph4', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80', name: '鼓浪屿海景酒店', city: '厦门', dates: '3月28–30日', price: 1560, nights: 2, rating: 4.91 },
    { id: 'ph5', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', name: '太古里设计师酒店', city: '成都', dates: '4月5–7日', price: 720, nights: 2, rating: 4.87 },
  ],
  homestay: [
    { id: 'phs1', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&q=80', name: '竹林独栋别墅', city: '莫干山', dates: '3月15–17日', price: 680, nights: 2, rating: 4.96 },
    { id: 'phs2', image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&q=80', name: '洱海边白族小院', city: '大理', dates: '3月22–24日', price: 420, nights: 2, rating: 4.93 },
    { id: 'phs3', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80', name: '海景悬崖民宿', city: '厦门', dates: '4月3–5日', price: 550, nights: 2, rating: 4.89 },
    { id: 'phs4', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80', name: '古镇河畔小筑', city: '丽江', dates: '4月8–10日', price: 380, nights: 2, rating: 4.91 },
    { id: 'phs5', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80', name: '山谷树屋营地', city: '安吉', dates: '4月12–14日', price: 760, nights: 2, rating: 4.88 },
  ],
  hourly: [
    { id: 'phr1', image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=600&q=80', name: '虹桥站亚朵', city: '上海', dates: '随时可订', price: 128, nights: 0, rating: 4.6 },
    { id: 'phr2', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', name: '浦东机场CitiGO', city: '上海', dates: '随时可订', price: 99, nights: 0, rating: 4.5 },
    { id: 'phr3', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80', name: '南京路全季', city: '上海', dates: '随时可订', price: 68, nights: 0, rating: 4.4 },
    { id: 'phr4', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80', name: '北京南站桔子', city: '北京', dates: '随时可订', price: 88, nights: 0, rating: 4.3 },
    { id: 'phr5', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80', name: '杭州东站漫心', city: '杭州', dates: '随时可订', price: 108, nights: 0, rating: 4.5 },
  ],
};

// Keep legacy export
export const popularHotels = popularByTab.hotel;

// Editor picks per tab
export const picksByTab: Record<HomeTabKey, EditorPick[]> = {
  hotel: [
    { id: 'ep1', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80', name: '上海外滩W酒店', price: 1580, rating: 4.81 },
    { id: 'ep2', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', name: '安缦法云·杭州', price: 3200, rating: 4.93 },
    { id: 'ep3', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80', name: '北京瑰丽酒店', price: 2680, rating: 4.88 },
    { id: 'ep4', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80', name: '三亚亚特兰蒂斯', price: 1980, rating: 4.85 },
    { id: 'ep5', image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=400&q=80', name: '丽江古城花间堂', price: 880, rating: 4.79 },
    { id: 'ep6', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', name: '成都博舍酒店', price: 1260, rating: 4.82 },
  ],
  homestay: [
    { id: 'eps1', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80', name: '莫干山裸心堡', price: 1680, rating: 4.95 },
    { id: 'eps2', image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&q=80', name: '大理喜林苑', price: 980, rating: 4.91 },
    { id: 'eps3', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80', name: '厦门海边树屋', price: 520, rating: 4.87 },
    { id: 'eps4', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', name: '丽江花马天堂', price: 680, rating: 4.83 },
    { id: 'eps5', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80', name: '安吉帐篷客', price: 1280, rating: 4.89 },
    { id: 'eps6', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80', name: '桐庐秘境山居', price: 460, rating: 4.85 },
  ],
  hourly: [
    { id: 'eph1', image: 'https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=400&q=80', name: '亚朵·4h休息房', price: 128, rating: 4.6 },
    { id: 'eph2', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', name: '全季·午休特惠', price: 68, rating: 4.4 },
    { id: 'eph3', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80', name: '桔子·灵活3h', price: 88, rating: 4.3 },
    { id: 'eph4', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80', name: 'CitiGO·中转休息', price: 99, rating: 4.5 },
    { id: 'eph5', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', name: '漫心·半日房', price: 108, rating: 4.5 },
    { id: 'eph6', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', name: '维也纳·白领午休', price: 78, rating: 4.2 },
  ],
};

// Keep legacy export
export const editorPicks = picksByTab.hotel;


// User recommendations — Xiaohongshu-style waterfall feed
export const userRecommendations: {
  id: string;
  image: string;
  aspectRatio: string;
  title: string;
  tag?: string;
  hotLabel?: string;
  rating?: number;
  reviewCount?: number;
  author: string;
  views: number;
}[] = [
  {
    id: 'rec1',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
    aspectRatio: '3/4',
    title: '安吉设计感酒店榜，出片率100%的美学天花板',
    tag: '携程口碑榜',
    author: '旅行达人小王',
    views: 28000,
  },
  {
    id: 'rec2',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80',
    aspectRatio: '4/3',
    title: 'staycation 周末好去处！上海小众酒店合集',
    author: '爱旅行HAO',
    views: 5249,
  },
  {
    id: 'rec3',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
    aspectRatio: '4/5',
    title: '温州乐清希尔顿欢朋酒店',
    tag: '温州高档酒店榜 No.8',
    rating: 4.7,
    reviewCount: 1200,
    author: '酒店探店官',
    views: 12000,
  },
  {
    id: 'rec4',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
    aspectRatio: '3/4',
    title: '住进外滩W酒店云端套房，才懂什么叫把上海踩在脚下',
    author: '招财菲菲',
    views: 20000,
  },
  {
    id: 'rec5',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80',
    aspectRatio: '1/1',
    title: '南康路任性住一次LV酒店，绝美设计不踩雷',
    tag: '旅行热点',
    hotLabel: '54.3w人在看',
    author: '马达欧尼',
    views: 28000,
  },
  {
    id: 'rec6',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
    aspectRatio: '4/3',
    title: '杭州这家酒店也太绝了！无边泳池+湖景房推荐',
    author: '旅行种草机',
    views: 15600,
  },
];
