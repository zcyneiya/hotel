import OpenAI from 'openai';
import Hotel from '../models/Hotel.js';

const getClient = () => new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

// 高德 POI 类型映射
const POI_TYPE_MAP = {
  subway: '150500',
  bus: '150700',
  train: '150200',
  airport: '150100',
  scenic: '110000',
  museum: '140100',
  park: '110101',
  mall: '060100',
  supermarket: '060200',
  restaurant: '050000',
  hospital: '090100',
  bank: '160100',
};

const fetchJson = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Amap request failed: ${resp.status}`);
  return resp.json();
};

// 根据酒店地址获取经纬度坐标
const getLocation = async (address, city) => {
  const AMAP_KEY = process.env.AMAP_KEY;
  if (!AMAP_KEY) return null;
  const params = new URLSearchParams({ key: AMAP_KEY, address });
  if (city) params.append('city', city);
  const data = await fetchJson(`https://restapi.amap.com/v3/geocode/geo?${params}`);
  if (data.status !== '1' || !data.geocodes?.length) return null;
  return data.geocodes[0].location; // "lng,lat"
};

// 周边搜索-以坐标为中心，在指定半径内搜索某类 POI
const searchNearby = async (location, poiType, radius = 2000) => {
  const AMAP_KEY = process.env.AMAP_KEY;
  if (!AMAP_KEY) return [];
  const types = POI_TYPE_MAP[poiType] || poiType;
  const params = new URLSearchParams({ key: AMAP_KEY, location, radius, types, extensions: 'base' });
  const data = await fetchJson(`https://restapi.amap.com/v3/place/around?${params}`);
  if (data.status !== '1') return [];
  return (data.pois || []).slice(0, 5).map(p => ({
    name: p.name,
    distance: `${p.distance}米`,
    address: p.vicinity,
  }));
};

// Function Calling 工具定义- 告诉 AI 有哪些工具可以用、什么时候用、怎么用。
const tools = [
  {
    type: 'function',
    function: {
      // 工具名
      name: 'search_nearby',
      // 工具用途说明，AI 会根据这个说明来判断什么时候调用这个工具
      description: '当用户询问酒店周边的交通、景点、餐厅、医院、购物等设施时调用此工具，通过高德地图查询真实的周边信息',
      // 工具参数定义，告诉 AI 调用这个工具需要传入哪些参数、参数类型和含义
      parameters: {
        type: 'object',
        properties: {
          poi_type: {
            type: 'string',
            enum: Object.keys(POI_TYPE_MAP), //限定只能穿入预定义的 POI 类型
            description: '要查询的 POI 类型',
          },
          radius: {
            type: 'number',
            description: '搜索半径（米），默认 2000',
          },
        },
        required: ['poi_type'],
      },
    },
  },
];

// 构建系统提示语，告诉 AI 酒店的基本信息和用户可能会问的问题背景 
const stripThinking = (text) => text?.replace(/<think>[\s\S]*?<\/think>/g, '').trim() ?? '';

const buildSystemPrompt = (hotel) => {
  const name = hotel.name?.cn || hotel.name?.en || hotel.name;
  const rooms = hotel.rooms?.map(r =>
    `${r.type}（¥${r.price}/晚，可住${r.capacity}人，剩余${r.availableRooms}间）`
  ).join('、') || '暂无房型信息';
  const facilities = hotel.facilities?.join('、') || '暂无';
  const promotions = hotel.promotions?.map(p => `${p.title}：${p.description}`).join('；') || '暂无';

  return `你是易宿平台的智能客服助手，正在为用户解答关于以下酒店的问题。请用简洁、友好的语气回答。

【酒店信息】
名称：${name}
地址：${hotel.address}，${hotel.city}
星级：${hotel.starLevel}星
设施服务：${facilities}
房型：${rooms}
优惠活动：${promotions}

当用户询问周边交通、景点、餐厅等信息时，请主动调用 search_nearby 工具查询真实数据后再回答，不要凭空编造。`;
};

// AI 聊天接口，实现了两轮对话的 Function Calling 流程
export const chat = async (req, res) => {
  const { hotelId, messages } = req.body;

  if (!hotelId || !messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: '参数错误' });
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(503).json({ success: false, message: 'AI 服务未配置' });
  }

  try {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) return res.status(404).json({ success: false, message: '酒店不存在' });

    const systemPrompt = buildSystemPrompt(hotel);
    //完整的对话上下文 = 系统提示语 + 用户消息历史
    const chatMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    // 第一次调用，AI 可能会触发 Function Calling
    const first = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: chatMessages,
      tools, //传入Function Calling 工具定义
      tool_choice: 'auto', //让 AI 自主决定是否调用工具
      max_tokens: 512,
    });

    const firstChoice = first.choices[0]; // AI 的初始回复，可能是直接回答，也可能是调用工具的指令

    // AI 没有调用工具，直接返回
    if (firstChoice.finish_reason !== 'tool_calls') {
      return res.json({ success: true, reply: stripThinking(firstChoice.message.content) });
    }

    // AI 调用了工具，执行高德查询
    const toolCall = firstChoice.message.tool_calls[0];
    const { poi_type, radius } = JSON.parse(toolCall.function.arguments);

    // 获取酒店坐标（优先用已存的 location，否则 geocode）
    let location = hotel.location
      ? `${hotel.location.lng},${hotel.location.lat}`
      : await getLocation(hotel.address, hotel.city);

    let toolResult;
    if (!location) {
      toolResult = '无法获取酒店坐标，无法查询周边信息。';
    } else {
      // 调用高德地图 API 搜索周边 POI
      const pois = await searchNearby(location, poi_type, radius || 2000);
      toolResult = pois.length > 0
        ? pois.map(p => `${p.name}（${p.distance}）`).join('、')
        : '附近暂未找到相关设施';
    }

    // 第二次调用，把工具结果交给 AI 生成最终回答
    const second = await getClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        ...chatMessages,
        firstChoice.message,
        { role: 'tool', tool_call_id: toolCall.id, content: toolResult },
      ],
      max_tokens: 512,
    });

    const reply = stripThinking(second.choices[0]?.message?.content) || '抱歉，暂时无法回答您的问题。';
    res.json({ success: true, reply });

  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: '服务异常，请稍后再试' });
  }
};
