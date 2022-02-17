
const dayjs = require('dayjs')
let cheerio = require('cheerio');
const iconv = require('iconv-lite');
const TelegramBot = require('node-telegram-bot-api')
const fetch = require('node-fetch');
var Buffer = require('buffer/').Buffer;

const token = '5262605141:AAGXRSSFiL0vvWY0HuyIXu3A4uT0-dOa7LY'


const bot = new TelegramBot(token, { polling: true })
// var connection = mysql.createConnection({
//   host     : '127.0.0.1',
//   user     : 'root',
//   password : '',
//   database : 'mysql'
// });

// var connection = mysql.createConnection({
//   host: 'us-cdbr-iron-east-05.cleardb.net',
//   database: 'heroku_54f7972f233196e',
//   user: 'b6bc2e0ab8eb38',
//   password: '5107652a',
// });



// connection.connect();

// var connection;

// function handleDisconnect() {
//     // db connection
//     connection = mysql.createConnection({
//       // host     : '127.0.0.1',
//       // user     : 'root',
//       // password : '',
//       // database : 'mysql'
//         host: 'us-cdbr-iron-east-05.cleardb.net',
//         database: 'heroku_54f7972f233196e',
//         user: 'b6bc2e0ab8eb38',
//         password: '5107652a',
//         // socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
//     });

//     connection.connect((err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log('Connected to database');
//         }
//     });

//     connection.on('error', function(err) {
//         console.log('db error', err);

//         if(err.code === 'PROTOCOL_CONNECTION_LOST') {
//             handleDisconnect();
//         }else{
//             throw err;
//         }
//     });
// }
  
// handleDisconnect();

// var db_config = {
//   host: 'database-1.ctsvfjllkr7e.us-east-2.rds.amazonaws.com',
//   database: 'mydb',
//   user: 'admin',
//   password: 'PdOH3ARcmZFklRGY5fLW'
// };

// var db_config = {
//   host     : '127.0.0.1',
//   user     : 'root',
//   password : '',
//   database : 'mysql'
// };

var db_config = {
        host: 'us-cdbr-iron-east-05.cleardb.net',
        database: 'heroku_54f7972f233196e',
        user: 'b6bc2e0ab8eb38',
        password: '5107652a',
};

var connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(db_config); // Recreate the connection, since
//                                                   // the old one cannot be reused.

//   connection.connect(function(err) {              // The server is either down
//     if(err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//     }       
//     console.log(`connected to db ${dayjs().format('HH:mm:ss')}`)                              // to avoid a hot loop, and to allow our node script to
//   });                                     // process asynchronous requests in the meantime.
//                                           // If you're also serving http, display a 503 error.
//   connection.on('error', function(err) {
//     console.log('db error', err.message);
//     handleDisconnect();  
//               //   notifier.notify(
//               // {
//               //   title: 'Error',
//               //   message: 'Error',
//               //   // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
//               //   sound: true, // Only Notification Center or Windows Toasters
//               //   wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
//               // });
//     // if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//     //                          // lost due to either server restart, or a
//     // } else {                                      // connnection idle timeout (the wait_timeout
//     //   throw err;                                  // server variable configures this)
//     // }
//   });
// }

// handleDisconnect();



// axios.defaults.withCredentials = true;

let allids = {};
let logWeekly = '';
let lastWeekTotal = 0
let updTotal = 0
let newTotal = 0
let sqlInsert = 0
let sqlUpdate = 0
let roundIds = []
let tl = 0
let dom;

const start = async () => {
  console.log(`Start ${dayjs().format('HH:mm:ss')}`)





  function intervalFunc() {

    const chatid = 514169989;
    console.log(`Checking news: ${dayjs().format('HH:mm:ss')}`)

    fetch('http://pravda.com.ua/rus/news/')
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => iconv.decode(new Buffer(arrayBuffer), 'Win-1251').toString())
    .then((converted) => {

      const $ = cheerio.load(converted); 
      let devtoList = [];
      $('.article_news_red').each(function(i, elem) {
          devtoList[i] = {
              title: $(this).find('a').text().trim(),
              time: $(this).find('.article_time').text().trim()
          }      
      });

      if (devtoList.length > 0) {

        const totime = dayjs().format('HH:mm')
        const fromtime = devtoList[0].time;

        const ft = dayjs(`2000-01-01 ${fromtime}`);
        const tt = dayjs(`2000-01-01 ${totime}`);
        const mins = tt.diff(ft, "minutes", true);
        const totalHours = parseInt(mins / 60);
        const totalMins = dayjs().minute(mins).$m

        if (mins < 10) {
          bot.sendMessage(chatid, devtoList[0].title).catch(e => console.log("in 1", e.message) );
        }

        console.log(devtoList)


      }



    })

  



  }
  setInterval(intervalFunc, 600000);
  

  // await updateRounds();
  // await updateRoundsQuick();
  // await genDates();

}

