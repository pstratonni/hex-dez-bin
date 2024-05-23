let currentSystem = "ipv4";
const hexLetters = ["A", "B", "C", "D", "E", "F"];
let inputValue = "0";
const resultValue = {
  hex: "0",
  dez: "0",
  bin: "0",
};
const delay = 500;

const radios = document.querySelectorAll(".radio");
const buttons = document.querySelectorAll("button");
const boards = document.querySelectorAll(".board");
const tables = document.querySelectorAll(".table");
const labels = document.querySelectorAll(".label");

const changeSystem = (event) => {
  currentSystem = event.currentTarget.id;
  activeSystem();
  changeBoard();
  changeTable();
};

const activeSystem = () => {
  for (let label of labels) {
    if (label.htmlFor !== currentSystem) {
      label.classList.remove("active");
    } else {
      label.classList.add("active");
    }
  }
};

const changeBoard = () => {
  for (let board of boards) {
    if (board.classList.contains(currentSystem)) {
      board.classList.remove("hidden");
    } else {
      board.classList.add("hidden");
    }
  }
  if (currentSystem == "ipv4") {
    document.querySelector(".display").classList.add("hidden");
    document.querySelector(".result").classList.add("hidden");
    document.querySelector(".display_ipv4").classList.remove("hidden");
    return;
  } else {
    document.querySelector(".display").classList.remove("hidden");
    document.querySelector(".result").classList.remove("hidden");
    document.querySelector(".display_ipv4").classList.add("hidden");
  }
  inputValue = resultValue[currentSystem];
  document.querySelector(".display").innerHTML = inputValue;
};

