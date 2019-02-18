"use strict";

const Unit = require("./unitInfo").Unit;

class Measure {
  constructor(string) {
    let split = string.split(" ");
    if (split.length !== 2) {
      console.log("Unit Error");
    }
    let input = parseFloat(split[0]);
    let unitStr = split[1];
    let conversion;
    console.log(unitStr);

    [this.dimExp, conversion] = Unit.read(unitStr); //fundamental physical dimension exponents and conversion to metric units
    this.SIvalue = input * conversion; //only value stored in object to reference magnitude
  }

  //metric system uses m kg s A K mol as fundamental units
}

module.exports = Measure;
