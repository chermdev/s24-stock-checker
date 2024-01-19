function getSKU(productPdpUrl: string): string {
  const urlSplit = productPdpUrl.split('/')
  if (urlSplit[urlSplit.length - 1] === '') { urlSplit.pop() }
  const pdpUrl = urlSplit[urlSplit.length - 1]
  const skuMatch = pdpUrl.match(/\w{2}-[\d\w]{11}$/)
  const sku = skuMatch && skuMatch[0].toUpperCase()
  if (!sku) { throw new Error(`Invalid product URL ${productPdpUrl}`) }
  return sku
}

export function getSKUs(pdpUrls: string[]): string {
  return pdpUrls.map(pdpUrl => getSKU(pdpUrl)).join(',')
}

