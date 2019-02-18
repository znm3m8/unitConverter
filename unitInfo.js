"use strict";
const g0 = 9.80665;

//new feature requests
//add viscosity units
//add thermal resistance and conductance units
//add molecular mass units
//incorporate other derived units such as acceleration for functionality of determining unit type
//variable called unit type list stored in unit type class
//move unit info list to unit info class
//make everything private except for read function in Unit class
//figure out what to do about g's vs grams

class UnitType {
  constructor(m, kg, s, A = 0, K = 0, mol = 0) {
    this.kg = kg;
    this.m = m;
    this.s = s;
    this.A = A;
    this.K = K;
    this.mol = mol;
  }

  multiply(uT1, uT2) {
    return {
      kg: uT1.kg + uT2.kg,
      m: uT1.m + uT2.m,
      s: uT1.s + uT2.s,
      A: uT1.A + uT2.A,
      K: uT1.K + uT2.K,
      mol: uT1.mol + uT2.mol
    };
  }

  invert(uT) {
    return {
      kg: -uT.kg,
      m: -uT.m,
      s: -uT.s,
      A: -uT.A,
      K: -uT.K,
      mol: -uT.mol
    };
  }

  power(uT, exp) {
    return {
      kg: uT.kg * exp,
      m: uT.m * exp,
      s: uT.s * exp,
      A: uT.A * exp,
      K: uT.K * exp,
      mol: uT.mol * exp
    };
  }
}

class Unit {
  constructor(name, symbol, unitType, conversion = 1, prefix = "", offset = 0) {
    this.name = name;
    this.symbol = symbol;
    this.unitType = unitType;
    this.conversion = conversion;
    this.prefix = prefix;
    this.offset = offset;
  }

  multiply(u1, u2) {
    return {
      name: undefined,
      symbol: resolveSymbol(`${u1.symbol}*${u2.symbol}`),
      unitType: UnitType.multiply(ul.unitType, u2.unitType),
      conversion: u1.conversion * u2.conversion,
      prefix: undefined,
      offset: undefined
    };
  }

  static read(unitStr) {
    //verify there is only one division sign

    let divisionSigns = unitStr.split("").filter(char => char === "/").length;
    if (divisionSigns > 1) {
      console.log("Please remove extraneous division signs and put in standard form");
    }

    //separate numerator and denominator
    let numerator;
    let denominator;
    [numerator, denominator] = Unit.sepFraction(unitStr);

    //separate numerator and denominator into individual unit blocks ie m^3 or s^-3
    numerator = numerator.split("*").map(Unit.sepExponents);
    if (divisionSigns === 0) {
      denominator = [];
    } else {
      denominator = denominator.split("*").map(Unit.sepExponents);
    }

    //recombine numerator and denominator by inverting denominator
    let unitBlocks = numerator.concat(
      denominator.map(u => {
        return { unit: u.unit, exponent: -u.exponent };
      })
    );

    //identify units and conversions
    unitBlocks = unitBlocks.map(unitBlockObj => {
      let result = {};
      result.exponent = unitBlockObj.exponent;
      result.unit = {};
      unitInfo.forEach(unitInfoObj => {
        if (unitInfoObj.symbol === unitBlockObj.unit) {
          Object.assign(result.unit, unitInfoObj);
        }
      });
      if (result.unit === undefined) {
        console.log("Unit was not recognized");
      }
      return result;
    });

    //resolve exponents in conversions and switch to metric
    unitBlocks = unitBlocks.map(unitBlockObj => {
      let result = {};
      result.unitType = {
        m: unitBlockObj.unit.unitType.m * unitBlockObj.exponent,
        kg: unitBlockObj.unit.unitType.kg * unitBlockObj.exponent,
        s: unitBlockObj.unit.unitType.s * unitBlockObj.exponent,
        A: unitBlockObj.unit.unitType.A * unitBlockObj.exponent,
        K: unitBlockObj.unit.unitType.K * unitBlockObj.exponent,
        mol: unitBlockObj.unit.unitType.mol * unitBlockObj.exponent
      };
      result.conversion = Math.pow(unitBlockObj.unit.conversion, unitBlockObj.exponent);
      return result;
    });

    //multiply and divide
    let finalUnit = unitBlocks.reduce((acc, unitBlockObj) => {
      return {
        m: acc.m + unitBlockObj.unitType.m,
        kg: acc.kg + unitBlockObj.unitType.kg,
        s: acc.s + unitBlockObj.unitType.s,
        A: acc.A + unitBlockObj.unitType.A,
        K: acc.K + unitBlockObj.unitType.K,
        mol: acc.mol + unitBlockObj.unitType.mol
      };
    }, new UnitType(0, 0, 0));

    let finalConversion = unitBlocks.reduce((acc, unitBlockObj) => {
      return acc * unitBlockObj.conversion;
    }, 1);

    //return
    return [finalUnit, finalConversion];
  }

