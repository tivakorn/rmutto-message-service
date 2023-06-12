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

const port = process.env.PORT || 8080

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

        const result = await garbagePrediction(content)

        // const actionList: FlexMessage[] = []

        // const garbage = garbageList.find(element => (element.name_en === 'plastic'))

        // const action = garbage?.massage as FlexMessage[]

        // actionList.push(...action)

        // await client.pushMessage(event.source.userId || '', actionList)

        const action = [
            {
                type: 'text',
                text: result.toString()
            }
        ] as TextMessage[]

        await client.pushMessage(event.source.userId || '', action)
    }

    if (event.message.type === 'text') {

        const actionList: FlexMessage[] = []

        const message = event.message.text

        message.split(',')

        for (const word of message.split(',')) {

            const garbage = garbageList.find(element => (element.name_th === word.trim() || element.name_en === word.trim()))

            const action = garbage?.massage as FlexMessage[]

            actionList.push(...action)

            console.log('test')
        }

        await client.pushMessage(event.source.userId || '', actionList)
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
}

const garbagePrediction = async (image: any) => {

    try {

        const body = new FormData()

        // body.append('inputs_file', image)

        const result = await axios.post('http://devrmutto.pythonanywhere.com/p')

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