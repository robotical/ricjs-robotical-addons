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

export default class RICRoboticalAddOns {
  static registerAddOns(addOnRegistry: RICAddOnRegistry): void {
    const addOns = {
      '00000083': { "class": RICAddOnDistanceSensor, "typeName": "DistanceSensor" },
      '00000084': { "class": RICAddOnLightSensor,    "typeName": "LightSensor" },
      '00000085': { "class": RICAddOnColourSensor,   "typeName": "ColourSensor" },
      '00000086': { "class": RICAddOnIRFoot,         "typeName": "IRFoot" },
      '00000087': { "class": RICAddOnLEDFoot,        "typeName": "DiscoFoot" },
      '00000088': { "class": RICAddOnLEDArm,         "typeName": "DiscoArm" },
      '00000089': { "class": RICAddOnLEDEye,         "typeName": "DiscoEyes" },
      '0000008A': { "class": RICAddOnNoiseSensor,    "typeName": "NoiseSensor" },
      '0000008B': { "class": RICAddOnGripServo,      "typeName": "Gripper" },
      '0000008C': { "class": RICAddOnIRFoot,         "typeName": "IRFoot" },
      '0000008D': { "class": RICAddOnLEDArm,         "typeName": "DiscoArm" },
    };
    for (const [key, value] of Object.entries(addOns)) {
        addOnRegistry.registerHWElemType(key, 
              value.typeName, 
              "RSAddOn", 
              (typeCode: string, name: string, addOnFamily: string) => {
                const deviceTypeCode = parseInt(typeCode, 16);
                return new value.class(name, deviceTypeCode, addOnFamily) 
              } 
      );
    }
  }
}

// Format definitions
const ADDON_IRFOOT_FORMAT_DEF = {
  fields: [
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: 'Touch',
      atBit: 8,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: 'Air',
      atBit: 9,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_UNSIGNED,
      suffix: 'Val',
      atBit: 16,
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
      suffix: 'Clear',
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
      suffix: 'Touch',
      atBit: 48,
      bits: 1,
      postMult: 1,
      postAdd: 0,
    },
    {
      type: RICDataExtractorVarType.VAR_BOOL,
      suffix: 'Air',
      atBit: 49,
      bits: 1,
      postMult: 1,
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
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDFoot extends RICAddOnBase {
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDArm extends RICAddOnBase {
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
    this._deviceTypeID = deviceTypeID;
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLEDEye extends RICAddOnBase {
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
  }
  processPublishedData(
    addOnID: number,
    statusByte: number,
  ): ROSSerialAddOnStatus {
    // Status to return
    const retStatus = new ROSSerialAddOnStatus();

    // Extract data
    retStatus.id = addOnID;
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnIRFoot extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
    this._deviceTypeID = deviceTypeID;
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnColourSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
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
        const calRcv = parseInt(dataReceived.hexRd.substring(4 * i, 4), 16);
        if (calRcv > 0) { cal[i] = 255 / calRcv; }
      }

      this.setCalibration(cal);
    }
  }
}

class RICAddOnDistanceSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnLightSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

class RICAddOnNoiseSensor extends RICAddOnBase {
  _dataExtractor: RICDataExtractor;
  constructor(name: string, deviceTypeID: number, typeName: string) {
    super(name, deviceTypeID, typeName);
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
    retStatus.deviceTypeID = this._deviceTypeID;
    retStatus.name = this._name;
    retStatus.status = statusByte;
    retStatus.vals = this._dataExtractor.extractData(rawData);
    return retStatus;
  }
  processInit(_dataReceived: RICReportMsg): void {
  }
}

