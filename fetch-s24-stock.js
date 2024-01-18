async function fetchSpecs(modelList) {
    let response = await fetch(`https://searchapi.samsung.com/v6/front/b2c/product/card/detail/newhybris?siteCode=mx&onlyRequestSkuYN=N&quicklookYN=N&commonCodeYN=N&saleSkuYN=N&modelList=${modelList}`, {
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
    let data = await response.json()

    let productsInfo = {}
    for (let familyDevice of data.response.resultData.productList) {
        for (let deviceInfo of familyDevice.modelList) {
            let specs = {
                name: familyDevice.fmyEngName,
                color: deviceInfo.fmyChipList[0].fmyChipLocalName,
                memory: deviceInfo.fmyChipList[1].fmyChipLocalName,
                // pdpUrl: deviceInfo.originPdpUrl 
            }
            productsInfo[deviceInfo.shopSKU] = specs
        }
    }
    return productsInfo
}

async function fetchStock(modelList) {
    const productsInfo = await fetchSpecs(modelList)
    let productCodes = Object.keys(productsInfo).join(',')
    let result = await fetch(`https://api.shop.samsung.com/tokocommercewebservices/v2/mx/products?productCodes=${productCodes}&fields=SIMPLE_INFO`, {
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
        .then(res => res)
        .catch(err => console.log(err))

    for (stockLevel of result) {
        Object.assign(productsInfo[stockLevel.code], {
            stockStatus: stockLevel.stock.stockLevelStatus,
            stockLevel: stockLevel.stock.stockLevel,
            // shippingETA: stockLevel.shippingETA
        })
    }
    return productsInfo
}

async function handleFetchSpecs() {
    const stockInfo = await fetchStock("SM-S928BZTVLTM,SM-S926BZVMLTM,SM-S921BZYMLTM")
    console.table(stockInfo)
}
handleFetchSpecs()