  static sepExponents(string) {
    const separated = string.split("^");
    const u = separated[0];
    let exp = separated[1];
    if (exp === undefined) {
      exp = 1;
    } else {
      exp = parseFloat(exp);
    }
    return { unit: u, exponent: exp };
  }

  static sepFraction(units) {
    const fractionSplit = units.split("/");
    let numerator = fractionSplit[0];
    let denominator = fractionSplit[1];
    return [numerator, denominator];
  }
}

// fundamental units
const dimless = new UnitType(0, 0, 0, 0, 0, 0);
const mass = new UnitType(1, 0, 0, 0, 0, 0);
const length = new UnitType(0, 1, 0, 0, 0, 0);
const time = new UnitType(0, 0, 1, 0, 0, 0);
const current = new UnitType(0, 0, 0, 1, 0, 0);
const temp = new UnitType(0, 0, 0, 0, 1, 0);
const mole = new UnitType(0, 0, 0, 0, 0, 1);

//derived units
const area = new UnitType(0, 2, 0);
const volume = new UnitType(0, 3, 0);
const density = new UnitType(1, -3, 0);
const frequency = new UnitType(0, 0, -1);
const force = new UnitType(1, 1, -2);
const acceleration = new UnitType(0, 1, -2);
const pressure = new UnitType(1, -1, -2);
const work = new UnitType(1, 2, -2);
const power = new UnitType(1, 2, -3);
const charge = new UnitType(0, 0, 1, 1);
const voltage = new UnitType(1, 2, -3, -1);
const elecCapacitance = new UnitType(-1, -2, 4, 2);
const elecResistance = new UnitType(1, 2, -3, -2);
//thermal capacitance
//thermal resistance
//mass specific energy
//molar specific energy
//enthalpy
//mass specific enthalpy
//molar specivic enthalpy
//entropy
//mass specific entropy
//molar specific entropy

const siPrefix = [
  { long: "femto", short: "f", exp: -15 },
  { long: "pico", short: "p", exp: -12 },
  { long: "nano", short: "n", exp: -9 },
  { long: "micro", short: "u", exp: -6 },
  { long: "milli", short: "m", exp: -3 },
  { long: "centi", short: "c", exp: -2 },
  { long: "kilo", short: "k", exp: 3 },
  { long: "mega", short: "M", exp: 6 },
  { long: "giga", short: "G", exp: 9 },
  { long: "tera", short: "T", exp: 12 },
  { long: "peta", short: "P", exp: 15 }
];

var definedUnitInfo = [];

function addUnit(name, symbol, UnitType, conversion = 1, prefix = "", offset = 0) {
  let unit = new Unit(name, symbol, UnitType, conversion, prefix, offset);
  definedUnitInfo.push(unit);
}

//fundamental base units
addUnit("kilogram", "kg", mass);
addUnit("meter", "m", length, 1, "numck");
addUnit("second", "s", time, 1, "num");
addUnit("ampere", "A", current, 1, "um");
addUnit("kelvin", "K", temp, 1, "");
addUnit("mole", "mol", mole, 1, "k");

//mass units
addUnit("gram", "g", mass, 0.001, "um");
addUnit("pound mass", "lbm", mass, 0.45359237);

//length units
addUnit("inch", "in", length, 0.0254, "u");
addUnit("foot", "ft", length, 0.0254 * 12);
addUnit("mile", "mi", length, 0.0254 * 12 * 5280);

//time units
addUnit("minute", "min", time, 60);
addUnit("hour", "hr", time, 3600);
addUnit("day", "day", time, 3600 * 24);

//temperature units
addUnit("degrees Celsius", "degC", temp, 1, "", 273.15);
addUnit("degrees Fahrenheit", "degF", temp, 5 / 9, "", 459.67);
addUnit("degrees Rankine", "degR", temp, 5 / 9);

