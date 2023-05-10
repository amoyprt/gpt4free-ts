import Koa, {Context, Next} from 'koa';
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser';
import {ChatModelFactory, Model} from "./model";

const app = new Koa();
const router = new Router();
const errorHandler = async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (err: any) {
        console.error(err);
        ctx.body = JSON.stringify(err);
        ctx.res.end();
    }
};
app.use(errorHandler);
app.use(bodyParser());
const chatModel = new ChatModelFactory();

interface AskReq {
    prompt: string;
    model: Model;
}

router.get('/ask', async (ctx) => {
    const {prompt, model = Model.Forefront, ...options} = ctx.query as unknown as AskReq;
    if (!prompt) {
        ctx.body = 'please input prompt';
        return;
    }
    const chat = chatModel.get(model);
    if (!chat) {
        ctx.body = 'Unsupported  model';
        return;
    }
    const res = await chat.ask({prompt: prompt as string, options});
    ctx.body = res?.text;
});

router.get('/ask/stream', async (ctx) => {
    const {prompt, model = Model.Forefront, ...options} = ctx.query as unknown as AskReq;
    if (!prompt) {
        ctx.body = 'please input prompt';
        return;
    }
    const chat = chatModel.get(model);
    if (!chat) {
        ctx.body = 'Unsupported  model';
        return;
    }
    ctx.set({
        "Content-Type": "text/event-stream;charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });
    const res = await chat.askStream({prompt: prompt as string, options});
    ctx.body = res?.text;
})

app.use(router.routes());

app.listen(10000, '0.0.0.0', () => {
    console.log("Now listening: 0.0.0.0:10000");
});
