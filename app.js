let currentSystem = "dez";
const hexLetters = ["A", "B", "C", "D", "E", "F"];
let inputValue = "0";
const resultValue = {
  hex: "0",
  dez: "0",
  bin: "0",
};

const radios = document.querySelectorAll(".radio");
const buttons = document.querySelectorAll("button");
const boards = document.querySelectorAll(".board");
const tables = document.querySelectorAll(".table");

const changeSystem = (event) => {
  currentSystem = event.currentTarget.id;
  changeBoard();
  changeTable();
};

const changeBoard = () => {
  for (let board of boards) {
    if (board.classList.contains(currentSystem)) {
      board.classList.remove("hidden");
    } else {
      board.classList.add("hidden");
    }
  }
  inputValue = resultValue[currentSystem];
  document.querySelector(".display").innerHTML = inputValue;
};

const changeTable = () => {
  for (let table of tables) {
    if (table.classList.contains(currentSystem)) {
      table.classList.remove("hidden");
      searchResult();
    } else {
      table.classList.add("hidden");
    }
  }
};

const addDigit = (event) => {
  event.preventDefault();
  view = document.querySelector(".display");
  view.innerHTML = "";
  if (event.currentTarget.innerHTML === "↻") {
    inputValue = "0";
    view.innerHTML = "0";
    resultValue.dez = resultValue.hex = resultValue.bin = "0";
    renderResults();
    return;
  }
  if (event.currentTarget.innerHTML == "⇐") {
    inputValue = inputValue.substring(0, inputValue.length - 1);
    if (inputValue.length == 0) {
      inputValue = "0";
      resultValue.dez = resultValue.hex = resultValue.bin = "0";
    }
    view.innerHTML = inputValue;
    searchResult(false);
    renderResults();
    return;
  }
  if (inputValue == "0") {
    inputValue = event.currentTarget.innerHTML;
  } else {
    inputValue = inputValue + event.currentTarget.innerHTML;
  }
  view.innerHTML = inputValue;
  resultValue[currentSystem] = inputValue;
  searchResult();
  renderResults();
};

const searchResult = (flag = true) => {
  view = document.querySelector(".display");
  view.innerHTML = "";
  switch (currentSystem) {
    case "dez":
      if (flag) {
        inputValue = resultValue.dez.split(" ").join("");
      }
      inputValue = view.innerHTML = inputValue.replace(
        /(\d)(?=(\d{3})+(\D|$))/g,
        "$1 "
      );

      searchResultFromDez();
      break;
    case "bin":
      if (flag) {
        inputValue = resultValue.bin.split(" ").join("");
      }
      view.innerHTML = inputValue.replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
      searchResultFromBin();
      break;
    case "hex":
      if (flag) {
        inputValue = resultValue.hex;
      }
      view.innerHTML = inputValue;
      searchResultFromHex();
      break;
  }
};

const searchResultFromDez = () => {
  resultValue.dez = inputValue;
  inputValue = inputValue.split(" ").join("");
  resultValue.hex = resultValue.bin = "";

  const hex = {
    dividend: [+inputValue],
    quotient: [Math.trunc(+inputValue / 16)],
    rest: [+inputValue % 16],
  };
  resultValue.hex = hex.rest[0] =
    hex.rest[0] < 10 ? hex.rest[0] + "" : hexLetters[+hex.rest[0] - 10];

  while (hex.quotient.slice(-1)[0] > 0) {
    hex.dividend.push(hex.quotient.slice(-1)[0]);
    hex.quotient.push(Math.trunc(hex.dividend.slice(-1)[0] / 16));
    hex.rest.push(hex.dividend.slice(-1) % 16);
    if (+hex.rest.slice(-1)[0] > 9) {
      hex.rest[hex.rest.length - 1] = hexLetters[+hex.rest.slice(-1)[0] - 10];
    }
    resultValue.hex = hex.rest.slice(-1)[0] + resultValue.hex;
  }

  const bin = {
    dividend: [+inputValue],
    quotient: [Math.trunc(+inputValue / 2)],
    rest: [+inputValue % 2],
  };
  resultValue.bin = bin.rest[0] + "";

  while (bin.quotient.slice(-1)[0] > 0) {
    bin.dividend.push(bin.quotient.slice(-1)[0]);
    bin.quotient.push(Math.trunc(bin.dividend.slice(-1)[0] / 2));
    bin.rest.push(bin.dividend.slice(-1)[0] % 2);
    resultValue.bin = bin.rest.slice(-1)[0] + resultValue.bin;
  }
  resultValue.bin = resultValue.bin.replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
  resultValue.dez = resultValue.dez.replace(/(\d)(?=(\d{3})+(\D|$))/g, "$1 ");
  renderRoadFromDez(hex, bin);
};

const searchResultFromBin = () => {
  resultValue.bin = inputValue;
  resultValue.hex = resultValue.dez = 0;

  for (let i = 0; i < inputValue.length; i++) {
    resultValue.dez =
      resultValue.dez + +inputValue[inputValue.length - 1 - i] * Math.pow(2, i);
  }
  resultValue.bin = resultValue.bin.replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
  resultValue.dez = resultValue.dez
    .toString()
    .replace(/(\d)(?=(\d{3})+(\D|$))/g, "$1 ");

  const hexDigitPlaces = resultValue.bin.split(" ");
  resultValue.hex = hexDigitPlaces
    .map((hexDigit) => {
      let hex = 0;
      for (let i = 0; i < hexDigit.length; i++) {
        hex = hex + hexDigit[hexDigit.length - 1 - i] * Math.pow(2, i);
      }
      hex = hex > 9 ? hexLetters[hex - 10] : hex + "";
      return hex;
    })
    .join("");
  renderRoadFromBinToDez();
  renderRoadFromBinToHex();
};

