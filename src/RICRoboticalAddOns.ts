/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// RICRoboticalAddOns
// Communications Connector for RIC V2
//
// RIC V2
// Rob Dobson & Chris Greening 2020
// (C) Robotical 2020-2022
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { RICAddOnBase, RICAddOnRegistry, RICDataExtractor, RICDataExtractorVarType, RICLog, RICReportMsg, ROSSerialAddOnStatus } from "@robotical/ricjs";
import { estimateDetectionFlags} from "./estimate-detection-flags";

// RIC ADDON CODES
export const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = "VCNL4200";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = "lightsensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = "coloursensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = "IRFoot";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT = "LEDfoot";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM = "LEDarm";
export const RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE = "LEDeye";
export const RIC_WHOAMI_TYPE_CODE_ADDON_BUSPIXEL = "BusPix19";
export const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = "noisesensor";
export const RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO = "roboservo3";

// IRF and Colour sensor Val suffixes
export const IRF_TOUCH_VAL = "Touch_IR";
export const IRF_AIR_VAL = "Air_IR";
export const IRF_TOUCH_AMBIENT = "Touch_Ambient";
export const IRF_AIR_AMBIENT = "Air_Ambient";
export const IRF_TOUCH_FLAG = "Touch";
export const IRF_AIR_FLAG = "Air";

export const CS_CLEAR = "Clear";
export const CS_IRVAL = "IRVal";
export const CS_TOUCH_FLAG = "Touch";
export const CS_AIR_FLAG = "Air";


export default class RICRoboticalAddOns {
  static registerAddOns(addOnRegistry: RICAddOnRegistry): void {
    const addOns = {
      [RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE]: [{ "class": RICAddOnDistanceSensor, "typeName": "DistanceSensor", "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT]: [{ "class": RICAddOnLightSensor,    "typeName": "LightSensor",       "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR]: [{ "class": RICAddOnColourSensor,   "typeName": "ColourSensor",     "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT]: [{ "class": RICAddOnIRFoot,         "typeName": "IRFoot",           "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_LEDFOOT]: [{ "class": RICAddOnLEDFoot,        "typeName": "DiscoFoot",       "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_LEDARM]: [{ "class": RICAddOnLEDArm,         "typeName": "DiscoArm",         "addonFamily": "RSAddOn"}],
      // the LEDEye addon we register it for both BusPixel and RSAddOn
      // as batch 4 LEDEyes will come up as BusPixel
      [RIC_WHOAMI_TYPE_CODE_ADDON_LEDEYE]: [{ "class": RICAddOnLEDEye,         "typeName": "DiscoEyes",        "addonFamily": "RSAddOn"},
                                            { "class": RICAddOnLEDEyeBusPix,   "typeName": "DiscoEyes",        "addonFamily": "BusPixels"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_BUSPIXEL]: [{ "class": RICAddOnLEDEyeBusPix,   "typeName": "DiscoEyes",        "addonFamily": "BusPixels"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_NOISE]: [{ "class": RICAddOnNoiseSensor,    "typeName": "NoiseSensor",       "addonFamily": "RSAddOn"}],
      [RIC_WHOAMI_TYPE_CODE_ADDON_GRIPSERVO]: [{ "class": RICAddOnGripServo,      "typeName": "Gripper",       "addonFamily": "RSAddOn"}],
    };
    for (const [key, arrayValue] of Object.entries(addOns)) {
        for (const value of arrayValue) {       
          addOnRegistry.registerHWElemType( 
            value.typeName, 
            value.addonFamily, 
            key,
            (name: string, addOnFamily: string, whoAmI: string, whoAmITypeCode: string) => {
              return new value.class(name, addOnFamily, whoAmI, whoAmITypeCode) 
            } 
          );  
        }
      }
    }
  }

// Format definitions
const ADDON_IRFOOT_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: IRF_TOUCH_FLAG,
      atBit: 8,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: IRF_AIR_FLAG,
      atBit: 9,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: IRF_TOUCH_VAL,
      atBit: 16,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: IRF_AIR_VAL,
      atBit: 32,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: IRF_TOUCH_AMBIENT,
      atBit: 48,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: IRF_AIR_AMBIENT,
      atBit: 64,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_COLOURSENSOR_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: CS_CLEAR,
      atBit: 8,
      bits: 8,
      postMult: 1,
      postAdd: 0,
      littleEndian: false,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Red',
      atBit: 16,
      bits: 8,
      postMult: 1.65,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Green',
      atBit: 24,
      bits: 8,
      postMult: 1.15,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Blue',
      atBit: 32,
      bits: 8,
      postMult: 1.0,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: CS_TOUCH_FLAG,
      atBit: 48,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: CS_AIR_FLAG,
      atBit: 49,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: CS_IRVAL,
      atBit: 56,
      bits: 16,
      postMult: 1.0,
      postAdd: 0,
    },
  ],
};

const ADDON_DISTANCESENSOR_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_LIGHTSENSOR_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading1',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading2',
      atBit: 24,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Reading3',
      atBit: 40,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

const ADDON_NOISESENSOR_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Smoothed',
      atBit: 8,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'HighestSinceLastReading',
      atBit: 24,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Raw',
      atBit: 40,
      bits: 16,
      postMult: 1,
      postAdd: 0,
    },
  ],
};

