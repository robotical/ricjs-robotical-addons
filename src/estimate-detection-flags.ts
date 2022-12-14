import { ROSSerialAddOnStatus } from "@robotical/ricjs";
import {
  CS_AIR_FLAG,
  CS_CLEAR,
  CS_IRVAL,
  CS_TOUCH_FLAG,
  IRF_AIR_FLAG,
  IRF_AIR_VAL,
  IRF_TOUCH_FLAG,
  IRF_TOUCH_VAL,
} from "./RICRoboticalAddOns";

const BATCH1_IRF_TYPE_CODE = "86";
const BATCH2_IRF_TYPE_CODE = "8c";
const BATCH3_IRF_TYPE_CODE = "8c";

const BATCH1_CS_TYPE_CODE = "85";
const BATCH2_CS_TYPE_CODE = "85";
const BATCH3_CS_TYPE_CODE = "91";

// PARAMETERS
const PARAMETERS: { [key: string]: { air: number[]; touch: number[] } } = {
  [BATCH1_IRF_TYPE_CODE]: {
    air: [34.5849, -0.3728],
    touch: [-102.8246, 0.7653],
  },
  [BATCH2_IRF_TYPE_CODE]: {
    air: [222.3752, -1.6011],
    touch: [-404.36, 20.25],
  },
  [BATCH3_IRF_TYPE_CODE]: {
    air: [814.77, -5.68],
    touch: [-176.76, 7.86],
  },
  [BATCH1_CS_TYPE_CODE]: {
    air: [15.97, -0.33],
    touch: [-380.21, 2.33],
  },
  [BATCH2_CS_TYPE_CODE]: {
    air: [15.86, -0.24],
    touch: [-213.5014, 1.5257],
  },
  [BATCH3_CS_TYPE_CODE]: {
    air: [24.3133, -0.4426],
    touch: [-228.69, 10.47],
  },
};
export const estimateIRFSensorDetectionFlags = (
  retStatus: ROSSerialAddOnStatus,
  whoAmITypeCode: string
) => {
  try {
    addPrediction(
      PARAMETERS[whoAmITypeCode].air[0],
      PARAMETERS[whoAmITypeCode].air[1],
      IRF_AIR_VAL,
      IRF_AIR_FLAG,
      retStatus
    );
    addPrediction(
      PARAMETERS[whoAmITypeCode].touch[0],
      PARAMETERS[whoAmITypeCode].touch[1],
      IRF_TOUCH_VAL,
      IRF_TOUCH_FLAG,
      retStatus
    );
  } catch (e) {
    // fallback case where if the whoAmITypeCode of the sensor doesn't exist
    // the estimated value is the same as the true
    retStatus.vals[retStatus.name + IRF_AIR_FLAG + "^"] =
      retStatus.vals[retStatus.name + IRF_AIR_FLAG];
    retStatus.vals[retStatus.name + IRF_TOUCH_FLAG + "^"] =
      retStatus.vals[retStatus.name + IRF_TOUCH_FLAG];
      console.log("non existed whoAmI: " + whoAmITypeCode + "for irf sensor");
  }
};

export const estimateColourSensorDetectionFlags = (
  retStatus: ROSSerialAddOnStatus,
  whoAmITypeCode: string
) => {
  try {
    addPrediction(
      PARAMETERS[whoAmITypeCode].air[0],
      PARAMETERS[whoAmITypeCode].air[1],
      CS_CLEAR,
      CS_AIR_FLAG,
      retStatus
    );
    addPrediction(
      PARAMETERS[whoAmITypeCode].touch[0],
      PARAMETERS[whoAmITypeCode].touch[1],
      CS_IRVAL,
      CS_TOUCH_FLAG,
      retStatus
    );
  } catch (e) {
    // fallback case where if the whoAmITypeCode of the sensor doesn't exist
    // the estimated value is the same as the true
    retStatus.vals[retStatus.name + CS_TOUCH_FLAG + "^"] =
      retStatus.vals[retStatus.name + CS_TOUCH_FLAG];
    retStatus.vals[retStatus.name + CS_AIR_FLAG + "^"] =
      retStatus.vals[retStatus.name + CS_AIR_FLAG];
    console.log("non existed whoAmI: " + whoAmITypeCode + "for colour sensor");
  }
};

const lrm_predict = (x: number, p1: number, p2: number) => {
  return 1 / (1 + Math.exp(-(p1 + p2 * x)));
};

const addPrediction = (
  p1: number,
  p2: number,
  predictorName: string,
  flagName: string,
  retStatus: ROSSerialAddOnStatus
) => {
  const x = retStatus.vals[retStatus.name + predictorName] as number;
  const pOfTrue = lrm_predict(p1, p2, x);
  const prediction = Math.random() < pOfTrue ? true : false;
  retStatus.vals[retStatus.name + flagName + "^"] = prediction;
};
