const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function XeonPair() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(`./session`);

        try {
            let XeonBotInc = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"],
            });

            if (!XeonBotInc.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await XeonBotInc.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            XeonBotInc.ev.on('creds.update', saveCreds);
            XeonBotInc.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    await delay(10000);
                    const sessionXeon = fs.readFileSync('./session/creds.json');
                    const audioxeon = fs.readFileSync('./KERM.m4a');
                    XeonBotInc.groupAcceptInvite("Kjm8rnDFcpb04gQNSTbW2d");
                    
                    const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { document: sessionXeon, mimetype: `application/json`, fileName: `creds.json` });
                    await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                        audio: audioxeon,
                        mimetype: 'audio/mp4',
                        ptt: true
                    }, {
                        quoted: xeonses
                    });

                    await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                        text: `┏━『 *KERM-BUG-BOT* 』━◧
┣⌬ *SESSION = CONNECTED*
┣⌬ *CREDS.JSON = 📁✅*
┗━━━━━━━━━━━━━━━◧

━━━━━━━━━━━━━━━━━━━
❶ || 𝐆𝐢𝐭 = 🌐 https://github.com/Kgtech-cmr/KERM-BUG-BOT
━━━━━━━━━━━━━━━━━━━
❷ || 𝐆𝐫𝐨𝐮𝐩𝐞 = 🪀 https://chat.whatsapp.com/EQHfZZHu2jo194sJcAht5S
━━━━━━━━━━━━━━━━━━━
❸ || 𝐂𝐡𝐚𝐢𝐧𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 = 🪀 https://whatsapp.com/channel/0029Vafn6hc7DAX3fzsKtn45
━━━━━━━━━━━━━━━━━━━
➡️ 𝐒𝐮𝐢𝐯𝐞𝐳 𝐦a 𝐂𝐡𝐚𝐢𝐧𝐞 𝐝𝐞 𝐒𝐮𝐩𝐩𝐨𝐫𝐭

📞 Vous voulez nous parler ? 👉 https://Wa.me//+237656520674 👈
👉 https://Wa.me//+237650564445 👈
━━━━━━━━━━━━━━━━━━━

©️ 2024-2099 *Kg Tech🇨🇲*`
                    }, { quoted: xeonses });

                    await delay(100);
                    removeFile('./session');
                    process.exit(0);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    XeonPair();
                }
            });
        } catch (err) {
            console.log("Service restarted");
            await removeFile('./session');
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await XeonPair();
});

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (e.includes("conflict")) return;
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("not-authorized")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    console.log('Caught exception: ', err);
});

module.exports = router;