const parseTech = async () => {

  var exit = []
  var ids = []
  console.log('Parsing Techcrucnh data')

  connection.query('SELECT uuid,website FROM cb_data WHERE crunch = 0', function (error, results, fields) {
    if (error) throw error;

   var arr = results;

    axios({
      method: 'GET',
      url: `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.feedburner.com%2FTechcrunch&count=1000&ranked=newest&similar=true&findUrlDuplicates=true&ck=1610383902987&ct=feedly.desktop&cv=31.0.1051`,
      // responseType: 'json',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
        'Content-Type': 'application/json',
        // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
      },
      // withCredentials: true,
      // httpsAgent: agent
    }).then(res => {
      // ag = randomUseragent.getRandom()
      var m = res.data.items;
        m = m.map(obj => {
        var mm = obj.published.toString()
        // console.log(mm)
        mm = mm.substring(0, mm.length - 3)
        mmm = obj.content.content.match(/[^\/\/][-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}([^\/\\])?/g)
        // var exld = ['techcrunch']
        mmm = mmm.filter(itm => {
          if (itm.includes('facebook') || itm.includes('techcrunch') || itm.includes('feedburner') || itm.includes('jpg') || itm.includes('png') || itm.includes('crunchbase') || itm.includes('html') || itm.includes('pdf') || itm.includes('twitter') || itm.includes('jpeg') || itm.includes('google.com') || itm.includes('amazon') || itm.includes('youtube') || itm.includes('instagram') || itm.includes('linkedin') ) {
            return false
          } else {
            return true
          }
        })
        mmm = mmm.map(o => {
          return o.replace(/[^-0-9a-zA-Z.]/gi, '').match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g) ? o.replace(/[^-0-9a-zA-Z.]/gi, '').match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g)[0].toLowerCase() : null
        })
        // console.log(mmm)
        return mmm
        // console.log()
  
      })
  
      m = _.flattenDeep(m)
      // console.log(_.uniq(m))
      var teched = _.uniq(m)

      ids = arr.map(itm => {

        if (itm.website != '' && itm.website && itm.website.match(/[^\/\/][-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}([^\/\\])?/g) ) {
          var ll = itm.website.match(/[^\/\/][-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}([^\/\\])?/g)[0].match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g) ? itm.website.match(/[^\/\/][-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}([^\/\\])?/g)[0].match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g)[0].toLowerCase() : '';
          // console.log(_.indexOf(teched, ll))
          if (_.indexOf(teched, ll) >= 0) {
            return {site: ll, uuid: itm.uuid};
          } else {
            return ''
          }
          // return ll
  
        } else {
          return ''
        }
  
  
      })

      ids = ids.filter(oo => oo == '' || oo == 'google.com' ? false : true)
      // console.log(ids)
      console.log('Updating DB with Techcrunch data..', ids.length)
      setTimeout(() => {
        console.log('Techrunch done.')
        
      }, ids.length*500);

      ids.map((obj,i2) => {
        setTimeout(() => {
          connection.query(`UPDATE cb_data SET crunch = 1 WHERE uuid = '${obj.uuid}'`, function (error, results, fields) {
            if (error) throw error;
          });

          
        }, i2*500);
      })
  
    })




  })

  // axios({
  //   method: 'GET',
  //   url: `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.feedburner.com%2FTechcrunch&count=600&ranked=newest&similar=true&findUrlDuplicates=true&ck=1610383902987&ct=feedly.desktop&cv=31.0.1051`,
  //   // responseType: 'json',
  //   headers: {
  //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
  //     'Content-Type': 'application/json',
  //     // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
  //   },
  //   // withCredentials: true,
  //   // httpsAgent: agent
  // }).then(res => {
  //   // ag = randomUseragent.getRandom()
  //   var m = res.data.items;
  //     m = m.map(obj => {
  //     var mm = obj.published.toString()
  //     // console.log(mm)
  //     mm = mm.substring(0, mm.length - 3)
  //     mmm = obj.content.content.match(/[^\/\/][-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}([^\/\\])?/g)
  //     // var exld = ['techcrunch']
  //     mmm = mmm.filter(itm => {
  //       if (itm.includes('techcrunch') || itm.includes('feedburner') || itm.includes('jpg') || itm.includes('png') || itm.includes('crunchbase') || itm.includes('html') || itm.includes('pdf') || itm.includes('twitter') || itm.includes('jpeg') || itm.includes('google') || itm.includes('amazon') || itm.includes('youtube') || itm.includes('instagram') || itm.includes('linkedin') ) {
  //         return false
  //       } else {
  //         return true
  //       }
  //     })
  //     mmm = mmm.map(o => {
  //       return o.replace(/[^-0-9a-zA-Z.]/gi, '').match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g) ? o.replace(/[^-0-9a-zA-Z.]/gi, '').match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/g)[0].toLowerCase() : null
  //     })
  //     // console.log(mmm)
  //     return mmm
  //     // console.log()

  //   })

  //   m = _.flattenDeep(m)
  //   // console.log(_.uniq(m))


  // })
  
}


const getAllIds = async () => {
  console.log('Wait for DB connection')
  await delay(3000)
  console.log('Start getting ids')
  connection.query('SELECT uuid, number_round, amount, last_date, rounds FROM cb_data', function (error, results, fields) {
    if (error) throw error;
    console.log('Got data from DB')
    results.map((item,i) => {
      // allids = {...allids, [item.uuid]: { num: item.number_round, amount: item.amount, lastdate: item.last_date }}
      allids[item.uuid] = { num: item.number_round, amount: item.amount, lastdate: item.last_date, pr: item.rounds ? item.rounds : '' }
      // console.log(i)
    });
    // console.log(allids)
    // console.log('Got all ids.')
    // updAllTemp()
    // console.log(allids)
    connection.query('SELECT day FROM cb_dates order by day asc', function (error, results, fields) {
      if (error) throw error;
      const minDate = moment(results[results.length-1].day).add(1, 'days').format('MM/DD/YYYY');
      const maxDate = moment(results[results.length-1].day).add(7, 'days').format('MM/DD/YYYY');
    // console.log(minDate,maxDate)
    console.log('Selected dates.')
    })

  });
}

