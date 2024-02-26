// Dependencies
import axios from "axios";
import express, { Request, Response } from "express";
import garbageList from "./static/garbage.json";
import addedValueContent from "./static/added_value.json";
import replyGame from "./static/reply_game.json";
import path from "path";
import os, { type } from "os";
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

    } else if (message.includes('ข้อ 8')) {

      let point = 0

      const result: { [key: string]: string } = {
        result_1: `ข้อ ${1} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`,
        result_2: `ข้อ ${2} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`,
        result_3: `ข้อ ${3} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`,
        result_4: `ข้อ ${4} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`,
        result_5: `ข้อ ${4} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`,
        result_6: `ข้อ ${6} : ตอบ ถังขยะอันตราย (สีแดง)`,
        result_7: `ข้อ ${7} : ตอบ ถูกทุกข้อ`,
        result_8: `ข้อ ${8} : ตอบ ถูกทุกข้อ`
      }

      const keyResult = Object.keys(result)

      for (let i = 1; i <= 8; i++) {

        if (message.includes(result[keyResult[i]])) point = point + 1
      }

      const resText = point < 4 ? "แล้วมาเล่นเกมตอบคำตอบใหม่นะครับ 😊" : "เก่งมากครับ คุณสามารถแยกขยะแต่ละประเภทได้ยอดเยี่ยม 👍"

      const action = [
        {
          type: "text",
          text: `รวมคะแนนทั้งหมด ${point}/8 คะแนน`,
        },
        {
          type: "text",
          text: resText
        }
      ] as TextMessage[];

      return await client.pushMessage(event.source.userId || "", action);

    } else if (message.includes('ข้อ 7')) {

      const no = 8

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) เราสามารถทำอะไรได้บ้างเพื่อช่วยลดปริมาณขยะ`,
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) เราสามารถทำอะไรได้บ้างเพื่อช่วยลดปริมาณขยะ`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "พกถุงผ้าไปซื้อของ",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ พกถุงผ้าไปซื้อของ`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "รีไซเคิลขยะ",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ รีไซเคิลขยะ`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ลดการใช้พลาสติก",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ลดการใช้พลาสติก`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถูกทุกข้อ",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถูกทุกข้อ`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 6')) {

      const no = 7

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ถ้าเราทิ้งขยะลงแม่น้ำ จะเกิดอะไรขึ้น`,
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ถ้าเราทิ้งขยะลงแม่น้ำ จะเกิดอะไรขึ้น`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ขยะเน่าเปื่อยแำให้เกิดกลิ่นเหม็น",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ขยะเน่าเปื่อยทำให้เกิดกลิ่นเหม็น`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ขยะอุดตันท่อระบายน้ำ",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ขยะอุดตันท่อระบายน้ำ`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ขยะลอยไปเกะกะทางสัญจร",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ขยะลอยไปเกะกะทางสัญจร`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถูกทุกข้อ",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถูกทุกข้อ`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 5')) {

      const no = 6

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image5.png?alt=media&token=69938c6d-9334-4a98-bbe0-612e59c98c59"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": message + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 4')) {

      const no = 5

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image3.png?alt=media&token=d0d87862-5b77-4245-9505-d216a439f8bc"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": message + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 3')) {

      const no = 4

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image4.png?alt=media&token=c57e820b-c2c1-4edf-a5a8-e54c3a27bbc4"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": message + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 2')) {

      const no = 3

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image1.png?alt=media&token=c5920122-99fd-4480-be29-52a3640ad47f"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": message + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('ข้อ 1')) {

      const no = 2

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image2.png?alt=media&token=b520cca5-c502-4805-bf6c-a4ae1621f54d"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": message + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": message + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
            }
          }
        }
      ])

    } else if (message.includes('เกมทดสอบตอบปัญหา')) {

      const no = 1

      return await client.pushMessage(event.source.userId || '', [
        {
          "type": "flex",
          "altText": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
          "contents": {
            "type": "bubble",
            "hero": {
              "type": "image",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover",
              "url": "https://firebasestorage.googleapis.com/v0/b/rmutto-massage-service.appspot.com/o/image6.png?alt=media&token=688377be-cb16-4726-b295-e0fa6bde8ad6"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "size": "sm",
                  "wrap": true,
                  "color": "#ffffff",
                  "text": `${no}) ขยะดังภาพด้านล่าง ควรทิ้งลงในถังขยะใด`,
                  "weight": "bold"
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CC0000",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะอันตราย (สีแดง)",
                    "text": "คำตอบ" + '\n' + `ข้อ ${no} : ตอบ ถังขยะอันตราย (สีแดง)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#0000CC",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะทั่วไป (สีน้ำเงิน)",
                    "text": "คำตอบ" + '\n' + `ข้อ ${no} : ตอบ ถังขยะทั่วไป (สีน้ำเงิน)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#00CC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะย่อยสลาย (สีเขียว)",
                    "text": "คำตอบ" + '\n' + `ข้อ ${no} : ถังขยะย่อยสลาย (สีเขียว)`
                  }
                },
                {
                  "type": "button",
                  "style": "primary",
                  "color": "#CCCC00",
                  "height": "sm",
                  "margin": "sm",
                  "action": {
                    "type": "message",
                    "label": "ถังขยะรีไซเคิล (สีเหลือง)",
                    "text": "คำตอบ" + '\n' + `ข้อ ${no} : ตอบ ถังขยะรีไซเคิล (สีเหลือง)`
                  }
                }
              ],
              "paddingAll": "20px",
              "backgroundColor": "#464F69"
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
