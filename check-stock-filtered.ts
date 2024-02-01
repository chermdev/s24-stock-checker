import { fetchStock } from './fetch-stock/fetch-stock.ts'
import products from './products.json'

async function checkStockFromUrls() {
  const stock = await fetchStock(products)

  console.table(stock.filter((item) => (
    item.stockStatus !== 'outOfStock')
  ))
}

checkStockFromUrls()