const getWeeklyData = async () => {
  // handleDisconnect()

  connection.query('SELECT day FROM cb_dates order by day asc', function (error, results, fields) {
    if (error) {
      console.log(error.message,'@333') 
    };
    const minDate = moment(results[results.length-1].day).add(1, 'days').format('MM/DD/YYYY');
    const maxDate = moment(results[results.length-1].day).add(7, 'days').format('MM/DD/YYYY');

  let v1Rec = 0;
  let v0Rec = 0;
  let v1NewRec = 0;
  let v1UpdRec = 0;
  let v0NewRec = 0;
  let v0UpdRec = 0;
  const startDate = minDate;
  const endDate = maxDate;

// console.log(moment().format('l'));
console.log('Getting weekly data..')
  axios({
    method: 'POST',
    url: 'https://www.crunchbase.com/v4/data/lists/organization.companies/cc51b2d8-5ee7-44ed-a2ce-8f6094a96019?source=list',
    data: {
      "field_ids": [
          "identifier",
          "location_identifiers",
          "founded_on",
          "last_funding_type",
          "rank_org_company",
          "num_funding_rounds",
          "last_funding_at",
          "num_investors",
          "funding_total",
          "website",
          "investor_identifiers",
          "description",
          "short_description"
      ],
      "order": [],
      "query": [
          {
              "type": "predicate",
              "field_id": "num_funding_rounds",
              "operator_id": "between",
              "values": [
                  1,
                  6
              ]
          },
          {
              "type": "predicate",
              "field_id": "last_funding_at",
              "operator_id": "between",
              "values": [
                  startDate,
                  endDate
              ]
          }
      ],
      "field_aggregators": [],
      "collection_id": "organization.companies",
      "limit": 1000
  },
    // responseType: 'json',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
      'Content-Type': 'application/json',
      'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
    },
    withCredentials: true
  }).then(res => {
    v0Rec = res.data.entities.length
    lastWeekTotal = res.data.entities.length
    // console.log(res.data.entities.length)
    // console.log(res.data.entities[0])
    tl = res.data.entities.length;
    res.data.entities.map((item,i) => {
      roundIds.push(item.uuid)
      if (!allids[item.uuid]) {
        v0NewRec++;
        let loc = '';

        if (item.properties.location_identifiers) {
          loc = item.properties.location_identifiers.reduce((prev,cur) => {
            return prev == '' ? cur.value : prev + ', ' + cur.value
          },'')
        } else {
          loc = '-'
        }
        loc = loc.replace(/[^0-9a-z, ]/gi, '')
        const name = item.properties.identifier.value.replace(/\W/g, '')

        allids = {...allids, [item.uuid]: { num: item.properties.num_funding_rounds}}

        const website = item.properties.website ? item.properties.website.value : '';
        const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
        const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
        let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value.replace(/[^0-9a-zA-Z, ]/gi, '') : prev + ', ' + cur.value.replace(/[^0-9a-zA-Z, ]/gi, '')},'') : '';
        topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
        sqlInsert++
        
        setTimeout(async () => {
          connection.query(`INSERT INTO cb_data (isrounds,isnewtype,website,short_description,description,topinvestors,image,amount,investors,uuid,location,name,last_date,cb_rank,cb_link,founded,number_round) VALUES ('0','new','${website}','${short_description}','${description}','${topinvestors}','${item.properties.identifier.image_id ? item.properties.identifier.image_id : ''}','${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}','${item.properties.num_investors ? item.properties.num_investors : 0}','${item.uuid}','${loc}','${name}','${item.properties.last_funding_at}','${item.properties.rank_org_company ? item.properties.rank_org_company : 0}','${item.properties.identifier.permalink}','${!item.properties.founded_on ? '' : item.properties.founded_on.value}','${item.properties.num_funding_rounds}')`, function (error, results, fields) {
            if (error) throw error;
          });
        },i*500)

      } else if (allids[item.uuid]) {
        v0UpdRec++;
        const website = item.properties.website ? item.properties.website.value : '';
        const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
        const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
        let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value : prev + ', ' + cur.value},'') : '';
        topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
        sqlUpdate++
        setTimeout(async () => {
          connection.query(`UPDATE cb_data SET isrounds = 0, prounds = '${allids[item.uuid].pr}', website = '${website}', short_description = '${short_description}', description = '${description}', topinvestors = '${topinvestors}', last_date = '${item.properties.last_funding_at}', cb_rank = ${item.properties.rank_org_company ? item.properties.rank_org_company : 0}, number_round = ${item.properties.num_funding_rounds}, amount = ${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}, investors = ${item.properties.num_investors ? item.properties.num_investors : 0} WHERE uuid = '${item.uuid}'`, function (error, results, fields) {
            if (error) throw error;
          });

        },i*500)

      }
    })
  }).then (res => {
    // console.log('Done others')
    axios({
      method: 'POST',
      url: 'https://www.crunchbase.com/v4/data/lists/organization.companies/cc51b2d8-5ee7-44ed-a2ce-8f6094a96019?source=list',
      data: {
        "field_ids": [
            "identifier",
            "location_identifiers",
            "founded_on",
            "last_funding_type",
            "rank_org_company",
            "num_funding_rounds",
            "last_funding_at",
            "num_investors",
            "funding_total",
            "website",
            "investor_identifiers",
            "description",
            "short_description"
        ],
        "order": [],
        "query": [
          {
              "type": "predicate",
              "field_id": "num_funding_rounds",
              "operator_id": "between",
              "values": [
                  1,
                  6
              ]
          },
          {
              "type": "predicate",
              "field_id": "last_funding_at",
              "operator_id": "between",
              "values": [
                  startDate,
                  endDate
              ]
          },
          {
              "type": "sub_query",
              "collection_id": "principal.has_investor.forward",
              "query": [
                  {
                      "type": "predicate",
                      "field_id": "identifier",
                      "operator_id": "includes",
                      "values": [
                          "902deab4-ec41-68ce-d9df-c0c959578176",
                          "0c867fde-2b9a-df10-fdb9-66b74f355f91",
                          "ce91bad7-b6d8-e56e-0f45-4763c6c5ca29",
                          "fe5a4983-a46a-2fc2-5633-e35e0a86b694",
                          "73633ee4-ea65-2967-6c5d-9b5fec7d2d5e",
                          "b08efc27-da40-505a-6f9d-c9e14247bf36",
                          "fe2d1e8b-f607-3c9f-fad7-98fb8412f77e",
                          "34a9bb66-0984-8de0-e7fb-13e976b4a135",
                          "043d9e52-dcc0-0dd8-6074-206e42e20e13",
                          "e2006571-6b7a-e477-002a-f7014f48a7e3",
                          "fb2f8884-ec07-895a-48d7-d9a9d4d7175c",
                          "183e23e7-1565-5b63-c834-441995a6d151",
                          "5ebcc6de-af7b-422c-d7d8-b91bfec0be36",
                          "d5df3873-7871-c608-0284-c74d0b555ccd",
                          "47b84763-9727-7cdf-b194-2742e3963147",
                          "b5d0d7dd-cfc2-4c56-9ed4-847db73f8cee",
                          "ed24f9ce-2313-cb8c-8ff2-9de6899ea992",
                          "735a53c6-a7ba-2434-d97d-b788536da89d",
                          "18019029-7c3e-8476-c4f3-9216298db9e1",
                          "2d0a5bf0-e53e-9a07-2243-9bcd561421ec"
                      ]
                  }
              ]
          }
      ],
        "field_aggregators": [],
        "collection_id": "organization.companies",
        "limit": 1000
    },
      // responseType: 'json',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
        'Content-Type': 'application/json',
        'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
      },
      withCredentials: true
    }).then(res => {
      v1Rec = res.data.entities.length
      // console.log(res.data.entities.length)
      res.data.entities.map((item,i) => {
        if (!roundIds.includes(item.uuid)) {
          roundIds.push(item.uuid)
        }
        let loc = ''
        if (!allids[item.uuid]) {
          v1NewRec++;
          if (item.properties.location_identifiers) {
            loc = item.properties.location_identifiers.reduce((prev,cur) => {
              return prev == '' ? cur.value : prev + ', ' + cur.value
            },'')
          } else {
            loc = '-'
          }
          loc = loc.replace(/[^0-9a-z, ]/gi, '')
          const name = item.properties.identifier.value.replace(/\W/g, '')

          allids = {...allids, [item.uuid]: { num: item.properties.num_funding_rounds}}
          // console.log(item)
          const website = item.properties.website ? item.properties.website.value : '';
          const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value : prev + ', ' + cur.value},'') : '';
          topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
          sqlInsert++
          setTimeout(async () => {
            connection.query(`INSERT INTO cb_data (isrounds,isnewtype,type,website,short_description,description,topinvestors,image,amount,investors,uuid,location,name,last_date,cb_rank,cb_link,founded,number_round) VALUES ('0','new','1','${website}','${short_description}','${description}','${topinvestors}','${item.properties.identifier.image_id ? item.properties.identifier.image_id : ''}','${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}','${item.properties.num_investors ? item.properties.num_investors : 0}','${item.uuid}','${loc}','${name}','${item.properties.last_funding_at}','${item.properties.rank_org_company ? item.properties.rank_org_company : 0}','${item.properties.identifier.permalink}','${!item.properties.founded_on ? '' : item.properties.founded_on.value}','${item.properties.num_funding_rounds}')`, function (error, results, fields) {
            });

          },i*500)

        } else if (allids[item.uuid]) {
          v1UpdRec++
          const website = item.properties.website ? item.properties.website.value : '';
          const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value : prev + ', ' + cur.value},'') : '';
          topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
          sqlUpdate++
          setTimeout(async () => {
            connection.query(`UPDATE cb_data SET isrounds = 0, type = 1, website = '${website}', short_description = '${short_description}', description = '${description}', topinvestors = '${topinvestors}', last_date = '${item.properties.last_funding_at}', cb_rank = ${item.properties.rank_org_company ? item.properties.rank_org_company : 0}, number_round = ${item.properties.num_funding_rounds}, amount = ${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}, investors = ${item.properties.num_investors ? item.properties.num_investors : 0} WHERE uuid = '${item.uuid}'`, function (error, results, fields) {
              if (error) throw error;
            });
  
          },i*500 + tl*500 + 3000)

        }
      })
    }).then (res => {
      connection.query(`INSERT INTO cb_dates (day) VALUES ('${moment(startDate,'MM/DD/YYYY').format('YYYY-MM-DD HH:mm:ss')}')`, function (error, results, fields) {
        if (error) throw error;
        connection.query(`INSERT INTO cb_dates (day) VALUES ('${moment(endDate,'MM/DD/YYYY').format('YYYY-MM-DD HH:mm:ss')}')`, function (error, results, fields) {
          if (error) throw error;
          console.log(`Weekly v0: ${v0Rec}/${v0NewRec}/${v0UpdRec} v1: ${v1Rec}/${v1NewRec}/${v1UpdRec}. Period: ${startDate} - ${endDate}`)
          // console.log(`Tota:`)
          logWeekly = `Weekly v0: ${v0Rec}/${v0NewRec}/${v0UpdRec} v1: ${v1Rec}/${v1NewRec}/${v1UpdRec}. Period: ${startDate} - ${endDate}`;
          updAll();
        });
      });
      
    })
    .catch(err => {
      console.log(err)
    })

  })
  .catch(err => {
    console.log(err)
  })

})

}

