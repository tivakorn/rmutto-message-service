// Dependencies
import express, { Request, Response } from 'express'
import {
    Client,
    ClientConfig,
    middleware,
    MiddlewareConfig,
    WebhookEvent,
    MessageAPIResponseBase,
    TextMessage,
} from '@line/bot-sdk'

import fs from 'fs'
import path from 'path'

import garbageList from './static/garbage.json'

const port = process.env.PORT || 8080

const config: ClientConfig = {
    channelAccessToken: '+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'c762f59b6a6d76f00b8fca87859c11dc'
}

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: '+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=+eqKxMStUW7i8OD4l38KnASSO/dboLt+MtVNKepdpCnnZ3Sblc3mtbcB3TwfVL2caV+uX4oolT4UC1GyqUJT9AaA/rLOq8S5l1bzME9kjInDk46QZE3jCIiarINAncF2fIus42Dd3EAOiXYt+pWjxQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'c762f59b6a6d76f00b8fca87859c11dc'
}

const client = new Client(config)

const app = express()

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {

    let action: TextMessage[] = []

    if (event.type !== 'message') return

    let text = 'กำลังปั่นงานอยู่นะ!'

    if (event.message.type !== 'text') {

        text = `ส่ง ${event.message.type} มาหรอ เรายังไม่ทำหรอกนะ.`
    }

    if (event.message.type === 'text') {

        const message = event.message.text

        const garbage = garbageList.find(element => element.name === message)

        action = garbage?.massage as TextMessage[]

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

    await client.pushMessage(event.source.userId || '', action)
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

app.listen(port, () => console.log(`Application is live and listening on port ${3000}`))