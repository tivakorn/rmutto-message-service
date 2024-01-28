// Dependencies
import express, { Request, Response } from 'express'
import {
    Client,
    ClientConfig,
    middleware,
    MiddlewareConfig,
    WebhookEvent,
    MessageAPIResponseBase,
    FlexMessage,
    TextMessage
} from '@line/bot-sdk'

import axios from 'axios'
import garbageList from './static/garbage.json'
import addedValueContent from './static/added_value.json'
import replyGame from './static/reply_game.json'
import fs from 'fs'
const port = process.env.PORT || 3000

const config: ClientConfig = {
    channelAccessToken: 'PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '537035c20850a60a1da7b96ad8f791bf'
}

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: 'PjG+9OmoaDEGKAtNQwDeDI3hxqY0zYqIOKazLJrsv5/cimoq5E+YnmlNjUXQLDmdgBqz4wt5JQoefM+GuqeCVEGPcQAAenyjWJX1wAxzHNIgrD909v2+3kSc1+DziMX+s/wYTitLQsvX0eUFOJi+8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '537035c20850a60a1da7b96ad8f791bf'
}

const client = new Client(config)

const app = express()

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {

    // let action: FlexMessage[] | TextMessage[] = []

    if (event.type !== 'message') return

    let text = 'กำลังปั่นงานอยู่นะ!'

    if (!['text', 'image'].includes(event.message.type)) {

        text = `ส่ง ${event.message.type} มาหรอ เรายังไม่ทำหรอกนะ.`

        const action = [
            {
                type: 'text',
                text: text
            }
        ] as TextMessage[]

        await client.pushMessage(event.source.userId || '', action)
    }

    if (event.message.type === 'image') {

        const content = await client.getMessageContent(event.message.id)

        // const result = await garbagePrediction(content)

        // const actionList: FlexMessage[] = []

        // const garbage = garbageList.find(element => (element.name_en === 'plastic'))

        // const action = garbage?.massage as FlexMessage[]

        // actionList.push(...action)

        // await client.pushMessage(event.source.userId || '', actionList)

        const action = [
            {
                type: 'text',
                text: content.toString()
            }
        ] as TextMessage[]

        await client.pushMessage(event.source.userId || '', action)
    }

    if (event.message.type === 'text') {

        const message = event.message.text

        console.log(message)

        if (message === 'รู้จักกับขยะประเภทต่างๆ') {

            const contents = []

            for (const garbage of garbageList) {

                const action = garbage?.massage[0].contents.contents

                contents.push(...action)
            }

            const flex = {
                "type": "flex",
                "altText": "รู้จักกับขยะประเภทต่างๆ",
                "contents": {
                    "type": "carousel",
                    "contents": contents
                }
            }

            await client.pushMessage(event.source.userId || '', flex as FlexMessage)

        } else if (message === 'การเพิ่มมูลค่าจากขยะใช้แล้ว') {

            const flex = {
                "type": "flex",
                "altText": "การเพิ่มมูลค่าจากขยะใช้แล้ว",
                "contents": {
                    "type": "carousel",
                    "contents": addedValueContent
                }
            }

            await client.pushMessage(event.source.userId || '', flex as FlexMessage)

        } else if (message.includes('ตอบ')) {

            const rawData = fs.readFileSync(`${__dirname}/static/reply_game.json`)

            const jsonData = JSON.parse(rawData.toString())

            const newData: any = {
                newKey: event.source.userId || '',
                anotherKey: message
            };

            jsonData.push(newData)

            fs.writeFileSync(`${__dirname}/static/reply_game.json`, JSON.stringify(jsonData, null, 4))

            const rawDataA = fs.readFileSync(`${__dirname}/static/reply_game.json`)

            const jsonDataA = JSON.parse(rawDataA.toString())

            const contents: TextMessage[] = []

            for (const garbage of jsonDataA) {

                const action = garbage?.anotherKey || ''

                contents.push({
                    type: 'text',
                    text: action
                })
            }

            await client.pushMessage(event.source.userId || '', contents)
        
        } else if (message.includes('ข้อ')) {

            await client.pushMessage(event.source.userId || '', [
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
                                        "text": "ข้อ 1 : ตอบ ก."
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
            ])

        } else {

            const contents = []

            message.split(',')

            for (const word of message.split(',')) {

                const garbage = garbageList.find(element => (element.name_th === word.trim() || element.name_en === word.trim()))

                const action = garbage?.massage[0].contents.contents

                contents.push(...action)
            }

            const flex = {
                "type": "flex",
                "altText": "ทำนายขยะจากรูปภาพ",
                "contents": {
                    "type": "carousel",
                    "contents": contents
                }
            }

            await client.pushMessage(event.source.userId || '', flex as FlexMessage)
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
}

const garbagePrediction = async (image: any) => {

    try {

        const body = new FormData()

        body.append('input_file', image)

        const result = await axios.post('https://devrmutto.pythonanywhere.com/p')

        return result.data
    }
    catch (error) {

        return error
    }
}

app.post('/webhook', middleware(middlewareConfig), async (req: Request, res: Response) => {

    const events: WebhookEvent[] = req.body.events

    const results = await Promise.all(
        events.map(async (event: WebhookEvent) => {

            try {

                await textEventHandler(event)

            } catch (err: unknown) {

                if (err instanceof Error) console.error(err)

                return res.status(500).json({
                    status: 'error',
                })
            }
        })
    )

    return res.status(200).json({
        status: 'success',
        results
    })
})

app.get('/test', (req, res) => res.json({ test: 'test' }))

app.listen(port, () => console.log(`Application is live and listening on port ${port}`))