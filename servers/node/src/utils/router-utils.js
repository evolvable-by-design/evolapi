function extractTechnicalIds(resourceUrl, path) {
  const firstPathPart = path.substring(0, path.indexOf('/', 1))
  const pathname = resourceUrl.startsWith('http') ? new URL(resourceUrl).pathname : resourceUrl
  const url = pathname.substring(firstPathPart)
  const urlSplit = url.substring(1).split('/')
  const match = path.substring(1).split('/')
    .reduce((acc, el, i) => acc && (el.startsWith(':') || el === urlSplit[i]), true)

  if (!match) { return undefined; }

  return path.substring(1).split('/')
    .reduce((acc, el, i) => {
      if (acc === undefined) {
        return undefined
      } else if (el.startsWith(':')) {
        acc[el.substring(1)] = urlSplit[i]
        return acc
      } else if (el ===  urlSplit[i]) {
        return acc
      } else {
        return undefined
      }
    }, {})
}

const TechnicalIdsExtractor = {
  extractAnalyticIdParams: url => extractTechnicalIds(url, '/analytics/:resourceId'),
  extractProjectIdParams: url => extractTechnicalIds(url, '/project/:id'),
  extractTaskIdParams: url => extractTechnicalIds(url, '/project/:projectId/task/:taskId'),
  extractUserIdParams: url => extractTechnicalIds(url, '/user/:userId')
}

module.exports = {
  TechnicalIdsExtractor
} 