const searchResultFromHex = () => {
  resultValue.hex = inputValue;
  resultValue.dez = resultValue.bin = 0;
  for (let i = 0; i < inputValue.length; i++) {
    let letter =
      hexLetters.indexOf(inputValue[inputValue.length - 1 - i]) !== -1
        ? hexLetters.indexOf(inputValue[inputValue.length - 1 - i]) + 10
        : +inputValue[inputValue.length - 1 - i];
    resultValue.dez = resultValue.dez + letter * Math.pow(16, i);
  }
  resultValue.dez = resultValue.dez
    .toString()
    .replace(/(\d)(?=(\d{3})+(\D|$))/g, "$1 ");
  const hexDigits = inputValue.split("");
  resultValue.bin = hexDigits
    .map((digit) => {
      digit =
        hexLetters.indexOf(digit) !== -1
          ? hexLetters.indexOf(digit) + 10
          : +digit;
      let binDigit = "";
      for (let i = 3; i >= 0; i--) {
        if (digit - Math.pow(2, i) >= 0) {
          binDigit = binDigit + 1;
          digit = digit - Math.pow(2, i);
        } else {
          binDigit = binDigit + 0;
        }
      }
      return binDigit;
    })
    .join("")
    .replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
};

const renderResults = () => {
  document.querySelector(".bin_result").innerHTML = resultValue.bin;
  document.querySelector(".dez_result").innerHTML = resultValue.dez;
  document.querySelector(".hex_result").innerHTML = resultValue.hex;
};

const renderRoadFromDez = (hex, bin) => {
  let hexLineResults = "";
  for (let i = 0; i < hex.dividend.length; i++) {
    hexLineResults =
      hexLineResults +
      `<div class="line-result dh"><p class="dividend dh">${hex.dividend[i]} : 16 =</p>` +
      `<p class="quotient dh">${hex.quotient[i]}</p>` +
      `<p class="rest dh">Rest ${
        hexLetters.indexOf(hex.rest[i]) !== -1
          ? hexLetters.indexOf(hex.rest[i]) + 10 + "(" + hex.rest[i] + ")"
          : hex.rest[i]
      }</p></div>`;
  }

  const blockResultHex = document.querySelector(".render-from-dez-to-hex");
  blockResultHex.innerHTML =
    '<div class="arrow-left"></div><div class="arrow-right"></div>' +
    hexLineResults +
    `<div class="res dh">${resultValue.hex}</div>`;

  let binLineResults = "";
  for (let i = 0; i < bin.dividend.length; i++) {
    binLineResults =
      binLineResults +
      `<div class="line-result db"><p class="dividend db">${bin.dividend[i]} : 2 =</p>` +
      `<p class="quotient db">${bin.quotient[i]}</p>` +
      `<p class="rest db">Rest ${bin.rest[i]}</p></div>`;
  }

  const blockResultBin = document.querySelector(".render-from-dez-to-bin");
  blockResultBin.innerHTML =
    '<div class="arrow-left"></div><div class="arrow-right"></div>' +
    binLineResults +
    `<div class="res db">${resultValue.bin}</div>`;
};

const renderRoadFromBinToDez = () => {
  let resultBlock = "";
  const resBin = resultValue.bin.split(" ").join("");
  for (let i = 0; i < resBin.length - 1; i++) {
    resultBlock =
      resultBlock +
      `<div class="rank_bin-dez"><div class="rank_bin">${
        resBin[i]
      }</div><div class="rank_dez">
  <span>${
    resBin[i]
  }<span class="cross">&#x2715;</span>2<sup>${
        resBin.length - 1 - i
      }</sup></span><span>+</span></div></div>`;
  }
  resultBlock =
    resultBlock +
    `<div class="rank_bin-dez"><div class="rank_bin">${
      resultValue.bin[resultValue.bin.length - 1]
    }</div><div class="rank_dez">
  <span>${
    resultValue.bin[resBin.length - 1]
  }<span class="cross">&#x2715;</span>2<sup>0</sup></span></div></div>`;
  const wrap = `<div class="wrap">${resultBlock}</div>`;
  const renderBlock = document.querySelector(".render-from-bin-to-dez");
  renderBlock.innerHTML = wrap;
  const resultBD = document.createElement("div");
  resultBD.classList.add("res");
  resultBD.classList.add("bd");
  resultBD.innerHTML = resultValue.dez;
  renderBlock.appendChild(resultBD);
  renderBlock.style.width = `${resBin.length * 50}px`;

};

const renderRoadFromBinToHex =()=>{
  const resBin = resultValue.bin.split(' ')
  resBin[0]='0'.repeat(4-resBin[0].length)+resBin[0]
  
}

for (let button of buttons) {
  button.addEventListener("click", addDigit);
}
for (let radio of radios) {
  radio.addEventListener("click", changeSystem);
}
