import axios from "axios";
import fs from "fs/promises";
import path from "path";
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
        for(let i = 1; i <= 139; i++){
            const getUrl = (i === 1) ? "https://letterboxd.com/films/ajax/by/popular/?esiAllowFilters=true" 
            : `https://letterboxd.com/films/ajax/popular/page/${i}/?esiAllowFilters=true`;

            const referance = (i===1) ? "https://letterboxd.com/films/popular/" : `https://letterboxd.com/films/popular/page/${i - 1}/`
            const response = await axios.get(getUrl, {
                headers: {
                    //filtered
                    // Cookie: `com.xk72.webparts.csrf=53639ed3d4e9b0813235; pwBotScore=97; usprivacy=1---; ad_clicker=false; _sharedid=f1cfe50a-0466-4c68-b2d1-e6176f3bf087; _sharedid_cst=zix7LPQsHA%3D%3D; _li_dcdm_c=.letterboxd.com; _lc2_fpi=adb4d668fb2b--01jxg7wks0md7bfqjwkn32msg1; _lc2_fpi_meta=%7B%22w%22%3A1749670580001%7D; _cc_id=f4ba27d50125343aa350b7e73a02070f; panoramaId=808b60f97a36e2d9fe905314fea1185ca02c16e5b53c9728239a3f16c9ff8503; panoramaIdType=panoDevice; panoramaId_expiry=1750275380966; _au_1d=AU1D-0100-001749670580-WOGG5I0P-5LUD; __gads=ID=ed0a5ce79ddd549d:T=1749670584:RT=1749671449:S=ALNI_MZOXvaRv_QIwDcAx6cZElMsXZUjYg; __gpi=UID=000010f1a1877d07:T=1749670584:RT=1749671449:S=ALNI_MZCciZnnFpIKQc565pyy-WnHPU2_g; __eoi=ID=7897f8bc7849edd9:T=1749670584:RT=1749671449:S=AA-AfjausPw1TO4Jv9qb2XUNEk5j; krg_uid=%7B%22v%22%3A%7B%22clientId%22%3A%22b0303e91-f1eb-4793-810c-dfe170a3b8f4%22%2C%22userId%22%3A%22dc7fa9eb-d720-09e1-ba83-3049c818963a%22%2C%22optOut%22%3Afalse%7D%7D; krg_crb=%7B%22v%22%3A%22eyJjbGllbnRJZCI6ImIwMzAzZTkxLWYxZWItNDc5My04MTBjLWRmZTE3MGEzYjhmNCIsInRkSUQiOm51bGwsImxleElkIjoiZGM3ZmE5ZWItZDcyMC0wOWUxLWJhODMtMzA0OWM4MTg5NjNhIiwia3RjSWQiOm51bGwsImV4cGlyZVRpbWUiOjE3NDk3NTc4NjU5MTUsImxhc3RTeW5jZWRBdCI6MTc0OTY3MTQ2NTkxNSwicGFnZVZpZXdJZCI6IiIsInBhZ2VWaWV3VGltZXN0YW1wIjoxNzQ5NjcxNDY1MDM3LCJwYWdlVmlld1VybCI6Imh0dHBzOi8vbGV0dGVyYm94ZC5jb20vZmlsbXMvYnkvcmF0aW5nLyIsInVzcCI6IjEtLS0ifQ%3D%3D%22%7D; filmFilter=hide-docs%20hide-unreleased%20hide-tv%20hide-shorts; _ga=GA1.1.2043502362.1749670579; _awl=2.1749671508.5-948b7ebaf8a3a082acaa17930748907e-6763652d75732d63656e7472616c31-0; FCNEC=%5B%5B%22AKsRol-4SOJExsxd6bTtRv_EPQ7C3REz_YZ0x1X0UGU6y9qieol1GZkrAyw6wPlmRhK8CF8eNs8UOOkMifmZ3Uv8kuDLmj2A50Lu9E5S_qmD8dcCWBd2Z_l5OwRkUopALrjWGql7zoK_gALL05vHiFA4TX_Mchw1tA%3D%3D%22%5D%5D; cto_bundle=bnPCTl9jU29UbmtxdUZZb01XUUZoM0NsSSUyQiUyRlUzS3VSR1JVVDF3WSUyQjJvRVdzY1dOOTJTYTRmOHRHaml5MDNFTyUyRldFZnBGQ0dIZGoxZWU1dklzYmFRTXRyN3hjR2VsejNZb3clMkIzMTBHemdleUxobzJxcThuZ1ZMSE9XcVZhTE5JaEg3aEY; cto_bidid=wwOAuV9JajdiSHJ0cDRMak50d0IxdGdFTSUyRk5Ua0NybWQ4NyUyQjdWWUJvclpVT2lZNFdRYnUyVEE5VWNzSTZGZzQ4SDFzN09LWVpKdDJjYURkcHF5NDAxOG1DOUElM0QlM0Q; _ga_D3ECBB4D7L=GS2.2.s1749670579$o1$g1$t1749671517$j52$l0$h0; _ga_L0W7RDZXX3=GS2.1.s1749670579$o1$g1$t1749671517$j5$l0$h0; _ga_FVWZ0RM4DH=GS2.1.s1749670582$o1$g1$t1749671517$j5$l0$h0`,
                    "User-Agent": ranUserAgent,
                    "Referer": referance,
                    "Accept-Language": "en-US,en;q=0.9",
                }
            })
            if(response.status === 200){
                console.log("Successfully scraped page: ", i);
                //WRITE TO THIS CSV FILE
                //const WRITE_HTML_FILE = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages", `page${i}.html`);
                const WRITE_HTML_FILE = path.join(__dirname, "..", "cache", "unfilteredLetterboxdPopularPages", `page${i}.html`);
                await fs.writeFile(WRITE_HTML_FILE, response.data);
            }
            else{
                console.log("Error with axios get request: ", response.status);
            }

            const delayTimer: number = Math.floor((Math.random() * 10000) + 5000);
            await setTimeout(delayTimer);
        }

    } catch (error){
        console.log("error with get to letterboxd", error);
        throw error;
    }

}
getLetterboxdHTML();