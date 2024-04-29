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
      const octet = `<p class="render-octet">${octetsValue[i]}</p>`;
      octetsValueBin.push(octet);
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
        `<p class="render-octet-bin">${strValue.slice(0, position)}
          <span class='pipe'>|</span>
          ${strValue.slice(position)}</p>`
      );
    }
  }
  document.querySelector(".render-ipv4_bin-octet").innerHTML =
    octetsValueBin.join("<p class='point'>.</p>") +
    "<p class='point'>/</p>" +
    prefixValue;
  searchMask(idxOctet, position);
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

const searchMask = (idxOctet, position) => {
  const mask = [];
  const maskBin = [];
  let binOctet = "";
  let decOctet = 0;
  for (let i = 0; i < 4; i++) {
    if (i < idxOctet) {
      mask.push("255");
      maskBin.push("255");
    } else if (i === idxOctet) {
      for (let i = 1; i < 9; i++) {
        if (i <= position) {
          binOctet = binOctet + 1;
          decOctet = decOctet + Math.pow(2, 8 - i);
        } else {
          binOctet = binOctet + "0";
        }
      }
      mask.push(str(decOctet))
      maskBin.push(binOctet);
    } else {
      mask.push("0");
      maskBin.push("0");
    }
  }
};

for (let octet of octets) {
  octet.addEventListener("input", addIPOctet);
}

prefix.addEventListener("input", addPrefix);