var x = '01-04-2016';
var y = dayjs(x).add(6,'day');

const genDates = async () => {


    connection.query(`INSERT INTO cb_dates (day) VALUES ('${dayjs(x).format('YYYY-MM-DD HH:mm:ss')}')`, function (error, results, fields) {
      if (error) throw error;
      connection.query(`INSERT INTO cb_dates (day) VALUES ('${dayjs(y).format('YYYY-MM-DD HH:mm:ss')}')`, function (error, results, fields) {
        if (error) throw error;
        x = dayjs(x).add(7,'day')
        y = dayjs(y).add(7,'day')
        genDates()
      });
    });
    // console.log(dayjs(x).format('YYYY-MM-DD HH:mm:ss'))
    // console.log(dayjs(y).format('YYYY-MM-DD HH:mm:ss'))


    
}

const updateRounds = async () => {
  let queryInvestors = []
  let init = []
  let arr = []
  let ag = randomUseragent.getRandom();
  let ids = []
  console.log('Updating rounds..')
  connection.query('SELECT uuid,website FROM cb_data WHERE isrounds = 0', function (error, results, fields) {
    if (error) throw error;

    var teched = []

    arr = results.map(itm => {
      return itm.uuid;
    })
    console.log(arr.length)

    mr = results

      arr.map((itm,i1) => {

        setTimeout(async () => {
    
          axios({
            method: 'GET',
            url: `https://www.crunchbase.com/v4/data/entities/organizations/${itm}?field_ids=[%22identifier%22,%22layout_id%22,%22facet_ids%22,%22title%22,%22short_description%22,%22is_locked%22]&layout_mode=view_v2`,
            // responseType: 'json',
            headers: {
              'user-agent': ag,
              'Content-Type': 'application/json',
              // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
            },
            withCredentials: true,
            httpsAgent: agent
          }).then(res => {
            // console.log('go')
            let rounds = res.data.cards.funding_rounds_list ? res.data.cards.funding_rounds_list : [];
            let investors = res.data.cards.investors_list ? res.data.cards.investors_list : [];
            // console.log(rounds,investors)
    
            queryInvestors = investors.map(item => {
              return item.investor_identifier.uuid
            })
            queryInvestors = _.uniq(queryInvestors);
            axios({
              method: 'POST',
              url: 'https://www.crunchbase.com/v4/data/searches/principal.investors?source=custom_query_builder',
              data: {
                "field_ids": [
                    "identifier",
                    "num_investments_funding_rounds",
                    "num_exits",
                    "location_identifiers",
                    "rank_principal_investor"
                ],
                "order": [
                    {
                        "field_id": "num_investments_funding_rounds",
                        "sort": "desc"
                    }
                ],
                "query": [
                    {
                        "type": "predicate",
                        "field_id": "identifier",
                        "operator_id": "includes",
                        "include_nulls": null,
                        "values": queryInvestors
                    }
                ],
                "field_aggregators": [],
                "collection_id": "principal.investors",
                "limit": 50
            },
              // responseType: 'json',
              headers: {
                'user-agent': ag,
                'Content-Type': 'application/json',
                'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
              },
              withCredentials: true,
              httpsAgent: agent
            })
            .then(res => {
    
              // console.log(res.data)
              // console.log(_.uniq(queryInvestors))
              queryInvestors = queryInvestors.map(item => {
                var x = {}
                res.data.entities.map(obj => {
                  if (item === obj.uuid) {
                    x = {
                      uuid: item,
                      name: obj.properties.identifier ? obj.properties.identifier.value.replace(/[^-0-9a-zA-Z,.:/ ]/gi, '') : '',
                      numr: obj.properties.num_investments_funding_rounds ? obj.properties.num_investments_funding_rounds : 0,
                      rank: obj.properties.rank_principal_investor ? obj.properties.rank_principal_investor : 0,
                      loc: obj.properties.location_identifiers ? obj.properties.location_identifiers[2] ? obj.properties.location_identifiers[2].value.replace(/[^-0-9a-zA-Z,.:/ ]/gi, '') : '' : '',
                      exit: obj.properties.num_exits ? obj.properties.num_exits : 0
                    }
                  }
                })
                return x
              })
              
              // console.log(queryInvestors)
              queryInvestors = _.orderBy(queryInvestors,['rank'])
              // console.log(investors)
    
              let ex = rounds.map(itm1 => {
    
                var n = investors.filter(obj => {
                  if (obj.funding_round_identifier.uuid === itm1.identifier.uuid) {
                    // return _.filter(queryInvestors, { uuid: itm.identifier.uuid })
                    // return obj.funding_round_identifier.uuid
                    return true
                  } else {
                    return false
                  }
    
                }).map(i => {
                  return _.filter(queryInvestors, { uuid: i.investor_identifier.uuid })[0]
                })
                n = _.orderBy(n,['rank'])
    
                // console.log(n)
    
                return ({
                  uuid: itm1.identifier.uuid,
                  name: itm1.identifier.value ? itm1.identifier.value.replace(/[^-0-9a-zA-Z,.:/ ]/gi, '') : null,
                  date: itm1.announced_on ? itm1.announced_on : null,
                  vusd: itm1.money_raised ? itm1.money_raised.value_usd : 0,
                  ninv: itm1.num_investors ? itm1.num_investors : 0,
                  inv: n
                })
              })
    
    
              // console.log(ex[0].inv)
              
              connection.query(`UPDATE cb_data SET rounds = '${JSON.stringify(ex)}', isrounds = 1  WHERE uuid = '${itm}'`, function (error, results, fields) {
                if (error) {
                  console.log(error.message,'@780')
                  if (error.message.includes('closed')) {
                    handleDisconnect()
      
                  }

                }
                console.log(`Updated investor: ${i1+1} / ${arr.length} T: ${dayjs().format('HH:mm:ss')} UUID: ${itm}`)
               });
    
            }).catch(err => {

              console.log(err.message,'@787')
              ag = randomUseragent.getRandom()

    
            })
    
    
    
    
    
          }).catch(err => {
  
            // notifier.notify(
            //   {
            //     title: 'Error',
            //     message: 'Error',
            //     // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
            //     sound: true, // Only Notification Center or Windows Toasters
            //     wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            //   });
            console.log(err.message,'@807')
            if (err.message == 'Request failed with status code 404') {
              connection.query(`UPDATE cb_data SET isrounds = 1 WHERE uuid = '${itm}'`, function (error, results, fields) {
                if (error) throw error;
                // console.log(`Updated investor: ${i1+1} / ${arr.length} T: ${dayjs().format('HH:mm:ss')} UUID: ${itm}`)
               });
            } else if (err.message.includes('403')) {

              // console.log('Error. Exit.')
              // process.exit(1)

                          // axios({
                          //     method: 'GET',
                          //     url: `http://185.70.109.21/x180x89hw34fb77u1c250h2kls3pfr9m6.php`,
                          //     // responseType: 'json',
                          //     headers: {
                          //       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
                          //       'Content-Type': 'application/json',
                          //       // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
                          //     },
                          //     // withCredentials: true,
                          //     // httpsAgent: agent
                          //   }).then(res => {
                          //     ag = randomUseragent.getRandom()
                  
                          //   })
            }
            ag = randomUseragent.getRandom()
  
            // axios({
            //   method: 'GET',
            //   url: `http://185.70.109.21/x113xn50tz8b0980br851f4i02tpwl7o2.php`,
            //   // responseType: 'json',
            //   headers: {
            //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
            //     'Content-Type': 'application/json',
            //     // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
            //   },
            //   // withCredentials: true,
            //   // httpsAgent: agent
            // }).then(res => {
            //   ag = randomUseragent.getRandom()
  
            // })
  
  
  
          })
    
    
    
          // connection.query(`UPDATE cb_data SET isnewtype = 'lr_date=${dayjs(allids[item.uuid].lastdate).format('DD-MM-YYYY')},lr_num=${allids[item.uuid].num};lr_amount=${numeral(allids[item.uuid].amount).format('($ 0.0a)')}', last_date = '${item.properties.last_funding_at}', cb_rank = ${item.properties.rank_org_company ? item.properties.rank_org_company : 0}, number_round = ${item.properties.num_funding_rounds}, amount = ${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}, investors = ${item.properties.num_investors ? item.properties.num_investors : 0}, isNew = 1 WHERE uuid = '${item.uuid}'`, function (error, results, fields) {
          //   if (error) throw error;
          // });
    
        },i1*30000)
    
    
      })

    



    setTimeout(() => {

      connection.query('SELECT uuid FROM cb_data WHERE isrounds = 0', async function (error, results, fields) {
        if (results.length > 0) {
          await updateRounds()
        } else {
          console.log('All rounds updated. Exit.')
          process.exit(1)
        }
      })


        // notifier.notify(
        //   {
        //     title: 'Parser script',
        //     message: 'Done',
        //     // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
        //     sound: true, // Only Notification Center or Windows Toasters
        //     wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        //   });

      
    }, (arr.length+10)*30000);





  })
  



}

