import React from 'react';

export const mapObject = (object, mapper) => {
  return Object.entries(object)
    .map(([key, value]) => mapper(key, value))
    .filter(el => el !== undefined)
    .reduce(reduceObject, {});
}

export const reduceObject = (res, [key, value]) => {
  res[key] = value;
  return res;
};

export const filterObjectKeys = (object, predicate) => {
  const res = {}
  Object.keys(res).forEach(key => { 
    if (predicate(key)) { res[key] = object[key] }
  })
  return res
}

export function mapFind (object, mapper) {
  for (const el of object) {
    const res = mapper(el)
    if (res !== undefined)
      return res
  }
  return undefined
}

export const onlyWhen = (values, toRender) => {
  if (
    values === undefined
    || (values instanceof Array && values.filter(e => e === undefined).length !== 0)
    || (typeof values === 'boolean' && !values)
  ) {
    return <React.Fragment></React.Fragment>
  } else {
    return toRender instanceof Function ? toRender() : toRender;
  }
}

export const stateSetter = (setState, key) => {
  return value => setState(state => {
    state[key] = value
    return Object.assign({}, state);
  })
}

export function arrayWithoutElAtIndex(arr, index) {
  const newArr = [...arr]
  newArr.splice(index, 1)
  return newArr
}

export function setInArray(arr, value, index) {
  const copy = [...arr]
  copy[index] = value
  return copy
}

export const capitalize = (str) => str.split(" ").map(firstLetterUppercase).join(" ");
export const firstLetterUppercase = (str) => str[0].toUpperCase() + str.substr(1);
export const isUpperCase = (character) => isNaN(character*1) && character === character.toUpperCase();
export const spaceCamelCaseWord = (str) => {
  if (str === undefined || str === '')
    return str;

  var result = str[0];
  const s = str.slice(1);
  for (const i in s) {
    if (isUpperCase(s[i]) && (i <= 0 || !isUpperCase(s[i-1]))) {
      result += ' '
    }

    result += s[i];
  }
  return result;
}

export const formatString = (str) => capitalize(spaceCamelCaseWord(str))