import { fetchStock } from './fetch-stock/fetch-stock.ts'
import { SamsungSKU } from './fetch-stock/skus.ts'

const pdpUrls = [
  "https://www.samsung.com/mx/mobile-accessories/galaxy-s24-ultra-anti-reflecting-screen-protector-transparent-ef-us928ctegmx",
  "https://www.samsung.com/mx/mobile-accessories/galaxy-s24-ultra-clear-case-transparent-gp-fps928saatx/",
  SamsungSKU.ultraNegro512GB,
  SamsungSKU.ultraGris512GB]

async function checkStockFromUrls() {
  const stock = await fetchStock(pdpUrls)

  console.table(stock.filter((item) => (
    item.stockStatus !== 'outOfStock')
  ))
}

checkStockFromUrls()