const updateRoundsQuick = async () => {
  let queryInvestors = []
  let init = []
  let arr = []
  let ag = randomUseragent.getRandom();
  let ids = []
  console.log('Updating rounds..')
  connection.query('SELECT uuid FROM cb_data WHERE isrounds = 0 OR isrounds is NULL', function (error, results, fields) {
    if (error) throw error;

    var teched = []

    arr = results.map(itm => {
      return itm.uuid;
    })
    console.log(arr.length)

    mr = results

      arr.map((itm,i1) => {

        setTimeout(async () => {
    
          axios({
            method: 'GET',
            url: `https://www.crunchbase.com/v4/data/entities/organizations/${itm}?field_ids=[%22identifier%22,%22layout_id%22,%22facet_ids%22,%22title%22,%22short_description%22,%22is_locked%22]&layout_mode=view_v2`,
            // responseType: 'json',
            headers: {
              'user-agent': ag,
              'Content-Type': 'application/json',
              // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
            },
            withCredentials: true,
            httpsAgent: agent
          }).then(res => {
            // console.log('go')
            let rounds = res.data.cards.funding_rounds_list ? res.data.cards.funding_rounds_list : [];
            let investors = res.data.cards.investors_list ? res.data.cards.investors_list : [];

    
            let ex = rounds.map(itm1 => {

  
              // console.log(n)
  
              return ({
                uuid: itm1.identifier.uuid,
                name: itm1.identifier.value ? itm1.identifier.value.replace(/[^-0-9a-zA-Z,.:/ ]/gi, '') : null,
                date: itm1.announced_on ? itm1.announced_on : null,
                vusd: itm1.money_raised ? itm1.money_raised.value_usd : 0,
                ninv: itm1.num_investors ? itm1.num_investors : 0,
                inv: []
              })
            })
    
    
              // console.log(ex[0].inv)
              
            connection.query(`UPDATE cb_data SET rounds = '${JSON.stringify(ex)}', isrounds = 1  WHERE uuid = '${itm}'`, function (error, results, fields) {
              if (error) throw error;
              console.log(`Updated investor: ${i1+1} / ${arr.length} T: ${dayjs().format('HH:mm:ss')} UUID: ${itm}`)
              });
    

    
    
    
    
    
          }).catch(err => {
  
            // notifier.notify(
            //   {
            //     title: 'Error',
            //     message: 'Error',
            //     // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
            //     sound: true, // Only Notification Center or Windows Toasters
            //     wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            //   });
            console.log(err.message,'@965')
            // console.log('here')
            // console.log(err.message.includes('403'))
            if (err.message.includes('403')) {
              // console.log('here')
              // notifier.notify(
              // {
              //   title: 'Error',
              //   message: '403',
              //   // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
              //   sound: true, // Only Notification Center or Windows Toasters
              //   wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
              // });

            }
            ag = randomUseragent.getRandom()
  
            // axios({
            //   method: 'GET',
            //   url: `http://185.70.109.21/x113xn50tz8b0980br851f4i02tpwl7o2.php`,
            //   // responseType: 'json',
            //   headers: {
            //     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
            //     'Content-Type': 'application/json',
            //     // 'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
            //   },
            //   // withCredentials: true,
            //   // httpsAgent: agent
            // }).then(res => {
            //   ag = randomUseragent.getRandom()
  
            // })
  
  
  
          })
    
    
    
          // connection.query(`UPDATE cb_data SET isnewtype = 'lr_date=${dayjs(allids[item.uuid].lastdate).format('DD-MM-YYYY')},lr_num=${allids[item.uuid].num};lr_amount=${numeral(allids[item.uuid].amount).format('($ 0.0a)')}', last_date = '${item.properties.last_funding_at}', cb_rank = ${item.properties.rank_org_company ? item.properties.rank_org_company : 0}, number_round = ${item.properties.num_funding_rounds}, amount = ${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}, investors = ${item.properties.num_investors ? item.properties.num_investors : 0}, isNew = 1 WHERE uuid = '${item.uuid}'`, function (error, results, fields) {
          //   if (error) throw error;
          // });
    
        },i1*4000)
    
    
      })

    



    // setTimeout(() => {

    //     notifier.notify(
    //       {
    //         title: 'Parser script',
    //         message: 'Done',
    //         // icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
    //         sound: true, // Only Notification Center or Windows Toasters
    //         wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
    //       });

      
    // }, arr.length*30000);





  })
  



}



