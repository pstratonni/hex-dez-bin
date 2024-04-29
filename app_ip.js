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
  let strValue = "";
  for (let i = 0; i < 4; i++) {
    if (i !== idxOctet) {
      octetsValueBin.push(octetsValue[i]);
    } else {
      let bin = octetsValue[i];
      while (bin > 0) {
        strValue = (bin % 2) + strValue;
        bin = Math.trunc(bin / 2);
      }
      const length = strValue.length;
      for (let i = 0; i < 8 - length; i++) {
        strValue = 0 + strValue;
      }
      octetsValueBin.push(`${strValue.slice(0, position)}<span class='pipe'>|</span>${strValue.slice(position)}`
      );
    }
  }
  document.querySelector(".render-ipv4_bin-octet").innerHTML =
    octetsValueBin.join("<p class='point'>.</p>") +
    "<p class='point'>/</p>" +
    prefixValue;
  searchMask(idxOctet, position);
  const netz = searchNetz(idxOctet, position, strValue)
  if (+prefixValue<32){
    searchFirstHost(netz)
    const latestHost = searchLatestHost(idxOctet, position, strValue)
    searchBroadcast(latestHost)
  }else{
    searchBroadcast()
    document.querySelector(".render-first_dec").innerHTML = document.querySelector(".render-netz_dec").innerHTML
    document.querySelector(".render-latest_bin").innerHTML = document.querySelector(".render-netz_bin").innerHTML
  document.querySelector(".render-latest_dec").innerHTML = document.querySelector(".render-netz_dec").innerHTML
  }
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
        if (i < position) {
          binOctet = binOctet + 1;
          decOctet = decOctet + Math.pow(2, 8 - i);
        } else if (i==position){
          decOctet = decOctet + Math.pow(2, 8 - i);
          binOctet = binOctet + 1 + "<span class='pipe'>|</span>";
        }
        else {
          binOctet = binOctet + "0";
        }
      }
      mask.push(decOctet.toString())
      maskBin.push(binOctet);
    } else {
      mask.push("0");
      maskBin.push("0");
    }
  }
  document.querySelector(".render-mask_bin").innerHTML = maskBin.join("<p class='point'>.</p>") 
  document.querySelector(".render-mask_dec").innerHTML = mask.join("<p class='point'>.</p>") 
};

const searchNetz = (idx, position, octet) =>{
  const netz = []
  const netzBin = []
  let netzOctet =""
  for (let i=0; i<4; i++){
    if (i<idx){
      netz.push(octetsValue[i])
      netzBin.push(octetsValue[i])
    } else if (i===idx){
      const octetDec = octet.slice(0,position).split("").reduce((accu, currentValue, idx)=>{
      accu = accu + (+currentValue)*Math.pow(2,7-idx)
      return accu
      },0) 
      netz.push(octetDec)
      let zeros = ""
      for (let j=position; j<8; j++){
        zeros = zeros + "0"
      }
      netzOctet = octet.slice(0,position) + "<span class='pipe'>|</span>" + zeros;
      netzBin.push(netzOctet)
    }
    else{
      netz.push("0")
      netzBin.push("0")
    }
  }
  document.querySelector(".render-netz_bin").innerHTML = netzBin.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
  document.querySelector(".render-netz_dec").innerHTML = netz.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
  return netz
}

const searchFirstHost = (netz) => {
netz[netz.length-1] = +netz[netz.length-1] + 1 
document.querySelector(".render-first_dec").innerHTML = netz.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
}

const searchLatestHost = (idxOctet, position, strValue) => {
  const latestHostBin =[]
  const latestHost = []
  for (let i=0; i<4; i++){
    if (i<idxOctet){
      latestHost.push(octetsValue[i])
      latestHostBin.push(octetsValue[i])
    }else if(i===idxOctet){
      let octet = strValue.slice(0, position)
      let binOctet = strValue.slice(0, position)
      let one = ""
      for (let j=position; j<8; j++){
        if (i===3 && j==7){
          one = one + "0"
          break
        }
        one = one + "1"
      }
      octet = octet + one
      binOctet = binOctet + "<span class='pipe'>|</span>" + one
      const octetDec = octet.split("").reduce((accu, currentValue, idx)=>{
        accu = accu + (+currentValue)*Math.pow(2,7-idx)
        return accu
        },0) 
        latestHost.push(octetDec)
        latestHostBin.push(binOctet)
    }
    else if (i===3){
      latestHost.push("254")
      latestHostBin.push("254")
    }
    else{
      latestHost.push("255")
      latestHostBin.push("255")
    }
  }
  document.querySelector(".render-latest_bin").innerHTML = latestHostBin.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
  document.querySelector(".render-latest_dec").innerHTML = latestHost.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
  return latestHost
}

const searchBroadcast = (broadcast=octetsValue) => {
  if(+prefixValue<32){
    broadcast[broadcast.length-1] = +broadcast[broadcast.length-1] + 1
  }
  document.querySelector(".render-broadcast_dec").innerHTML = broadcast.join("<p class='point'>.</p>") +
  "<p class='point'>/</p>" +
  prefixValue;
}

for (let octet of octets) {
  octet.addEventListener("input", addIPOctet);
}

prefix.addEventListener("input", addPrefix);
