import { RICConnector, RICHWElemList, RICHWElemList_Str, RICLog, RICReportMsg } from "@robotical/ricjs";
import { RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR } from "./RICRoboticalAddOns";

// colour sensor commands
const GET_CALIBRATION_COMMAND = (hwElemName: string) => `elem/${hwElemName}/json?cmd=raw&hexWr=104020&numToRd=8&msgKey=1234`;
const GET_COLOUR_SENSOR_READING_COMMAND = (hwElemName: string) => `elem/${hwElemName}/json?cmd=raw&hexWr=&numToRd=5&msgKey=1`;
const CALIBRATE_COMMAND = (hwElemName: string, baseAddr: number, highByte: string, lowByte: string, i: number) =>
    `elem/${hwElemName}/json?cmd=raw&hexWr=ff4040${baseAddr.toString(16)}${highByte}${lowByte}&numToRd=0&msgKey=11${i}`;

type ColourSensorValues = { [colourSensorName: string]: { clear: number, red: number, green: number, blue: number } };


const MAX_CALIBRATION_ATTEMPTS = 5;
const TOLERANCE = 3; // tolerance for difference between calibration values and colour sensor readings

export default class ColourSensorManualCalibrator {
    private static _RICConnector: RICConnector;
    private static _isCalibrating = false;
    private static _calibrationValues: ColourSensorValues | null = null;
    private static _colourSensorReadings: ColourSensorValues | null = null;


    static async calibrate(ricConnector: RICConnector, retryTimes = 0): Promise<boolean> {
        RICLog.info(`\n==== Calibration attempt ${retryTimes + 1} ====`);

        if (!this.prepareForCalibration(ricConnector)) {
            return false;
        }

        try {
            if (await this.performCalibrationSequence()) {
                const isSame = await this.compareCalibrationValues(this._calibrationValues, this._colourSensorReadings);
                return await this.handleCalibrationOutcome(isSame, ricConnector, retryTimes);
            }

            return this.handleMaxAttempts(retryTimes, ricConnector);

        } catch (error) {
            RICLog.error("Error calibrating colour sensor: " + JSON.stringify(error));
            return false;
        } finally {
            this._isCalibrating = false;
        }
    }

    private static prepareForCalibration(ricConnector: RICConnector): boolean {
        if (this._isCalibrating) {
            return false;
        }
        this._RICConnector = ricConnector;
        this._isCalibrating = true;
        return true;
    }

    private static async performCalibrationSequence(): Promise<boolean> {
        const names = await this.getColourSensorNames();
        await this.turnOnServosIfRequired(names);

        const calibration1Success = await this.getCalibration(names);
        const csReadingSuccess = await this.getColourSensorReading(names);
        const calibration2Success = await this.getCalibration(names);

        return calibration1Success && csReadingSuccess && calibration2Success;
    }

    private static async handleCalibrationOutcome(isSame: boolean, ricConnector: RICConnector, retryTimes: number): Promise<boolean> {
        if (isSame) {
            return true;
        }
        this._isCalibrating = false;
        return this.handleMaxAttempts(retryTimes, ricConnector);
    }

    private static async handleMaxAttempts(retryTimes: number, ricConnector: RICConnector): Promise<boolean> {
        if (retryTimes >= MAX_CALIBRATION_ATTEMPTS) {
            RICLog.error("Max calibration attempts reached");
            return false;
        }
        this._isCalibrating = false;
        return await this.calibrate(ricConnector, retryTimes + 1);
    }

    private static almostEqual(v1: number, v2: number, tolerance: number = TOLERANCE): boolean {
        return Math.abs(v1 - v2) <= tolerance;
    }

    private static async compareCalibrationValues(expected: ColourSensorValues | null, actual: ColourSensorValues | null): Promise<boolean> {
        RICLog.info("\n==== Comparing calibration values ====");
        RICLog.info("CalibrationValues: " + JSON.stringify(this._calibrationValues));
        RICLog.info("ColourSensorReadings: " + JSON.stringify(this._colourSensorReadings));
        if (expected === null || actual === null) {
            return false;
        }
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        if (expectedKeys.length !== actualKeys.length) {
            return false;
        }
        for (const key of expectedKeys) {
            if (!actualKeys.includes(key)) {
                return false;
            }
            const expectedValue = expected[key];
            const actualValue = actual[key];
            if (!this.almostEqual(expectedValue.clear, actualValue.clear)) {
                return false;
            }
            if (!this.almostEqual(expectedValue.red, actualValue.red)) {
                return false;
            }
            if (!this.almostEqual(expectedValue.green, actualValue.green)) {
                return false;
            }
            if (!this.almostEqual(expectedValue.blue, actualValue.blue)) {
                return false;
            }
        }
        return true;
    }

