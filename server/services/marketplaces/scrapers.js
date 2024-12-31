const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

async function scrapePoshmark(query) {
  const url = `https://poshmark.com/search?query=${encodeURIComponent(query)}`;
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const results = [];

  $('.card').slice(0, 10).each((i, el) => {
    results.push({
      platform: 'Poshmark',
      title: $(el).find('.title').text().trim(),
      price: $(el).find('.price').text().trim(),
      image: $(el).find('img').attr('src'),
      url: 'https://poshmark.com' + $(el).find('a').attr('href'),
      description: $(el).find('.description').text().trim()
    });
  });

  return results;
}

async function scrapeMercari(query) {
  const url = `https://www.mercari.com/search/?keyword=${encodeURIComponent(query)}`;
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const results = [];

  $('[data-testid="SearchResults"] > div').slice(0, 10).each((i, el) => {
    results.push({
      platform: 'Mercari',
      title: $(el).find('[data-testid="ItemName"]').text().trim(),
      price: $(el).find('[data-testid="ItemPrice"]').text().trim(),
      image: $(el).find('img').attr('src'),
      url: 'https://www.mercari.com' + $(el).find('a').attr('href'),
      description: $(el).find('[data-testid="ItemDescription"]').text().trim()
    });
  });

  return results;
}

async function scrapeEbay(query) {
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const results = [];

  $('.s-item').slice(0, 10).each((i, el) => {
    results.push({
      platform: 'eBay',
      title: $(el).find('.s-item__title').text().trim(),
      price: $(el).find('.s-item__price').text().trim(),
      image: $(el).find('.s-item__image-img').attr('src'),
      url: $(el).find('.s-item__link').attr('href'),
      description: $(el).find('.s-item__subtitle').text().trim()
    });
  });

  return results;
}

module.exports = {
  scrapePoshmark,
  scrapeMercari,
  scrapeEbay
};
