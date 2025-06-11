import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';


async function getTopTwoFiftyHTML(){
    try{
        const ranUserAgent = new UserAgent({deviceCategory: "desktop"}).toString();
            for(let i=1; i <= 3; i++){
            const url = (i == 1) ? "https://letterboxd.com/dave/list/official-top-250-narrative-feature-films/": 
            `https://letterboxd.com/dave/list/official-top-250-narrative-feature-films/page/${i}`;
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": ranUserAgent,
                    "Referer": url,
                    "Accept-Language": "en-US,en;q=0.9",
                }
            })
            if(response.status === 200){
                console.log("Successfully scraped page: ", i);
                await fs.writeFile(`./cache/Top250Pages/page${i}.html`, response.data);
            }
            else{
                console.log("Error with axios get request", response.data);
            }
        }
    } catch (error){
        console.log("Error with get to list page top 250", error);
        throw error;
    }

}
getTopTwoFiftyHTML();