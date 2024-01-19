import { getSKUs } from './utils.ts'

interface APIProductsData {
  response: {
    resultData: {
      productList: {
        fmyEngName: string
        modelList: {
          fmyChipList: {
            fmyChipLocalName: string
          }[]
          shopSKU: string
          originPdpUrl: string
        }[]
      }[]
    }
  }

}

interface APIStockLevel {
  code: string
  stock: {
    stockLevelStatus: string
    stockLevel: number
  }
  shippingETA?: string
}

interface DeviceSpecs {
  name: string
  color?: string
  memory?: string
  pdpUrl?: string
}

interface StockSpecs {
  stockStatus?: string
  stockLevel?: number
  shippingETA?: string
}

interface StockData extends DeviceSpecs, StockSpecs {
}

interface ProductsInfo {
  [key: string]: StockData
}

interface StockItem extends StockData {
  sku: string
}


const host: string = "https://www.samsung.com"

async function fetchSpecs(modelList: string): Promise<ProductsInfo> {
  const url: string = `https://searchapi.samsung.com/v6/front/b2c/product/card/detail/newhybris?siteCode=mx&onlyRequestSkuYN=N&quicklookYN=N&commonCodeYN=N&saleSkuYN=N&modelList=${modelList}`
  let data: APIProductsData = await fetch(url, {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9,es-MX;q=0.8,es;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://www.samsung.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  })
    .then(res => res.json())
    .catch(err => console.log(err))

  let productsInfo: ProductsInfo = {}
  for (let familyDevice of data.response.resultData.productList) {
    for (let deviceInfo of familyDevice.modelList) {
      const pdpUrl: string = `${host}${deviceInfo.originPdpUrl}`
      let specs: DeviceSpecs = {
        name: familyDevice.fmyEngName,
        color: deviceInfo.fmyChipList[0]?.fmyChipLocalName,
        memory: deviceInfo.fmyChipList[1]?.fmyChipLocalName,
        // pdpUrl: pdpUrl
      }
      productsInfo[deviceInfo.shopSKU] = specs
    }
  }
  return productsInfo
}

export async function fetchStock(pdpUrls: string | string[]): Promise<StockItem[]> {
  let modelList = ''
  if (Array.isArray(pdpUrls)) {
    modelList = getSKUs(pdpUrls)
  } else if (typeof pdpUrls === 'string') {
    modelList = pdpUrls
  } else {
    throw new Error('Invalid argument type')
  }
  const productsInfo = await fetchSpecs(modelList)
  let productCodes = Object.keys(productsInfo).join(',')
  const url: string = `https://api.shop.samsung.com/tokocommercewebservices/v2/mx/products?productCodes=${productCodes}&fields=SIMPLE_INFO`
  let result: APIStockLevel[] = await fetch(url, {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9,es-MX;q=0.8,es;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://www.samsung.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  })
    .then(res => res.json())
    .catch(err => console.log(err))

  for (let stockLevel of result) {
    let stockInfo: StockSpecs = {
      stockStatus: stockLevel.stock.stockLevelStatus,
      stockLevel: stockLevel.stock.stockLevel,
      shippingETA: stockLevel.shippingETA
    }
    productsInfo[stockLevel.code] = { ...productsInfo[stockLevel.code], ...stockInfo }
  }

  let stockList: StockItem[] = []
  for (let sku in productsInfo) {
    if (!modelList.includes(sku)) { continue }
    let data: StockItem = { ...{ sku: sku }, ...productsInfo[sku] }
    stockList.push(data)
  }

  return stockList
}