"use strict";

import powerbi from "powerbi-visuals-api";
import * as d3 from "d3";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;

export class Visual implements IVisual {
    private target: HTMLElement;
    private svgCodes: string[] = [];
    private kpiNames: string[] = [];
    private currentIndex: number = 0;
    private timer: any = null;
    private lastWidth: number = 800;
    private lastHeight: number = 600;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews && options.dataViews[0];

        // Převzít aktuální velikost vizuálu
        this.lastWidth = options.viewport && options.viewport.width ? options.viewport.width : 800;
        this.lastHeight = options.viewport && options.viewport.height ? options.viewport.height : 600;

        this.svgCodes = [];
        this.kpiNames = [];
        this.currentIndex = this.currentIndex || 0;

        if (
            dataView &&
            dataView.categorical &&
            dataView.categorical.values &&
            dataView.categorical.values[0] &&
            dataView.categorical.values[0].values
        ) {
            this.svgCodes = dataView.categorical.values[0].values.map(val =>
                val ? val.toString() : ""
            );
        }

        if (
            dataView &&
            dataView.categorical &&
            dataView.categorical.categories &&
            dataView.categorical.categories[0] &&
            dataView.categorical.categories[0].values
        ) {
            this.kpiNames = dataView.categorical.categories[0].values.map(val =>
                val ? val.toString() : ""
            );
        }

        if (this.currentIndex >= this.svgCodes.length) {
            this.currentIndex = 0;
        }
        this.render();
    }

    private render() {
        d3.select(this.target).selectAll("*").remove();

        // Dynamické rozměry podle canvasu (Power BI viewport)
        const width = this.lastWidth;
        const height = this.lastHeight;
        const navHeight = 60;
        const carouselHeight = Math.max(100, height - navHeight - 10);

        // Main vertical layout
        const main = d3.select(this.target)
            .append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("width", width + "px")
            .style("height", height + "px")
            .style("overflow", "hidden")
            .style("position", "relative");

        // Carousel container (horizontální flex, "in space" efekt)
        const carousel = main.append("div")
            .style("display", "flex")
            .style("flex-direction", "row")
            .style("align-items", "center")
            .style("justify-content", "center")
            .style("width", width + "px")
            .style("height", carouselHeight + "px")
            .style("position", "relative")
            .style("overflow", "visible");

        const total = this.svgCodes.length;
        if (total === 0) {
            carousel.append("div").text("No SVG data available.");
        } else {
            // Indices pro levý, střed, pravý
            const center = this.currentIndex;
            const left = (center + total - 1) % total;
            const right = (center + 1) % total;

            // Dynamické rozměry podle velikosti vizuálu
            const sideW = Math.max(100, Math.round(width * 0.23));
            const sideH = Math.max(80, Math.round(carouselHeight * 0.35));
            const centerW = Math.max(350, Math.round(width * 0.7));
            const centerH = Math.max(200, Math.round(carouselHeight * 0.95));

            // Levý obrázek (menší, průhledný, posunutý vlevo)
            if (total > 1) {
                let leftSvg = this.svgCodes[left] || "";
                leftSvg = leftSvg.replace(/^data:image\/svg\+xml(;charset=utf8)?[,]?/i, "");
                try { leftSvg = decodeURIComponent(leftSvg); } catch (e) {}

                carousel.append("div")
                    .style("width", sideW + "px")
                    .style("height", sideH + "px")
                    .style("margin-right", "-30px")
                    .style("opacity", "0.3")
                    .style("filter", "blur(1.5px)")
                    .style("transform", "translateX(-40px) scale(0.75)")
                    .style("z-index", "0")
                    .html(leftSvg);
            }

            // Střední obrázek (hlavní, velký, ostrý)
            let centerSvg = this.svgCodes[center] || "";
            centerSvg = centerSvg.replace(/^data:image\/svg\+xml(;charset=utf8)?[,]?/i, "");
            try { centerSvg = decodeURIComponent(centerSvg); } catch (e) {}

            carousel.append("div")
                .style("width", centerW + "px")
                .style("height", centerH + "px")
                .style("background", "#fff")
                .style("border-radius", "18px")
                .style("box-shadow", "0 2px 16px rgba(0,0,0,0.11)")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "center")
                .style("z-index", "1")
                .style("position", "relative")
                .html(centerSvg);

            // Pravý obrázek (menší, průhledný, posunutý vpravo)
            if (total > 2) {
                let rightSvg = this.svgCodes[right] || "";
                rightSvg = rightSvg.replace(/^data:image\/svg\+xml(;charset=utf8)?[,]?/i, "");
                try { rightSvg = decodeURIComponent(rightSvg); } catch (e) {}

                carousel.append("div")
                    .style("width", sideW + "px")
                    .style("height", sideH + "px")
                    .style("margin-left", "-30px")
                    .style("opacity", "0.3")
                    .style("filter", "blur(1.5px)")
                    .style("transform", "translateX(40px) scale(0.75)")
                    .style("z-index", "0")
                    .html(rightSvg);
            }
        }

        // --- Ovládací prvky DOLE pod carousel ---
        if (this.svgCodes.length > 1) {
            const nav = main.append("div")
                .style("display", "flex")
                .style("flex-direction", "row")
                .style("align-items", "center")
                .style("justify-content", "center")
                .style("gap", "20px")
                .style("margin-top", "0")
                .style("position", "absolute")
                .style("bottom", "18px")
                .style("left", "0")
                .style("width", "100%");

            nav.append("button")
                .html('<svg width="34" height="34" viewBox="0 0 32 32"><polyline points="20 8 12 16 20 24" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
                .style("background", "none")
                .style("border", "2px solid #eaeaea")
                .style("border-radius", "9px")
                .style("padding", "4px 12px")
                .style("cursor", "pointer")
                .style("transition", "border 0.2s")
                .on("mouseover", function() { d3.select(this).style("border", "2px solid #888"); })
                .on("mouseout", function() { d3.select(this).style("border", "2px solid #eaeaea"); })
                .on("click", () => {
                    this.stopTimer();
                    this.currentIndex = (this.currentIndex + this.svgCodes.length - 1) % this.svgCodes.length;
                    this.render();
                    this.startTimer();
                });

            nav.append("span")
                .style("font-size", "18px")
                .style("font-weight", "bold")
                .style("color", "#222")
                .text(`${this.currentIndex + 1} / ${this.svgCodes.length}`);

            nav.append("button")
                .html('<svg width="34" height="34" viewBox="0 0 32 32"><polyline points="12 8 20 16 12 24" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
                .style("background", "none")
                .style("border", "2px solid #eaeaea")
                .style("border-radius", "9px")
                .style("padding", "4px 12px")
                .style("cursor", "pointer")
                .style("transition", "border 0.2s")
                .on("mouseover", function() { d3.select(this).style("border", "2px solid #888"); })
                .on("mouseout", function() { d3.select(this).style("border", "2px solid #eaeaea"); })
                .on("click", () => {
                    this.stopTimer();
                    this.currentIndex = (this.currentIndex + 1) % this.svgCodes.length;
                    this.render();
                    this.startTimer();
                });
        }

        // --- Automatické otáčení ---
        this.stopTimer();
        if (this.svgCodes.length > 1) {
            this.startTimer();
        }
    }

    private startTimer() {
        this.timer = setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.svgCodes.length;
            this.render();
        }, 1000);
    }

    private stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