/* eslint no-unused-vars: ['error', { argsIgnorePattern: "^_" }] */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint no-empty-function: ["error", { "allow": ["methods"] }]*/
/* eslint-disable @typescript-eslint/no-empty-function */
class RICAddOnGripServo extends RICAddOnBase {
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
  }

  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // RICLog.debug("RICADDONMANAGER: debugging info");

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDFoot extends RICAddOnBase {
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // RICLog.debug("RICADDONMANAGER: debugging info");

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDArm extends RICAddOnBase {
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();
    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDEye extends RICAddOnBase {
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDEyeBusPix extends RICAddOnBase {
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    // static add-on is do not publish their data to ROS (e.g, LED eye buspix)
    // we use this flag to grab these addons from withing the ricjs library
    super._isStatic = true;
  }
  processPublishedData(
    addOnID: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = 128; 
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnIRFoot extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    this._dataExtractor = new RICDataExtractor(name, ADDON_IRFOOT_FORMAT_DEF);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);

    // adding predicted values for Touch and Ground
    estimateDetectionFlags(retStatus, this._whoAmITypeCode);

    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnColourSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    this._dataExtractor = new RICDataExtractor(
      name,
      ADDON_COLOURSENSOR_FORMAT_DEF,
    );
    this._initCmd = `elem/${name}/json?cmd=raw&hexWr=104020&numToRd=20&msgKey=1234`;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);

    // adding predicted values for Touch and Ground
    estimateDetectionFlags(retStatus, this._whoAmITypeCode);

    return retStatus;
  }

  setCalibration(cal: Array<number>) {
    if (cal.length != 4) {
      console.warn(`Colour sensor calibration function called with ${cal.length} parameters, expected 4`);
    }
    const [c, r, g, b] = cal;
    this._dataExtractor._formatDef.fields[0].postMult = c;
    this._dataExtractor._formatDef.fields[1].postMult = r;
    this._dataExtractor._formatDef.fields[2].postMult = g;
    this._dataExtractor._formatDef.fields[3].postMult = b;
    RICLog.debug(`Setting colour Sensor ${this._name} calibration: ${c}, ${r}, ${g}, ${b}`);
    this._dataExtractor.preCalcs();
  }

  getCalibration(): Array<number> {
    const c = this._dataExtractor._formatDef.fields[0].postMult ? this._dataExtractor._formatDef.fields[0].postMult : 1.0;
    const r = this._dataExtractor._formatDef.fields[1].postMult ? this._dataExtractor._formatDef.fields[1].postMult : 1.0;
    const g = this._dataExtractor._formatDef.fields[2].postMult ? this._dataExtractor._formatDef.fields[2].postMult : 1.0;
    const b = this._dataExtractor._formatDef.fields[3].postMult ? this._dataExtractor._formatDef.fields[3].postMult : 1.0;
    RICLog.debug(`Colour Sensor calibration: ${c}, ${r}, ${g}, ${b}`);
    return [c, r, g, b];
  }

  processInit(dataReceived: RICReportMsg) {
    RICLog.debug(`Addon ${this._name} init data received ${JSON.stringify(dataReceived)}`)
    if (dataReceived.elemName != this._name) {
      RICLog.warn(`Addon init Rx received  for ${this._name} but addon name wrong: ${JSON.stringify(dataReceived)}`);
    }
    if (dataReceived.hexRd) {
      const cal = this.getCalibration();

      for (let i = 0; i < 4; i++) {
        const calRcv = parseInt(dataReceived.hexRd.substr(4 * i, 4), 16);
        if (calRcv > 0) { cal[i] = 255 / calRcv; }
      }

      this.setCalibration(cal);
    }
  }
}

class RICAddOnDistanceSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    this._dataExtractor = new RICDataExtractor(
      name,
      ADDON_DISTANCESENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLightSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    this._dataExtractor = new RICDataExtractor(
      name,
      ADDON_LIGHTSENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnNoiseSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, typeName: string, whoAmI: string, whoAmITypeCode: string) {
    super(name, typeName, whoAmI, whoAmITypeCode);
    this._dataExtractor = new RICDataExtractor(
      name,
      ADDON_NOISESENSOR_FORMAT_DEF,
    );
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
    rawData: Uint8Array,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();
    // Extract data
    retStatus.id = addOnID;
    retStatus.name = this._name;
    retStatus.whoAmI = this._whoAmI;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

