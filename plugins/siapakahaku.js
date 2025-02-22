const { siapakahaku } = require("@bochilteam/scraper");
let timeout = 120000;

let handler = async (m, { conn, command, usedPrefix }) => {
  conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {};
  let id = m.chat;
  if (id in conn.siapakahaku) {
    conn.reply(
      m.chat,
      "You Already have question to answer !",
      conn.siapakahaku[id][0],
    );
  }
  let json = await siapakahaku();
  let caption = `*[ SIAPAKAH AKU ]*
*• Timeout :* 60 seconds
*• Question :* ${json.soal}
*• Clue :* ${json.jawaban.replace(/[AIUEOaiueo]/g, "_")}

reply to this message to answer the question
type *\`nyerah\`* to surender`.trim();

  conn.siapakahaku[id] = [
    await conn.reply(m.chat, caption, m),
    json,
    setTimeout(() => {
      if (conn.siapakahaku[id])
        conn.sendMessage(
          id,
          {
            text: `Game Over !!
You lose with reason : *[ Timeout ]*

• Answer : *[ ${json.jawaban} ]*`,
          },
          { quoted: m },
        );
      delete conn.tebaklogo[id];
    }, timeout),
  ];
};

handler.before = async (m, { conn }) => {
  conn.siapakahaku = conn.siapakahaku ? conn.siapakahaku : {};
  let id = m.chat;
  if (!m.text) return;
  if (m.isCommand) return;
  if (!conn.siapakahaku[id]) return;
  let json = await conn.siapakahaku[id][1];
  let reward = db.data.users[m.sender];
  if (
    m.text.toLowerCase() === "nyerah" ||
    m.text.toLowerCase() === "surender"
  ) {
    clearTimeout(await conn.siapakahaku[id][2]);
    conn.sendMessage(
      m.chat,
      {
        text: `Game Over !!
You lose with reason : *[ ${m.text} ]*

• Answer : *[ ${json.jawaban} ]*`,
      },
      { quoted: await conn.siapakahaku[id][0] },
    );
    delete conn.siapakahaku[id];
  } else if (m.text.toLowerCase() === json.jawaban.toLowerCase()) {
    reward.money += parseInt(10000);
    reward.limit += 10;
    clearTimeout(await conn.siapakahaku[id][2]);
    await conn.sendMessage(
      m.chat,
      {
        text: `Congratulations 🎉
you have successfully guessed the answer!

* *Money :* 10.000+
* *Limit :* 10+

Next question...`,
      },
      { quoted: await conn.siapakahaku[id][0] },
    );
    delete conn.siapakahaku[id];
    await conn.appendTextMessage(m, ".siapakahaku", m.chatUpdate);
  } else {
    conn.sendMessage(m.chat, {
      react: {
        text: "❌",
        key: m.key,
      },
    });
  }
};

handler.help = ["siapakahaku"];
handler.tags = ["game"];
handler.command = ["siapakahaku"];
handler.group = true;

module.exports = handler;
