// Dependencies
import axios from "axios";
import express, { Request, Response } from "express";
import garbageList from "./static/garbage.json";
import addedValueContent from "./static/added_value.json";
import replyGame from "./static/reply_game.json";
import path from "path";
import os from "os";
import fs from "fs";
import util from "util";
import { put } from "@vercel/blob";
const port = process.env.PORT || 3000;
import {
  ClientConfig,
  MiddlewareConfig,
  Client,
  WebhookEvent,
  MessageAPIResponseBase,
  TextMessage,
  FlexMessage,
  middleware,
  ImageMessage,
} from "@line/bot-sdk";
// import { fileFromPath } from "formdata-node/file-from-path";
// import FormData from "form-data";

const config: ClientConfig = {
  channelAccessToken:
    "PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=",
  channelSecret: "537035c20850a60a1da7b96ad8f791bf",
};

const middlewareConfig: MiddlewareConfig = {
  channelAccessToken:
    "PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=",
  channelSecret: "537035c20850a60a1da7b96ad8f791bf",
};

const client = new Client(config);

const app = express();

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {

  // let action: FlexMessage[] | TextMessage[] = []

  if (event.type !== "message") return;

  let text = "กำลังปั่นงานอยู่นะ!";

  if (!["text", "image"].includes(event.message.type)) {
    text = `ส่ง ${event.message.type} มาหรอ เรายังไม่ทำหรอกนะ.`;

    const action = [
      {
        type: "text",
        text: text,
      },
    ] as TextMessage[];

    await client.pushMessage(event.source.userId || "", action);
  }

  if (event.message.type === "image") {
    // data.data.pipe(`${event.message.id}.jpg`);

    // data.data.on('finish', () => {
    //     data.data.close();
    //     console.log(`Image downloaded as ${'a'}`);
    // })

    // const messageContent = await client.getMessageContent(event.message.id);

    // const { url } = await put(`images/${event.message.id}.jpeg`, data.data, { access: 'public' });

    const result = await garbagePrediction(event.message.id)

    // const actionList: FlexMessage[] = []

    // const garbage = garbageList.find(element => (element.name_en === 'plastic'))

    const contents = [];


    for (const word of result.split(',')) {

      const garbage = garbageList.find((element) => element.name_th === word.trim() || element.name_en === word.trim())

      const action = garbage?.massage[0].contents.contents

      contents.push(...action)
    }

    const flex = {
      type: "flex",
      altText: "ทำนายขยะจากรูปภาพ",
      contents: {
        type: "carousel",
        contents: contents,
      }
    }

    await client.pushMessage(event.source.userId || "", flex as FlexMessage);
  }

  if (event.message.type === "text") {

    const message = event.message.text

    console.log(message)

    if (message === "รู้จักกับขยะประเภทต่างๆ") {

      const contents = []

      for (const garbage of garbageList) {

        const action = garbage?.massage[0].contents.contents

        contents.push(...action)
      }

      const flex = {
        type: "flex",
        altText: "รู้จักกับขยะประเภทต่างๆ",
        contents: {
          type: "carousel",
          contents: contents,
        },
      };

      await client.pushMessage(event.source.userId || "", flex as FlexMessage);
    } else if (message === "การเพิ่มมูลค่าจากขยะใช้แล้ว") {
      const flex = {
        type: "flex",
        altText: "การเพิ่มมูลค่าจากขยะใช้แล้ว",
        contents: {
          type: "carousel",
          contents: addedValueContent,
        },
      };

      await client.pushMessage(event.source.userId || "", flex as FlexMessage)

    } else if (message.includes('ข้อ 9')) {

      const no = 10

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 8')) {

      const no = 9

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 7')) {

      const no = 8

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 6')) {

      const no = 7

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 5')) {

      const no = 6

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 4')) {

      const no = 5

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 3')) {

      const no = 4

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 2')) {

      const no = 3

     return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])


    } else if (message.includes('ข้อ 1')) {

      const no = 2

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])


    } else if (message.includes('เกมทดสอบ')) {

      const no = 1

      return await client.pushMessage(event.source.userId || '', [
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
                    "text": "คำตอบเกมทดสอบ" + '\n' + `ข้อ ${no} : ตอบ ก.`
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
                    "text": "คำตอบเกมทดสอบ" + '\n' + `ข้อ ${no} : ตอบ ข.`
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
                    "text": "คำตอบเกมทดสอบ" + '\n' + `ข้อ ${no} : ตอบ ค.`
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
                    "text": "คำตอบเกมทดสอบ" + '\n' + `ข้อ ${no} : ตอบ ง.`
                  }
                }
              ]
            }
          }
        }
      ])

    } else {

      const contents = []

      message.split(",");

      for (const word of message.split(",")) {
        const garbage = garbageList.find(
          (element) =>
            element.name_th === word.trim() || element.name_en === word.trim()
        );

        const action = garbage?.massage[0].contents.contents;

        contents.push(...action);
      }

      const flex = {
        type: "flex",
        altText: "ทำนายขยะจากรูปภาพ",
        contents: {
          type: "carousel",
          contents: contents,
        },
      };

      await client.pushMessage(event.source.userId || "", flex as FlexMessage);
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
};

const garbagePrediction = async (id: string) => {

  try {

    const headers = {
      Authorization: `Bearer PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=`,
    }

    const resp = await axios.get(`https://api-data.line.me/v2/bot/message/${id}/content/preview`,
      {
        headers,
        responseType: 'stream'
      }
    )

    const stream = resp.data
    const streamRead = await stream.read()
    const buffer = Buffer.from(streamRead)
    const blob = new Blob([buffer])

    const formData = new FormData()

    formData.append('input_file', blob)

    const res = await axios.post('https://devrmutto.pythonanywhere.com/p', formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    return res.data.result
  }
  catch (err) {

    console.log(err)

    return 'เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง'
  }
}

app.post(
  "/webhook",
  middleware(middlewareConfig),
  async (req: Request, res: Response) => {
    const events: WebhookEvent[] = req.body.events;

    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) console.error(err);

          return res.status(500).json({
            status: "error",
          });
        }
      })
    );

    return res.status(200).json({
      status: "success",
      results,
    });
  }
);

app.listen(port, () =>
  console.log(`Application is live and listening on port ${port}`)
);