//dimensionless units
addUnit("rotation", "rot", dimless);
addUnit("radians", "rad", dimless, 1 / (2 * Math.PI));
addUnit("degrees", "deg", dimless, 1 / 360);

//area units
addUnit("acre", "ac", area, 4046.9);

//volume units
addUnit("liter", "L", volume, 0.001);
addUnit("US gallon", "gal", volume, 235 * Math.pow(0.0254, 3));

//density units
addUnit("Specific Gravity Liquid", "SGl", density, 1000);
addUnit("Specific Gravity Gas", "SGg", density, 1.225);

//frequency units
addUnit("hertz", "Hz", frequency, 1, "kMG");
addUnit("rpm", "rpm", frequency, 1 / 60, "k");

//acceleration units
addUnit("standard gravitaional acceleration", "g's", acceleration, g0);

//force units
addUnit("newton", "N", force, 1, "mkM"), addUnit("pound force", "lbf", force, 0.45359237 * g0);
addUnit("kip", "kip", force, 0.45359237 * g0 * 1000);
addUnit("short ton", "ton", force, 0.45359237 * g0 * 2000);
addUnit("long ton", "lton", force, 0.45359237 * g0 * 2240);
addUnit("metric ton", "mT", force, 1000 * g0);

//pressure units
addUnit("pascal", "Pa", pressure, 1, "mkMG");
addUnit("atmosphere", "atm", pressure, 101325);
addUnit("bar", "bar", pressure, 100000, "m");
addUnit("torr", "torr", pressure, 101325 / 760);
addUnit("millimeters Hg", "mmHg", pressure, 133.3224);
addUnit("inches Hg", "inHg", pressure, 133.3224 * 25.4);
addUnit("meters of water head", "mH2O", 1000 * g0);
addUnit("feet of water head", "ftH2O", 1000 * 0.0254 * 12 * g0);
addUnit("pounds per sq. inch", "psi", pressure, (0.0254 ^ 2) * 0.45359237 * g0);
addUnit("pounds per sq. foot", "psf", pressure, ((0.0254 / 12) ^ 2) * 0.45359237 * g0);
addUnit("kips per sq. inch", "ksi", pressure, (0.0254 ^ 2) * 0.45359237 * g0 * 1000);

//work units
addUnit("joules", "J", work, 1, "mkMG");
addUnit("erg", "erg", work, 1e-7);
addUnit("calories", "cal", work, 4.1868);
addUnit("Calorie", "kcal", work, 4186.8);
addUnit("British Thermal Unit", "BTU", work, 1055.06);
addUnit("ton (metric) of TNT", "t", work, 4.184e9, "mkMG");

//power units
addUnit("watt", "W", power, 1, "mkMG");
addUnit("horsepower", "hp", power, 12 * 0.0254 * 0.45359237 * g0 * 550);

//charge units
addUnit("Columb", "C", charge);

//voltage units
addUnit("volt", "V", voltage, 1, "mk");

//electrcal capacitance units
addUnit("farad", "F", elecCapacitance, 1, "num");

//electrical resistance units
addUnit("ohm", "ohm", elecResistance, 1, "mkM");

//declare empty unit array
let unitInfo = [];

definedUnitInfo.forEach(unit => {
  //add defined units to unit array without prefix property
  let newUnit = {};
  Object.assign(newUnit, unit);
  delete newUnit.prefix;
  unitInfo.push(newUnit);

  //create an array of siPrefixes based on prefix property of unit
  let prefixArr = unit.prefix.split("").map(short => {
    let pre;
    siPrefix.forEach(prefix => {
      if (short === prefix.short) {
        pre = prefix;
      }
    });
    return pre;
  });

  //adds each prefix that is asscoiated with the unit to the unit and updates unitInfo with the prefixed unit
  prefixArr.forEach(prefix => {
    let prefixedUnit = {};
    Object.assign(prefixedUnit, unit);
    delete prefixedUnit.prefix;

    prefixedUnit.name = prefix.long.concat(prefixedUnit.name);
    prefixedUnit.symbol = prefix.short.concat(prefixedUnit.symbol);
    prefixedUnit.conversion = prefixedUnit.conversion * Math.pow(10, prefix.exp);

    unitInfo.push(prefixedUnit);
  });
});

module.exports = { Unit: Unit, unitInfo: unitInfo, siPrefix: siPrefix };
