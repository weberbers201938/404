const request = require('request');
const cheerio = require('cheerio');

module.exports = {
  config: {
    name: "getcookie",
    version: "80",
    hasPermssion: 0,
    credits: "Developer",
    description: "This command will help you to get facebook cookie",
    usage: "[name of cmd] <> <>",
    usePrefix: true,
    commandCategory: "facebook tools",
    cooldowns: 0
  },

  async run({ api, event, args, box, message }) {
    try {
      await getCookie(args[0], args[1], (error, fbstate) => {
        if (error) {
          console.error(error);
          // return;
        }

        if (fbstate) {
          message.reply(fbstate);
        } else {
          message.reply("Incorrect email / password!");
        }
      });
    } catch (error) {
      message.reply(error);
    }
  }
};

async function getCookie(email, password, callback) {
  const url = 'https://mbasic.facebook.com';
  const xurl = url + '/login.php';
  const userAgent = "Mozilla/5.0 (Linux; Android 4.1.2; GT-I8552 Build/JZO54K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36";
  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en_US',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': "Windows",
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': userAgent
  };

  const jar = request.jar();

  request({ url: xurl, headers: headers, jar: jar }, (error, response, body) => {
    if (error) {
      console.error('Initial request error:', error);
      return callback(error);
    }

    const $ = cheerio.load(body);
    const lsd = $('input[name="lsd"]').val();
    const jazoest = $('input[name="jazoest"]').val();
    const m_ts = $('input[name="m_ts"]').val();
    const li = $('input[name="li"]').val();
    const try_number = $('input[name="try_number"]').val();
    const unrecognized_tries = $('input[name="unrecognized_tries"]').val();
    const bi_xrwh = $('input[name="bi_xrwh"]').val();

    if (!lsd || !jazoest || !m_ts || !li || !try_number || !unrecognized_tries || !bi_xrwh) {
      console.error('Failed to extract form inputs');
      return callback(new Error('Failed to extract form inputs'));
    }

    const formData = {
      lsd: lsd,
      jazoest: jazoest,
      m_ts: m_ts,
      li: li,
      try_number: try_number,
      unrecognized_tries: unrecognized_tries,
      bi_xrwh: bi_xrwh,
      email: email,
      pass: password,
      login: "submit"
    };

    request.post({ url: xurl, headers: headers, form: formData, followAllRedirects: true, timeout: 300000, jar: jar }, (error, response, body) => {
      if (error) {
        console.error('Login request error:', error);
        return callback(error);
      }

      const cookies = jar.getCookies(url);
      const c_user_cookie = cookies.find(cookie => cookie.key === "c_user");
      const xs_cookie = cookies.find(cookie => cookie.key === "xs");
      const datr_cookie = cookies.find(cookie => cookie.key === "datr");
      const sb_cookie = cookies.find(cookie => cookie.key === "sb");
      const fr_cookie = cookies.find(cookie => cookie.key === "fr");
      const m_page_voice_cookie = cookies.find(cookie => cookie.key === "m_page_voice");

      if (!c_user_cookie || !xs_cookie || !datr_cookie || !sb_cookie || !fr_cookie || !m_page_voice_cookie) {
        console.error('Required cookies not found');
        return callback(new Error('Required cookies not found'));
      }

      const formattedCookies = [
        `${datr_cookie.key}= ${datr_cookie.value}`,
        `${sb_cookie.key}= ${sb_cookie.value}`,
        `${c_user_cookie.key}= ${c_user_cookie.value}`,
        `${xs_cookie.key}= ${xs_cookie.value}`,
        `${fr_cookie.key}= ${fr_cookie.value}`,
        `${m_page_voice_cookie.key}= ${m_page_voice_cookie.value}`
      ];

      const fbstate = formattedCookies.join('; ');

      return callback(null, fbstate);
    });
  });
}
