const octetsValue = [undefined, undefined, undefined, undefined];
let prefixValue = undefined;

const octets = document.querySelectorAll(".octet");
const prefix = document.querySelector(".prefix");

const addIPOctet = (event) => {
  const elem = event.target;
  if (/^\d+$/.test(elem.value) && +elem.value < 256) {
    document.querySelector(`#${elem.id}`).style.color = "#2f3d33";
    const idx = +elem.id.split("_")[1] - 1;
    octetsValue[idx] = +elem.value;
    testUndefined();
  } else {
    document.querySelector(`#${event.target.id}`).style.color = "red";
    const idx = +elem.id.split("_")[1] - 1;
    octetsValue[idx] = undefined;
    testUndefined();
  }
};

const addPrefix = (event) => {
  const elem = event.target;
  if (/^\d+$/.test(elem.value) && +elem.value < 33) {
    document.querySelector(`#${elem.id}`).style.color = "#2f3d33";
    prefixValue = +elem.value;
    testUndefined();
  } else {
    document.querySelector(`#${event.target.id}`).style.color = "red";
    prefixValue = undefined;
    testUndefined();
  }
};

const testUndefined = () => {
  if (octetsValue.indexOf(undefined) !== -1 || prefixValue === undefined) {
    return;
  }
  searchResultIP();
};

const searchResultIP = () => {
  const [idxOctet, position] = searchOctet();
  const octetsValueBin = [];
  for (let i = 0; i < 4; i++) {
    if (i !== idxOctet) {
      octetsValueBin.push(octetsValue[i]);
    } else {
      let bin = octetsValue[i];
      let strValue = "";
      while (bin > 0) {
        strValue = (bin % 2) + strValue;
        bin = Math.trunc(bin / 2);
      }
      const length = strValue.length;
      for (let i = 0; i < 8 - length; i++) {
        strValue = 0 + strValue;
      }
      octetsValueBin.push(
        strValue.slice(0, position) + "|" + strValue.slice(position)
      );
    }
  }
  document.querySelector(".render-ipv4_bin-octet").innerHTML =
    octetsValueBin.join(".") + " / " + prefixValue;
};

const searchOctet = () => {
  if (prefixValue <= 8) {
    return [0, prefixValue];
  } else if (prefixValue <= 16) {
    return [1, prefixValue - 8];
  } else if (prefixValue <= 24) {
    return [2, prefixValue - 16];
  } else {
    return [3, prefixValue - 24];
  }
};

for (let octet of octets) {
  octet.addEventListener("input", addIPOctet);
}

prefix.addEventListener("input", addPrefix);