const changeTable = () => {
  for (let table of tables) {
    if (table.classList.contains(currentSystem)) {
      table.classList.remove("hidden");
      if (currentSystem !== "ipv4") {
        searchResult();
      }
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
    document.querySelector(".render-from-dez-to-hex").innerHTML = "";
    document.querySelector(".render-from-dez-to-bin").innerHTML = "";
    document.querySelector(".render-from-bin-to-dez").innerHTML = "";
    document.querySelector(".render-from-bin-to-hex").innerHTML = "";
    document.querySelector(".render-from-hex-to-dez").innerHTML = "";
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
      renderResults();
      break;
    case "bin":
      if (flag) {
        inputValue = resultValue.bin.split(" ").join("");
      }
      view.innerHTML = inputValue.replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
      searchResultFromBin();
      renderResults();
      break;
    case "hex":
      if (flag) {
        inputValue = resultValue.hex;
      }
      view.innerHTML = inputValue;
      searchResultFromHex();
      renderResults();
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
  resultValue.dez = resultValue.bin = "0";
  if (inputValue == "0") {
    return;
  }
  for (let i = 0; i < inputValue.length; i++) {
    let letter =
      hexLetters.indexOf(inputValue[inputValue.length - 1 - i]) !== -1
        ? hexLetters.indexOf(inputValue[inputValue.length - 1 - i]) + 10
        : +inputValue[inputValue.length - 1 - i];
    resultValue.dez = +resultValue.dez + letter * Math.pow(16, i);
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
    .join("");
  let idx = resultValue.bin.indexOf("1");
  resultValue.bin = resultValue.bin
    .substring(idx)
    .replace(/(\d)(?=(\d{4})+(\D|$))/g, "$1 ");
  renderRoadFromHexToDez();
  renderRoadFromHexToBin();
};

const renderResults = () => {
  document.querySelector(".bin_result").innerHTML = resultValue.bin;
  document.querySelector(".dez_result").innerHTML = resultValue.dez;
  document.querySelector(".hex_result").innerHTML = resultValue.hex;
};

const renderRoadFromDez = (hex, bin) => {
  if (resultValue.bin == "0") {
    return;
  }
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
  if (resultValue.bin == "0") {
    return;
  }
  let resultBlock = "";
  const resBin = resultValue.bin.split(" ").join("");
  for (let i = 0; i < resBin.length - 1; i++) {
    resultBlock =
      resultBlock +
      `<div class="rank_bin-dez"><div class="rank_bin">${
        resBin[i]
      }</div><div class="rank_dez">
  <span>${resBin[i]}<span class="cross">&#x2715;</span>2<sup>${
        resBin.length - 1 - i
      }</sup></span><span>+</span></div></div>`;
  }
  resultBlock =
    resultBlock +
    `<div class="rank_bin-dez"><div class="rank_bin">${
      resultValue.bin[resultValue.bin.length - 1]
    }</div><div class="rank_dez">
  <span>${
    resultValue.bin[resultValue.bin.length - 1]
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

const renderRoadFromBinToHex = () => {
  if (resultValue.bin == "0") {
    return;
  }
  const resBin = resultValue.bin.split(" ");
  resBin[0] = "0".repeat(4 - resBin[0].length) + resBin[0];

  const resRenderBin = resBin
    .map((substrBin, idx) => {
      let resWrap = `<div class="wrap_rank">`;
      for (let i = 0; i < substrBin.length; i++) {
        resWrap =
          resWrap +
          `<div class="rank_bin-dez">
          <div class="rank_bin">${substrBin[i]}</div>
            <div class="rank_dez">
              <span>${
                substrBin[i]
              }<span class="cross">&#x2715;</span>${Math.pow(
            2,
            3 - i
          )}</span><span>${i === 3 ? "" : "+"}</span>
          </div>
        </div>`;
      }
      resWrap =
        '<div class="wrap">' +
        resWrap +
        `</div>
    <div class="res bh">${
      hexLetters.indexOf(resultValue.hex[idx]) !== -1
        ? resultValue.hex[idx] +
          "(" +
          (hexLetters.indexOf(resultValue.hex[idx]) + 10) +
          ")"
        : resultValue.hex[idx]
    }</div></div>`;
      return resWrap;
    })
    .join("");
  const binHexTable = document.querySelector(".render-from-bin-to-hex");
  binHexTable.innerHTML =
    '<div class="render-from-bin-to-hex_wrap">' +
    resRenderBin +
    `</div>
    <div class="res bh">${resBin.length > 1 ? resultValue.hex : ""}</div>`;
};

const renderRoadFromHexToDez = () => {
  if (resultValue.bin == "0") {
    return;
  }
  let resultBlock = '<div class="wrap">';
  for (i = 0; i < resultValue.hex.length; i++) {
    resultBlock =
      resultBlock +
      `<div class="rank_hex-dez">
          <div class="rank_hex">${
            hexLetters.indexOf(resultValue.hex[i]) !== -1
              ? resultValue.hex[i] +
                "(" +
                (hexLetters.indexOf(resultValue.hex[i]) + 10) +
                ")"
              : resultValue.hex[i]
          }</div>
          <div class="rank_dez">
            <span>${
              hexLetters.indexOf(resultValue.hex[i]) !== -1
                ? hexLetters.indexOf(resultValue.hex[i]) + 10
                : resultValue.hex[i]
            }<span class="cross">&#x2715;</span>
              16<sup>${resultValue.hex.length - 1 - i}</sup>${
        i === resultValue.hex.length - 1 ? "" : "+"
      }
            </span>
          </div>
        </div>`;
  }
  resultBlock =
    resultBlock +
    `</div>
    <div class="res hd">${resultValue.dez}</div>`;
  document.querySelector(".render-from-hex-to-dez").innerHTML = resultBlock;
  const width = document.querySelector(".rank_hex-dez").offsetWidth;
  document.querySelector(".render-from-hex-to-dez").style.width =
    100 * resultValue.hex.length + "px";
};

const renderRoadFromHexToBin = () => {
  const resultValueArray = resultValue.hex.split("");

  const renderValue = resultValueArray
    .map((digit) => {
      let dividend =
        hexLetters.indexOf(digit) !== -1
          ? hexLetters.indexOf(digit) + 10
          : +digit;
      let binRankResult = "";
      let renderResult = `<div class="render-rank-from-hex-to-bin">`;
      for (let i = 1; i <= 4; i++) {
        let quotient = Math.trunc(dividend / 2);
        renderResult =
          renderResult +
          `<div class="line-result hb"><p class="dividend dh">${dividend}${
            dividend > 9 ? "(" + hexLetters[dividend - 10] + ")" : ""
          } : 2 =</p><p class="quotient dh">${quotient}</p><p class="rest dh">Rest ${
            dividend - quotient * 2
          }</p></div>`;
        binRankResult = dividend - quotient * 2 + binRankResult;
        dividend = quotient;
      }
      renderResult =
        renderResult +
        `<div class="res hb">${binRankResult}</div>
      <div class="arrow-left">
      </div><div class="arrow-right"></div>
      </div>`;
      return renderResult;
    })
    .join();
  document.querySelector(".render-from-hex-to-bin").innerHTML =
    "<div class='wrap'>" +
    renderValue +
    "</div>" +
    `<div class="res hd">${resultValue.bin}</div>`;
};

for (let button of buttons) {
  button.addEventListener("click", addDigit);
}
for (let radio of radios) {
  radio.addEventListener("click", changeSystem);
}
