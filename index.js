const express = require('express');
const { Telegraf } = require('telegraf');

// Bot Token
const BOT_TOKEN = '7420235088:AAHb9-aHo8urv_0INFXeqR4D8u_VPYUe578';
const bot = new Telegraf(BOT_TOKEN);
const app = express();

// 存储视频信息的列表
let videos = [];

// 格式化时长
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}小时${minutes}分钟${secs}秒` : `${minutes}分钟${secs}秒`;
}

// 处理 /start 命令
bot.start((ctx) => {
    ctx.reply('发送我你想要分析的视频或直接在群组中 @mention 我。');
});

// 处理视频消息
bot.on('video', (ctx) => {
    const video = ctx.message.video;
    const duration = video.duration; // 视频时长，单位为秒
    const fileSize = video.file_size; // 视频大小，单位为字节
    const messageId = ctx.message.message_id; // 视频消息 ID

    console.log(`接收到视频: 消息 ID: ${messageId}, 时长: ${formatDuration(duration)}, 大小: ${fileSize}字节`);

    // 检查是否已经存在相同的视频（时长和大小都一致）
    const duplicates = videos.filter(v => v.duration === duration && v.file_size === fileSize);

    if (duplicates.length > 0) {
        const duplicateCount = duplicates.length;
        const duplicateDurations = duplicates.map(v => formatDuration(v.duration)).join(', ');
        ctx.reply(`检测到${duplicateCount}个重复视频！时长: ${duplicateDurations}`);
        return;
    }

    // 如果没有重复，保存视频信息
    videos.push({ duration, file_size: fileSize, message_id: messageId });
    console.log(`新视频已添加: 消息 ID: ${messageId}, 时长: ${formatDuration(duration)}, 大小: ${fileSize}字节`);
});

// 设置 Webhook
app.use(express.json());
app.post(`/webhook`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// 启动 Express 服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口 ${PORT}`);
});
