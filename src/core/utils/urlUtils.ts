export function concatPath(...args: string[]) {
  return urlJoin(...args);
}

/**
 * Join all arguments together and normalize the resulting url.
 * This works similar to `path.join` but you shouldn't use `path.join` for urls since it works
 * differently depending on the operating system and also doesn't work for some cases.
 */
function normalize(strArray: string[]) {
  const resultArray: string[] = [];
  if (strArray.length === 0) {
    return "";
  }

  if (typeof strArray[0] !== "string") {
    throw new TypeError("Url must be a string. Received " + strArray[0]);
  }

  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    const first = strArray.shift();
    strArray[0] = first + strArray[0];
  }

  if (strArray[0].match(/^file:\/\/\//)) {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, "$1:///");
  } else {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, "$1://");
  }

  for (let i = 0; i < strArray.length; i++) {
    let component = strArray[i];

    if (typeof component !== "string") {
      throw new TypeError("Url must be a string. Received " + component);
    }

    if (component === "") {
      continue;
    }

    if (i > 0) {
      component = component.replace(/^[/]+/, "");
    }
    if (i < strArray.length - 1) {
      component = component.replace(/[/]+$/, "");
    } else {
      component = component.replace(/[/]+$/, "/");
    }

    resultArray.push(component);
  }

  let str = resultArray.join("/");

  str = str.replace(/\/(\?|&|#[^!])/g, "$1");

  const parts = str.split("?");
  str = parts.shift() + (parts.length > 0 ? "?" : "") + parts.join("&");

  str = str.replace(/(.*?:\/\/)?([^?#]*)(.*)/g, (match, protocol, path, rest) => {
    
    protocol = protocol || '';
    
    if (!protocol && path.startsWith('//') && path.length > 2 && /^\/\/[^\/]/.test(path)) {
      path = '//' + path.slice(2).replace(/\/{2,}/g, '/');
    } else {
      path = path.replace(/\/{2,}/g, '/');
    }
    
    return protocol + path + rest;
  });

  return str;
}

export default function urlJoin(...parts: string[]): string {
  let input;

  if (typeof parts[0] === "object") {
    input = parts[0];
  } else {
    input = [].slice.call(parts);
  }

  return normalize(input);
}