const updAll = async () => {
  let maillog = ''
  connection.query('SELECT day FROM cb_dates order by day asc', async function (error, results, fields) {
    if (error) throw error;
    while (results.length > 2) {
      await delay(15000)
      const minDate = moment(results[0].day).format('MM/DD/YYYY');
      const maxDate = moment(results[1].day).format('MM/DD/YYYY');
      results.shift()
      results.shift()
      // console.log(minDate, maxDate)
  
      let v1Rec = 0;
      let v0Rec = 0;
      let v1NewRec = 0;
      let v1UpdRec = 0;
      let v0NewRec = 0;
      let v0UpdRec = 0;
      const startDate = minDate;
      const endDate = maxDate;
    
    // console.log(moment().format('l'));
      axios({
        method: 'POST',
        url: 'https://www.crunchbase.com/v4/data/lists/organization.companies/cc51b2d8-5ee7-44ed-a2ce-8f6094a96019?source=list',
        data: {
          "field_ids": [
              "identifier",
              "location_identifiers",
              "founded_on",
              "last_funding_type",
              "rank_org_company",
              "num_funding_rounds",
              "last_funding_at",
              "num_investors",
              "funding_total",
              "website",
              "investor_identifiers",
              "description",
              "short_description"
          ],
          "order": [],
          "query": [
              {
                  "type": "predicate",
                  "field_id": "num_funding_rounds",
                  "operator_id": "between",
                  "values": [
                      1,
                      6
                  ]
              },
              {
                  "type": "predicate",
                  "field_id": "last_funding_at",
                  "operator_id": "between",
                  "values": [
                      startDate,
                      endDate
                  ]
              }
          ],
          "field_aggregators": [],
          "collection_id": "organization.companies",
          "limit": 10000
      },
        // responseType: 'json',
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
          'Content-Type': 'application/json',
          'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
        },
        withCredentials: true
      }).then(res => {
        v0Rec = res.data.entities.length
        // console.log(res.data.entities.length)
        res.data.entities.map((item,i) => {
          let amt = item.properties.funding_total ? item.properties.funding_total.value_usd : 0;
          
          if (!allids[item.uuid]) {
            newTotal++
            v0NewRec++;
            let loc = '';
            roundIds.push(item.uuid)
    
            if (item.properties.location_identifiers) {
              loc = item.properties.location_identifiers.reduce((prev,cur) => {
                return prev == '' ? cur.value : prev + ', ' + cur.value
              },'')
            } else {
              loc = '-'
            }
            loc = loc.replace(/[^0-9a-z, ]/gi, '')
            const name = item.properties.identifier.value.replace(/\W/g, '')
    
            allids = {...allids, [item.uuid]: { num: item.properties.num_funding_rounds}}
  
          const website = item.properties.website ? item.properties.website.value : '';
          const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value ? cur.value.replace(/[^0-9a-zA-Z, ]/gi, '') : '' : cur.value ? prev + ', ' + cur.value.replace(/[^0-9a-zA-Z, ]/gi, '') : ''},'') : '';
          topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
          sqlInsert++
          setTimeout(async () => {
            connection.query(`INSERT INTO cb_data (isrounds,isnewtype,isNew,website,short_description,description,topinvestors,image,amount,investors,uuid,location,name,last_date,cb_rank,cb_link,founded,number_round) VALUES ('0','new','1','${website}','${short_description}','${description}','${topinvestors}','${item.properties.identifier.image_id ? item.properties.identifier.image_id : ''}','${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}','${item.properties.num_investors ? item.properties.num_investors : 0}','${item.uuid}','${loc}','${name}','${item.properties.last_funding_at}','${item.properties.rank_org_company ? item.properties.rank_org_company : 0}','${item.properties.identifier.permalink}','${!item.properties.founded_on ? '' : item.properties.founded_on.value}','${item.properties.num_funding_rounds}')`, function (error, results, fields) {
              if (error) throw error;
            });

          },i*500)

          } else if ((allids[item.uuid] && allids[item.uuid].num != item.properties.num_funding_rounds) || (allids[item.uuid] && amt != allids[item.uuid].amount)) {
            v0UpdRec++;
            updTotal++
            roundIds.push(item.uuid)
            sqlUpdate++
            setTimeout(async () => {
              connection.query(`UPDATE cb_data SET prounds = '${allids[item.uuid].pr}', last_date = '${item.properties.last_funding_at}', cb_rank = ${item.properties.rank_org_company ? item.properties.rank_org_company : 0}, number_round = ${item.properties.num_funding_rounds}, amount = ${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}, investors = ${item.properties.num_investors ? item.properties.num_investors : 0}, isNew = 1, isrounds = 0 WHERE uuid = '${item.uuid}'`, function (error, results, fields) {
                if (error) throw error;
              });
    
            },i*500)

          }
        })
      }).then (res => {
  
        maillog += `Upd: ${v0Rec}/${v0NewRec}/${v0UpdRec}. Period: ${startDate} - ${endDate}\n`
        console.log(`All: ${v0Rec}/${v0NewRec}/${v0UpdRec}. Period: ${startDate} - ${endDate}`)
        if (results.length <= 2) {
          // maillog += `Total LW: ${lastWeekTotal} New:${newTotal} Upd:${updTotal}`
          console.log(`Total LW: ${lastWeekTotal} New:${newTotal} Upd:${updTotal} SQLInsert: ${sqlInsert} SQLUpdate: ${sqlUpdate}`)   
      
          console.log('Getting rounds data.. Array size: ', roundIds.length)
      
          console.log(`Done. Wating ${roundIds.length*500/1000} sec until SQL finish. Time: ${dayjs().format('HH:mm:ss')}`,)
          // await delay()
          setTimeout(() => {
            updateRounds()
            parseTech()
          },roundIds.length*500)

        }
  
         });

    }




    // const request = Mailjet
    // .post("send", {'version': 'v3.1'})
    // .request({
    //   "Messages":[
    //     {
    //       "From": {
    //         "Email": "googleme@i.ua",
    //         "Name": "CB Parser"
    //       },
    //       "To": [
    //         {
    //           "Email": "oleksandr.bash@gmail.com",
    //           "Name": "Alex"
    //         }
    //       ],
    //       "Subject": "CB Parser Weekly",
    //       "TextPart": `${logWeekly} \n\n ${maillog}`,
    //       "CustomID": "AppGettingStartedTest"
    //     }
    //   ]
    // })
    //   request
    //     .then((result) => {
    //       console.log(result.body)
    //       console.log('Email sent. Done. Exit.')
    //       // process.exit()
          
    //     })
    //     .catch((err) => {
    //       console.log(err.statusCode)
    //     })
    

  });
}

