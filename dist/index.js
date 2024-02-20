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
const axios_1 = __importDefault(require("axios"));
const garbage_json_1 = __importDefault(require("./static/garbage.json"));
const added_value_json_1 = __importDefault(require("./static/added_value.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const port = process.env.PORT || 3000;
const bot_sdk_1 = require("@line/bot-sdk");
const form_data_1 = __importDefault(require("form-data"));
const config = {
    channelAccessToken: 'PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '537035c20850a60a1da7b96ad8f791bf'
};
const middlewareConfig = {
    channelAccessToken: 'PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '537035c20850a60a1da7b96ad8f791bf'
};
const client = new bot_sdk_1.Client(config);
const app = (0, express_1.default)();
const textEventHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    // let action: FlexMessage[] | TextMessage[] = []
    if (event.type !== 'message')
        return;
    let text = 'กำลังปั่นงานอยู่นะ!';
    if (!['text', 'image'].includes(event.message.type)) {
        text = `ส่ง ${event.message.type} มาหรอ เรายังไม่ทำหรอกนะ.`;
        const action = [
            {
                type: 'text',
                text: text
            }
        ];
        yield client.pushMessage(event.source.userId || '', action);
    }
    if (event.message.type === 'image') {
        // data.data.pipe(`${event.message.id}.jpg`);
        // data.data.on('finish', () => {
        //     data.data.close();
        //     console.log(`Image downloaded as ${'a'}`);
        // })
        // const messageContent = await client.getMessageContent(event.message.id);
        // const { url } = await put(`images/${event.message.id}.jpeg`, data.data, { access: 'public' });
        const t = yield garbagePrediction(event.message.id);
        // const actionList: FlexMessage[] = []
        // const garbage = garbageList.find(element => (element.name_en === 'plastic'))
        // const action = garbage?.massage as FlexMessage[]
        // actionList.push(...action)
        // await client.pushMessage(event.source.userId || '', actionList)
        const action = [
            {
                type: 'text',
                text: 'A'
            }
        ];
        yield client.pushMessage(event.source.userId || '', action);
    }
    if (event.message.type === 'text') {
        const message = event.message.text;
        console.log(message);
        if (message === 'รู้จักกับขยะประเภทต่างๆ') {
            const contents = [];
            for (const garbage of garbage_json_1.default) {
                const action = garbage === null || garbage === void 0 ? void 0 : garbage.massage[0].contents.contents;
                contents.push(...action);
            }
            const flex = {
                "type": "flex",
                "altText": "รู้จักกับขยะประเภทต่างๆ",
                "contents": {
                    "type": "carousel",
                    "contents": contents
                }
            };
            yield client.pushMessage(event.source.userId || '', flex);
        }
        else if (message === 'การเพิ่มมูลค่าจากขยะใช้แล้ว') {
            const flex = {
                "type": "flex",
                "altText": "การเพิ่มมูลค่าจากขยะใช้แล้ว",
                "contents": {
                    "type": "carousel",
                    "contents": added_value_json_1.default
                }
            };
            yield client.pushMessage(event.source.userId || '', flex);
        }
        else if (message.includes('ข้อ 3')) {
            yield client.pushMessage(event.source.userId || '', [
                {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": message + '\n' + 'ข้อ 4 : ตอบ ก.'
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ข."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": "ข้อ 1 : ตอบ ค."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ง."
                                    }
                                }
                            ]
                        }
                    }
                }
            ]);
        }
        else if (message.includes('ข้อ 2')) {
            yield client.pushMessage(event.source.userId || '', [
                {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": message + '\n' + 'ข้อ 3 : ตอบ ก.'
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ข."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": "ข้อ 1 : ตอบ ค."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ง."
                                    }
                                }
                            ]
                        }
                    }
                }
            ]);
        }
        else if (message.includes('ข้อ 1')) {
            yield client.pushMessage(event.source.userId || '', [
                {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": message + '\n' + 'ข้อ 2 : ตอบ ก.'
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ข."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": "ข้อ 1 : ตอบ ค."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ง."
                                    }
                                }
                            ]
                        }
                    }
                }
            ]);
        }
        else if (message.includes('เกมทดสอบ')) {
            yield client.pushMessage(event.source.userId || '', [
                {
                    "type": "flex",
                    "altText": "This is a Flex Message",
                    "contents": {
                        "type": "bubble",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": message + '\n' + 'ข้อ 1 : ตอบ ก.'
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ข."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 1",
                                        "text": "ข้อ 1 : ตอบ ค."
                                    }
                                },
                                {
                                    "type": "button",
                                    "style": "primary",
                                    "height": "sm",
                                    "margin": "sm",
                                    "action": {
                                        "type": "message",
                                        "label": "มัธยมศึกษาปีที่ 2",
                                        "text": "ข้อ 1 : ตอบ ง."
                                    }
                                }
                            ]
                        }
                    }
                }
            ]);
        }
        else {
            const contents = [];
            message.split(',');
            for (const word of message.split(',')) {
                const garbage = garbage_json_1.default.find(element => (element.name_th === word.trim() || element.name_en === word.trim()));
                const action = garbage === null || garbage === void 0 ? void 0 : garbage.massage[0].contents.contents;
                contents.push(...action);
            }
            const flex = {
                "type": "flex",
                "altText": "ทำนายขยะจากรูปภาพ",
                "contents": {
                    "type": "carousel",
                    "contents": contents
                }
            };
            yield client.pushMessage(event.source.userId || '', flex);
        }
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
const garbagePrediction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headers = { 'Authorization': `Bearer PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=` };
        const image = yield axios_1.default.get(`https://api-data.line.me/v2/bot/message/${id}/content/preview`, {
            headers,
            responseType: 'arraybuffer'
        });
        const base64File = image.data.toString('base64');
        const base64Data = base64File.replace(/^data:image\/png;base64,/, '');
        const uploadFile = path_1.default.join(__dirname, 'temp.jpg');
        // const writeFilePromise = util.promisify(fs.writeFileSync)
        fs_1.default.writeFileSync(uploadFile, base64Data, { encoding: 'base64', mode: 0o777 });
        // const data = fs.createReadStream(uploadFile)
        // const imageData = Buffer.from(image.data).toString('base64');
        // const mimeType = image.headers['content-type'];
        const formData = new form_data_1.default();
        formData.append('input_file', fs_1.default.createReadStream(uploadFile));
        const result = yield axios_1.default.post('https://devrmutto.pythonanywhere.com/p', formData, { headers: { "Content-Type": "multipart/form-data" } });
        // console.log(result.data)
        // fs.unlinkSync(tempLocalFile)
        return result.data.result || 'ผิดพลาด';
    }
    catch (error) {
        console.log('error', error);
        return error;
    }
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
app.listen(port, () => console.log(`Application is live and listening on port ${port}`));
//# sourceMappingURL=index.js.map