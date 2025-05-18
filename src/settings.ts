import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class HistogramSettings extends DataViewObjectsParser {
    public general: HistogramGeneralSettings = new HistogramGeneralSettings();
    public dataPoint: HistogramDataPointSettings = new HistogramDataPointSettings();
    public xAxis: HistogramXAxisSettings = new HistogramXAxisSettings();
    public yAxis: HistogramYAxisSettings = new HistogramYAxisSettings();
    public labels: HistogramLabelSettings = new HistogramLabelSettings();
    public tooltip: TooltipSettings = new TooltipSettings();
}

export class HistogramGeneralSettings {
    public static DefaultBins: number = null;
    public static MinNumberOfBins: number = 0;
    public static MaxNumberOfBins: number = 5000;

    /**
     * Please note that this property isn't enumerated in capabilities.json.
     * That means that users won't see it on the format panel.
     */
    public displayName: string = "Histogram";

    public bins: number = HistogramGeneralSettings.DefaultBins;
    public frequency: boolean = true;
}

export class HistogramDataPointSettings {
    public fill: string = "#01b8aa";
    public fillEven: string = "#01b8aa";
}

export enum HistogramAxisStyle {
    showTitleOnly = <any>"showTitleOnly",
    showUnitOnly = <any>"showUnitOnly",
    showBoth = <any>"showBoth"
}

export class HistogramAxisSettings {
    public show: boolean = true;
    public axisColor: string = "#777";
    public strokeColor: string = "#777";
    public title: boolean = true;
    public displayUnits: number = 0;
    public precision: number = 2;
    public style: HistogramAxisStyle = HistogramAxisStyle.showTitleOnly;
}

export class HistogramXAxisSettings extends HistogramAxisSettings {
    public start: number = null;
    public end: number = null;
}

export class HistogramYAxisSettings extends HistogramAxisSettings {
    public start: number = 0;
    public end: number = null;
    public position: HistogramPositionType = HistogramPositionType.Left;
}

export enum HistogramPositionType {
    Left = <any>"Left",
    Right = <any>"Right"
}

export class HistogramLabelSettings {
    public show: boolean = false;
    public color: string = "#777777";
    public displayUnits: number = 0;
    public precision: number = 2;
    public fontSize: number = 9;
}

export class TooltipSettings {
    public reportPage: string = "";
}
