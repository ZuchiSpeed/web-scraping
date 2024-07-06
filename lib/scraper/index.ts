import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonProduct(url: string) {
    if(!url) return;

    //BrightData proxy Configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const sessionId = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${sessionId}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    };

    try {
        //Fetch the products page
        const response = await axios.get(url, options);

        return response.data
    } catch (error: any) {
        throw new Error(`Failed to collect Scraped data ${error.message}`);
    }
}