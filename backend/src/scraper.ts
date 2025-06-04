import axios from 'axios';
import * as cheerio from 'cheerio';



async function getMovies(): Promise<string> {
    try{
        const response = await axios.get("http://localhost:3000/mock-lb-test");
        console.log(response.data);
        const html: string = response.data;
        return html
    } catch(error){
        console.log(error)
        throw error;
    }

}

function parseHTML(html: string){

    const $ = cheerio.load(html);
    const films: {
        title: string;
        year: string;
    }[] = []

    $(".film-list li").each((_index, element) => {
        const title = $(element).find("h2").text().trim();
        const year = $(element).attr("data-year") || "unknown";
        films.push({title, year});
    })

    console.log(films);
}

if (require.main === module) {
  (async () => {
    try {
        const html = await getMovies();
        parseHTML(html);
    } catch (error){
        console.log(error);
    }
  })();
}