    private static async turnOnServosIfRequired(names: string[]) {
        if (names.length === 0) return;
        for (const name of names) {
            const hwElemList = await this._RICConnector.getRICMsgHandler()
                .sendRICRESTURL<RICHWElemList>(`hwstatus/status/${name}`);
            if (hwElemList?.rslt === "ok" && hwElemList.hw?.length > 0) {
                const hwElem = hwElemList.hw[0];
                if (!hwElem.commsOk) {
                    await this._RICConnector.getRICMsgHandler().sendRICRESTURL("pwrctrl/5von");
                    await new Promise((resolve) => setTimeout(resolve, 4000));
                    return;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    private static async getColourSensorNames(): Promise<string[]> {
        RICLog.info("\n==== getColourSensorNames ====");
        const names: string[] = [];
        try {
            const hwElemList_Str = await this._RICConnector.getRICMsgHandler()
                .sendRICRESTURL<RICHWElemList_Str>(`hwstatus/strstat/?filterByType=${RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR}`);
            const hwElems = hwElemList_Str.hw;
            let hwElemList;
            if (hwElems.length) {
                if (typeof hwElems[0] !== "object") {
                    // we are on a fw version that doesn't supports strstat
                    hwElemList = await this._RICConnector.getRICMsgHandler().sendRICRESTURL<
                        RICHWElemList
                    >(`hwstatus?filterByType=${RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR}`);
                } else {
                    // we are on the fw version that supports strstat
                    hwElemList = RICHWElemList_Str.expand(hwElemList_Str);
                }
            }

            if (hwElemList?.rslt === "ok" && hwElemList.hw?.length > 0) {
                for (const hwElem of hwElemList.hw) {
                    names.push(hwElem.name);
                }
            }
            RICLog.info("Colour sensor names: " + JSON.stringify(names));
            return names;
        } catch (e) {
            new Error("Error getting colour sensor names: " + JSON.stringify(e));
            return [];
        }
    }

    private static async getCalibration(names: string[]) {
        RICLog.info("\n==== getCalibration ====");
        const REPORT_MSG_KEY = "GET_CALIBRATION";
        const reports: RICReportMsg[] = [];
        this._RICConnector.getRICMsgHandler().reportMsgCallbacksSet(REPORT_MSG_KEY, (report) => {
            reports.push(report);
            RICLog.debug(`Report callback ${JSON.stringify(report)}`);
        });

        // Run command for each hardware element
        for (const hwElemName of names) {
            const command = GET_CALIBRATION_COMMAND(hwElemName);
            await this._RICConnector.getRICSystem().runCommand(command, {});
        }

        // Wait for report messages to be received
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this._RICConnector.getRICMsgHandler().reportMsgCallbacksDelete(REPORT_MSG_KEY);

        if (reports.length === 0) {
            RICLog.info("No reports received");
            return false;
        }

        // Process reports
        for (const report of reports) {
            if (report.hexRd && report.elemName) {
                const dataRead = report.hexRd;
                const clear = parseInt(dataRead.slice(0, 4), 16);
                const red = parseInt(dataRead.slice(4, 8), 16);
                const green = parseInt(dataRead.slice(8, 12), 16);
                const blue = parseInt(dataRead.slice(12, 16), 16);
                RICLog.info("Calibration Report -- " + "clear: " + clear + " red: " + red + " green: " + green + " blue: " + blue);
                this._calibrationValues = {
                    ...this._calibrationValues,
                    [report.elemName]: { clear, red, green, blue },
                };
            }
        }
        return true;
    }

    private static async getColourSensorReading(names: string[]) {
        const REPORT_MSG_KEY = "GET_COLOUR_SENSOR_READING";
        RICLog.info("\n==== getColourSensorReading ====");
        const reports: Array<RICReportMsg> = [];
        this._RICConnector.getRICMsgHandler()
            .reportMsgCallbacksSet(REPORT_MSG_KEY, function (report: RICReportMsg) {
                reports.push(report);
                RICLog.debug(`getHWElemCB Report callback ${JSON.stringify(report)}`);
            });

        for (const hwElemName of names) {
            const command = GET_COLOUR_SENSOR_READING_COMMAND(hwElemName);
            await this._RICConnector.getRICSystem().runCommand(command, {});
        }

        // wait a couple of seconds for any report messages to be received
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // remove report callback
        this._RICConnector
            .getRICMsgHandler()
            .reportMsgCallbacksDelete(REPORT_MSG_KEY);

        if (reports.length === 0) {
            RICLog.info("No reports received");
            return false;
        }

        // process reports
        for (const report of reports) {
            if (report.hexRd && report.elemName) {
                const dataRead = report.hexRd;
                const clear = parseInt(dataRead.slice(2, 4), 16);
                const red = parseInt(dataRead.slice(4, 6), 16);
                const green = parseInt(dataRead.slice(6, 8), 16);
                const blue = parseInt(dataRead.slice(8, 10), 16);
                // RICLog.info("getColourSensorReading", "clear", clear, "red", red, "green", green, "blue", blue);
                RICLog.info("getColourSensorReading -- " + "clear: " + clear + " red: " + red + " green: " + green + " blue: " + blue);
                this._colourSensorReadings = {
                    ...this._colourSensorReadings,
                    [report.elemName]: { clear, red, green, blue },
                };
                if (!await this.calibrateCS(report.elemName, { clear, red, green, blue })) {
                    return false;
                }
            }
        }
        return true;
    }

    private static async calibrateCS(
        name: string,
        reading: { clear: number; red: number; green: number; blue: number }
    ): Promise<boolean> {
        RICLog.info("\n==== calibrateCS ====");
        let baseAddr = 0x20;
        const channels = [reading.clear, reading.red, reading.green, reading.blue];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            RICLog.info(`Setting 0x${baseAddr.toString(16)} to ${channel}`);
            const highByte = (channel >> 8).toString(16).padStart(2, "0");
            const lowByte = (channel & 0xff).toString(16).padStart(2, "0");
            const command = CALIBRATE_COMMAND(name, baseAddr, highByte, lowByte, i);
            const rslt = await this._RICConnector.getRICSystem().runCommand(command, {});
            // RICLog.info("rslt:" + JSON.stringify(rslt));
            if (rslt.rslt !== "ok") {
                RICLog.info("Error setting calibration");
                return false;
            }
            baseAddr += 2;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return true;
    }
}