const updAllTemp = async () => {
  let maillog = ''
  connection.query('SELECT day FROM cb_dates order by day asc', async function (error, results, fields) {
    if (error) throw error;
    while (results.length > 2) {

      const minDate = moment(results[0].day).format('MM/DD/YYYY');
      const maxDate = moment(results[1].day).format('MM/DD/YYYY');
      results.shift()
      results.shift()
      // console.log(minDate, maxDate)
  
      let v1Rec = 0;
      let v0Rec = 0;
      let v1NewRec = 0;
      let v1UpdRec = 0;
      let v0NewRec = 0;
      let v0UpdRec = 0;
      const startDate = minDate;
      const endDate = maxDate;
    
    // console.log(moment().format('l'));
      axios({
        method: 'POST',
        url: 'https://www.crunchbase.com/v4/data/lists/organization.companies/cc51b2d8-5ee7-44ed-a2ce-8f6094a96019?source=list',
        data: {
          "field_ids": [
              "identifier",
              "location_identifiers",
              "founded_on",
              "last_funding_type",
              "rank_org_company",
              "num_funding_rounds",
              "last_funding_at",
              "num_investors",
              "funding_total",
              "website",
              "investor_identifiers",
              "description",
              "short_description"
          ],
          "order": [],
          "query": [
              {
                  "type": "predicate",
                  "field_id": "num_funding_rounds",
                  "operator_id": "between",
                  "values": [
                      1,
                      6
                  ]
              },
              {
                  "type": "predicate",
                  "field_id": "last_funding_at",
                  "operator_id": "between",
                  "values": [
                      startDate,
                      endDate
                  ]
              }
          ],
          "field_aggregators": [],
          "collection_id": "organization.companies",
          "limit": 10000
      },
        // responseType: 'json',
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
          'Content-Type': 'application/json',
          'Cookie': 'authcookie=eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI5ZGJlY2E0Yy0zMjE5LTRlNDgtOGFiYS01ZDA5M2RhMTUyODUiLCJpc3MiOiJ1c2Vyc2VydmljZV84NjYyN2FkOF8yMDYiLCJzdWIiOiIzMTQ3YWYyMS0zOTBlLTQzYzMtYjkxZi1mZTJlMDI0Mjc5OWIiLCJleHAiOjE1ODg4MzkzOTEsImlhdCI6MTU4ODgzOTA5MSwicHJpdmF0ZSI6IlhBbVRTc2V5enVsWjVuRE5BTnlJOTRuUjNoQ01tN0wvczVwaGdQekpFZDcyc3FHOE96THFveXFLTldVRVNXVHVBNWo0QTVjL29DcjZiMU9BM1pNa1BIa1ZHdXJKcWI2ZnNaUzg2a05TekR6a3I3SWt6N3ZScnBXQzFlNTBYKzBqUnh1dldaTUNRRWFZTHRQaGVzRVZkaE9hdWJ6MUIzUklaZm5mR01YUjRRc0dFVERaSWsxcW9tMysxSmk4MlRSNG1id3IwRWl0ZWtPMGpycDc5RTE1YWs0dmR6ZDR0Skw4TXowMlVFUktWZnBXcXRrbWhPOEdFS0NLc1VQMC9TT3dJV0NHNHhleXdGY3cxNDVQL0VBcTBaWUNSUGZMMkFiNWNScXhhTmR3UEpVZkRDblN4czdnWEliRFdJaFgycGo4Yll1Qzh6QVRMUkR0OU5UbmEvWVhkazFTZ3hsTDAvcjM0RVJNdml0OUg3MD0ifQ.MekVzc3xWNhg-jYH24r5dvltPtnsKzQ83vNLGQ-vbx4Ng7M70MmBypzLtnxXmhsk0tNVJZVrbWuwfwRJWeU0rQ'
        },
        withCredentials: true,
        httpsAgent: agent
      }).then(res => {
        v0Rec = res.data.entities.length
        // console.log(res.data.entities.length)
        res.data.entities.map((item,i) => {
          let amt = item.properties.funding_total ? item.properties.funding_total.value_usd : 0;
          
          if (!allids[item.uuid]) {
            newTotal++
            v0NewRec++;
            let loc = '';
            roundIds.push(item.uuid)
    
            if (item.properties.location_identifiers) {
              loc = item.properties.location_identifiers.reduce((prev,cur) => {
                return prev == '' ? cur.value : prev + ', ' + cur.value
              },'')
            } else {
              loc = '-'
            }
            loc = loc.replace(/[^0-9a-z, ]/gi, '')
            const name = item.properties.identifier.value.replace(/\W/g, '')
    
            allids = {...allids, [item.uuid]: { num: item.properties.num_funding_rounds}}
  
          const website = item.properties.website ? item.properties.website.value : '';
          const short_description = item.properties.short_description ? item.properties.short_description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          const description = item.properties.description ? item.properties.description.replace(/[^0-9a-zA-Z, ]/gi, '') : '';
          let topinvestors = item.properties.investor_identifiers ? item.properties.investor_identifiers.reduce((prev,cur) => {return prev == '' ? cur.value.replace(/[^0-9a-zA-Z, ]/gi, '') : prev + ', ' + cur.value.replace(/[^0-9a-zA-Z, ]/gi, '')},'') : '';
          topinvestors = topinvestors.replace(/[^0-9a-zA-Z, ]/gi, '')
          sqlInsert++

            connection.query(`INSERT INTO cb_data (isrounds,isnewtype,isNew,website,short_description,description,topinvestors,image,amount,investors,uuid,location,name,last_date,cb_rank,cb_link,founded,number_round) VALUES ('0','new','1','${website}','${short_description}','${description}','${topinvestors}','${item.properties.identifier.image_id ? item.properties.identifier.image_id : ''}','${item.properties.funding_total ? item.properties.funding_total.value_usd : 0}','${item.properties.num_investors ? item.properties.num_investors : 0}','${item.uuid}','${loc}','${name}','${item.properties.last_funding_at}','${item.properties.rank_org_company ? item.properties.rank_org_company : 0}','${item.properties.identifier.permalink.replace(/[^0-9a-zA-Z,-. ]/gi, '')}','${!item.properties.founded_on ? '' : item.properties.founded_on.value}','${item.properties.num_funding_rounds}')`, function (error, results, fields) {
              if (error) throw error;
            });



          } 
        })
      }).then (res => {
  
        maillog += `Upd: ${v0Rec}/${v0NewRec}/${v0UpdRec}. Period: ${startDate} - ${endDate}\n`
        console.log(`All: ${v0Rec}/${v0NewRec}/${v0UpdRec}. Period: ${startDate} - ${endDate}`)
        if (results.length <= 2) {
          // maillog += `Total LW: ${lastWeekTotal} New:${newTotal} Upd:${updTotal}`
          console.log(`Total LW: ${lastWeekTotal} New:${newTotal} Upd:${updTotal} SQLInsert: ${sqlInsert} SQLUpdate: ${sqlUpdate}`)   
      
          console.log('Getting rounds data.. Array size: ', roundIds.length)
      
          console.log(`Done. Wating ${roundIds.length*500/1000} sec until SQL finish. Time: ${dayjs().format('HH:mm:ss')}`,)
          // await delay()

        }
  
         });

         await delay(20000)

    }

    

  });
}

start();


