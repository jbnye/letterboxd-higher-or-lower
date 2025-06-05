import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import { setTimeout } from 'timers/promises';


// const options = {
//     headers: {
//         // 'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
//         'User-Agent': new UserAgent({ deviceCategory: 'desktop' }).toString(),
//         'Accept-Language': 'en-US,en;q=0.9',
//         "Referer": "https://letterboxd.com/films/popular/"
//     }
// }



async function getLetterboxdHTML(){
    try{
        const ranUserAgent = new UserAgent({deviceCategory: "desktop"}).toString();
        for(let i = 200; i <= 200; i++){
            const getUrl = (i === 1) ? "https://letterboxd.com/films/ajax/popular/?esiAllowFilters=true" 
            : `https://letterboxd.com/films/ajax/popular/page/${i}/?esiAllowFilters=true`;

            const referance = (i===1) ? "https://letterboxd.com/films/popular/" : `https://letterboxd.com/films/popular/page/${i - 1}/`
            const response = await axios.get(getUrl, {
                headers: {
                    "User-Agent": ranUserAgent,
                    "Referer": referance,
                    "Accept-Language": "en-US,en;q=0.9",
                }
            })
            if(response.status === 200){
                console.log("Successfully scraped page: ", i);
                await fs.writeFile(`../cache/page${i}.html`, response.data);
            }
            else{
                console.log("Error with axios get request: ", response.status);
            }

            const delayTimer: number = Math.floor((Math.random() * 10000) + 5000);
            await setTimeout(delayTimer)
        }

    } catch (error){
        console.log("error with get to letterboxd", error);
        throw error;
    }

}
getLetterboxdHTML();