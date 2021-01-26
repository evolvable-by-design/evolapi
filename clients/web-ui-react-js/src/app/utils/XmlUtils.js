export function toText(field, fallbackValue) {
  return field !== undefined ? field._text || fallbackValue : fallbackValue
}

export function toBoolean(field, fallbackValue) {
  return field !== undefined ? field._text === 'true' || fallbackValue : fallbackValue
}

export function toArray(field) {
  if (field instanceof Array) {
    return field
  } else if (field instanceof Object && Object.keys(field).length !== 0) {
    return [ field ]
  } else {
    return []
  }
}
