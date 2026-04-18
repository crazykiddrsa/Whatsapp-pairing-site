const { default: makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const express = require("express");
const pino = require("pino");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/get-code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Please provide a phone number." });
    
    // Remove any plus signs or spaces from the number
    num = num.replace(/[^0-9]/g, '');

    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    try {
        await delay(3000); // Give the socket time to initialize
        const code = await sock.requestPairingCode(num);
        res.json({ code: code, brand: "NHLAKZIN" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate code. Try again." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running! Go to http://localhost:${PORT}`);
});

