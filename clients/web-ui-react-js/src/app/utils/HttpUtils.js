export function parseLinkHeader(header) {
  const links = header.split(',')
    .map(link => link.split(';').reduce((acc, param, index) => {
      if (index === 0) {
        acc['value'] = param.trim().slice(1, -1).trim() // removes the required < >
      } else {
        const [ paramName, paramValue ] = param.split("=")
        acc[paramName.trim()] = paramValue.trim()
      }
      return acc
    }, {}))

  return new Links(links)
}

class Links {
  constructor (values) {
    this.values = values
  }

  findBy (paramName, value) {
    return this.values.find(link => link[paramName] === value)
  }

  uriList () {
    return this.values.map(link => link.value)
  }
}
