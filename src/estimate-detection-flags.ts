import { ROSSerialAddOnStatus } from "@robotical/ricjs";
import {
  CS_AIR_FLAG,
  CS_CLEAR,
  CS_IRVAL,
  //   CS_CLEAR,
  //   CS_IRVAL,
  CS_TOUCH_FLAG,
  IRF_AIR_AMBIENT,
  IRF_AIR_FLAG,
  IRF_AIR_VAL,
  IRF_TOUCH_AMBIENT,
  IRF_TOUCH_FLAG,
  IRF_TOUCH_VAL,
} from "./RICRoboticalAddOns";

const BATCH1_IRF_TYPE_CODE = "86";
const BATCH2_IRF_TYPE_CODE = "8c";
const BATCH3_IRF_TYPE_CODE = "8c";

const BATCH1_CS_TYPE_CODE = "85";
const BATCH2_CS_TYPE_CODE = "85";
const BATCH3_CS_TYPE_CODE = "91";
type ModelType = (retStatus: ROSSerialAddOnStatus) => void;
// PARAMETERS
const PARAMETERS: {
  [key: string]: {
    air: {
      parameters: number[];
      model: ModelType;
    };
    touch: {
      parameters: number[];
      model: ModelType;
    };
  };
} = {
  [BATCH1_IRF_TYPE_CODE]: {
    air: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        // const predictorNames = [IRF_TOUCH_VAL, IRF_AIR_VAL]; // [x1, x2]
        // const flagName = IRF_AIR_FLAG;
        // const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        // const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        // const pOfTrue =
        //   1 /
        //   (1 +
        //     Math.exp(
        //       -(
        //         this.parameters[0] +
        //         this.parameters[1] * x1 +
        //         this.parameters[2] * x2 +
        //         this.parameters[3] * x1 ** 2 +
        //         this.parameters[4] * x2 ** 2
        //       )
        //     ));
        // const prediction = 0.5 < pOfTrue ? true : false;
        // retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [-80.7393, 11.5344, 2.7277, 0.246, -0.022],
    },
    touch: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [IRF_TOUCH_VAL, IRF_AIR_VAL]; // [x1, x2]
        const flagName = IRF_TOUCH_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [-92.6231, 11.2271, 1.8711, -0.02511, -0.01076],
    },
  },
  [BATCH2_IRF_TYPE_CODE]: {
    air: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        // const predictorNames = [IRF_AIR_VAL, IRF_AIR_AMBIENT]; // [x1, x2]
        // const flagName = IRF_AIR_FLAG;
        // const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        // const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        // const pOfTrue =
        //   1 /
        //   (1 +
        //     Math.exp(
        //       -(
        //         this.parameters[0] +
        //         this.parameters[1] * x1 +
        //         this.parameters[2] * x2 +
        //         this.parameters[3] * x1 ** 2 +
        //         this.parameters[4] * x2 ** 2
        //       )
        //     ));
        // const prediction = 0.5 < pOfTrue ? true : false;
        // retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [510.4559, -15.0318, 18.4332, 0.04868, -0.1463],
    },
    touch: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [IRF_TOUCH_VAL, IRF_TOUCH_AMBIENT]; // [x1, x2]
        const flagName = IRF_TOUCH_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [-217.147, 7.5363, 14.8915, -0.02244, -0.801],
    },
  },
  [BATCH3_IRF_TYPE_CODE]: {
    air: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        // const predictorNames = [IRF_AIR_VAL, IRF_AIR_AMBIENT]; // [x1, x2]
        // const flagName = IRF_AIR_FLAG;
        // const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        // const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        // const pOfTrue =
        //   1 /
        //   (1 +
        //     Math.exp(
        //       -(
        //         this.parameters[0] +
        //         this.parameters[1] * x1 +
        //         this.parameters[2] * x2 +
        //         this.parameters[3] * x1 ** 2 +
        //         this.parameters[4] * x2 ** 2
        //       )
        //     ));
        // const prediction = 0.5 < pOfTrue ? true : false;
        // retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [510.4559, -15.0318, 18.4332, 0.04868, -0.1463],
    },
    touch: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [IRF_TOUCH_VAL, IRF_TOUCH_AMBIENT]; // [x1, x2]
        const flagName = IRF_TOUCH_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      parameters: [-217.147, 7.5363, 14.8915, -0.02244, -0.801],
    },
  },
  [BATCH1_CS_TYPE_CODE]: {
    air: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
        const flagName = CS_AIR_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      // parameters: [224.014, -5.6136, 0.6139, 0.01635, -0.004003],
      parameters: [14.892, -0.2493, -0.06107, 0.0006048, 0.0001023],
    },
    touch: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
        const flagName = CS_TOUCH_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      //   parameters: [-133.6305, -1.7764, 1.2792, 0.00553, -0.001576],
      parameters: [-272.4539, -1.9294, 2.3632, 0.005685, -0.0026],
    },
  },
  [BATCH2_CS_TYPE_CODE]: {
    air: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
        const flagName = CS_AIR_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      //   parameters: [224.014, -5.6136, 0.6139, 0.01635, -0.004003],
      parameters: [14.892, -0.2493, -0.06107, 0.0006048, 0.0001023],
    },
    touch: {
      model: function (retStatus: ROSSerialAddOnStatus) {
        const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
        const flagName = CS_TOUCH_FLAG;
        const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
        const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
        const pOfTrue =
          1 /
          (1 +
            Math.exp(
              -(
                this.parameters[0] +
                this.parameters[1] * x1 +
                this.parameters[2] * x2 +
                this.parameters[3] * x1 ** 2 +
                this.parameters[4] * x2 ** 2
              )
            ));
        const prediction = 0.5 < pOfTrue ? true : false;
        retStatus.vals[retStatus.name + flagName ] = prediction;
      },
      //   parameters: [-133.6305, -1.7764, 1.2792, 0.00553, -0.001576],
      parameters: [-272.4539, -1.9294, 2.3632, 0.005685, -0.0026],
    },
  },
  [BATCH3_CS_TYPE_CODE]: {
    air: {
        model: function (retStatus: ROSSerialAddOnStatus) {
            const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
            const flagName = CS_AIR_FLAG;
            const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
            const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
            const pOfTrue =
              1 /
              (1 +
                Math.exp(
                  -(
                    this.parameters[0] +
                    this.parameters[1] * x1 +
                    this.parameters[2] * x2 +
                    this.parameters[3] * x1 ** 2 +
                    this.parameters[4] * x2 ** 2
                  )
                ));
            const prediction = 0.5 < pOfTrue ? true : false;
            retStatus.vals[retStatus.name + flagName ] = prediction;
          },
      parameters: [102.3661, -1.891, -0.4547, 0.005837, 0.0008272],
    },
    touch: {
        model: function (retStatus: ROSSerialAddOnStatus) {
            const predictorNames = [CS_CLEAR, CS_IRVAL]; // [x1, x2]
            const flagName = CS_TOUCH_FLAG;
            const x1 = retStatus.vals[retStatus.name + predictorNames[0]] as number;
            const x2 = retStatus.vals[retStatus.name + predictorNames[1]] as number;
            const pOfTrue =
              1 /
              (1 +
                Math.exp(
                  -(
                    this.parameters[0] +
                    // this.parameters[1] * x1 +
                    this.parameters[1] * x2 +
                    this.parameters[2] * x1 ** 2 +
                    this.parameters[3] * x2 ** 2
                  )
                ));
            const prediction = 0.5 < pOfTrue ? true : false;
            retStatus.vals[retStatus.name + flagName ] = prediction;
          },
      parameters: [-8.2175, -0.02629, -0.00005754, 0.0004032],
    },
  },
};
export const estimateDetectionFlags = (
  retStatus: ROSSerialAddOnStatus,
  whoAmITypeCode: string
) => {
  try {
    PARAMETERS[whoAmITypeCode].air.model(retStatus);
    PARAMETERS[whoAmITypeCode].touch.model(retStatus);
  } catch (e) {
    console.log("non existed whoAmI: " + whoAmITypeCode);
  }
};
