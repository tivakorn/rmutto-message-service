"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const express_1 = __importDefault(require("express"));
const bot_sdk_1 = require("@line/bot-sdk");
const garbage_json_1 = __importDefault(require("./static/garbage.json"));
const port = process.env.PORT || 8080;
const config = {
    channelAccessToken: '+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'c762f59b6a6d76f00b8fca87859c11dc'
};
const middlewareConfig = {
    channelAccessToken: '+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'c762f59b6a6d76f00b8fca87859c11dc'
};
const client = new bot_sdk_1.Client(config);
const app = (0, express_1.default)();
const textEventHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // let action: FlexMessage[] | TextMessage[] = []
    if (event.type !== 'message')
        return;
    let text = 'กำลังปั่นงานอยู่นะ!';
    if (event.message.type !== 'text') {
        text = `ส่ง ${event.message.type} มาหรอ เรายังไม่ทำหรอกนะ.`;
        const action = [
            {
                type: 'text',
                text: text
            }
        ];
        yield client.pushMessage(event.source.userId || '', action);
    }
    if (event.message.type === 'text') {
        const actionList = [];
        const message = event.message.text;
        message.split(',');
        for (const word of message.split(',')) {
            const garbage = garbage_json_1.default.find(element => (element.name === word || element.name_en === word));
            const action = garbage === null || garbage === void 0 ? void 0 : garbage.massage;
            actionList.push(...action);
        }
        yield client.pushMessage(event.source.userId || '', actionList);
        // switch (message) {
        //     case 'กระดาษกล่อง':
        //         text = `เก็บรวบรวม พับ มัดเป็นตั้ง`
        //         break
        //     case 'กระดาษขาวดำ':
        //         text = `เก็บรวบรวม มัดเป็นตั้ง`
        //         break
        //     case 'กล่องเครื่องดืื่ม':
        //         text = `ดึง พับ เก็บ ตัด ล้าง พับ`
        //         break
        //     case 'ขวด PET ใส':
        //         text = `ลอกฉลาก บีบ`
        //         break
        //     case 'กระป๋องอลูมิเนียม':
        //         text = `บีบให้แบน เพิ่มพื้นที่จัดเก็บ`
        //         break
        //     default:
        //         text = `ไม่รู้ๆๆๆ`
        // }
    }
    // const content = await client.getMessageContent(event.message.id)
    // const imgaePath = path.resolve(__dirname, 'images', `${event.message.id}.jpg`)
    // const writer = fs.createWriteStream(imgaePath)
    // content.pipe(writer)
    // new Promise((resolve, reject) => {
    //     writer.on('finish', resolve)
    //     writer.on('error', reject)
    // })
    // await client.pushMessage(event.source.userId || '', action)
});
app.post('/webhook', (0, bot_sdk_1.middleware)(middlewareConfig), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const events = req.body.events;
    const results = yield Promise.all(events.map((event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield textEventHandler(event);
        }
        catch (err) {
            if (err instanceof Error)
                console.error(err);
            return res.status(500).json({
                status: 'error',
            });
        }
    })));
    return res.status(200).json({
        status: 'success',
        results
    });
}));
app.get('/test', (req, res) => res.json({ test: 'test' }));
app.listen(port, () => console.log(`Application is live and listening on port ${port}`));
//# sourceMappingURL=index.js.map