// Secure Data Transfer Visualization
// Shows encrypted data flow between secure data centers
// Real-time visualization of secure data transmission

'use client';
/* Imports */
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import React, { useLayoutEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

function ComputationMap({ chartID }: { chartID: string }) {
    const rootRef = useRef<any>(null);
    const [polygonSeries, setPolygonSeries] = useState<any>(null);
    const [pointSeries, setPointSeries] = useState<any>(null);
    const [chart, setChart] = useState<any>(null);

    const initMap = (): { polygons: any; points: any; chart: any } => {
        if (rootRef.current) {
            let root = rootRef.current;
            root.setThemes([am5themes_Animated.new(root)]);

            // Create the map chart
            // https://www.amcharts.com/docs/v5/charts/map-chart/
            let chart = root.container.children.push(
                am5map.MapChart.new(root, {
                    panX: 'none',
                    panY: 'none',
                    projection: am5map.geoMercator(),
                    wheelY: 'none',
                    wheelX: 'none',
                    pinchZoom: false
                })
            );

            // Create main polygon series for countries
            // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
            let polygonSeries = chart.series.push(
                am5map.MapPolygonSeries.new(root, {
                    geoJSON: am5geodata_worldLow,
                    exclude: ['AQ']
                })
            );

            polygonSeries.set('fill', am5.color('#212529'));

            polygonSeries.mapPolygons.template.states.create('hover', {
                fill: root.interfaceColors.get('primaryButtonHover')
            });

            // Create series for background fill
            // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
            let backgroundSeries = chart.series.push(
                am5map.MapPolygonSeries.new(root, {})
            );
            backgroundSeries.mapPolygons.template.setAll({
                fill: root.interfaceColors.get('background'),
                fillOpacity: 0,
                strokeOpacity: 0
            });

            // Add background polygon
            // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
            backgroundSeries.data.push({
                geometry: am5map.getGeoRectangle(90, 180, -90, -180)
            });

            // Create line series for secure data transfer paths
            // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
            let lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
            lineSeries.mapLines.template.setAll({
                stroke: am5.color(0x00ff00), // Green for secure connection
                strokeOpacity: 0.6,
                strokeWidth: 3,
                strokeDasharray: [5, 5] // Dashed line to show data flow
            });

            // Create point series for markers
            // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
            let pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

            pointSeries.bullets.push(function () {
                let image = am5.Picture.new(root, {
                    src: 'https://private-user-images.githubusercontent.com/9695866/499594667-d3353459-204b-459d-ac50-37b920beca19.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjAwNTExMzQsIm5iZiI6MTc2MDA1MDgzNCwicGF0aCI6Ii85Njk1ODY2LzQ5OTU5NDY2Ny1kMzM1MzQ1OS0yMDRiLTQ1OWQtYWM1MC0zN2I5MjBiZWNhMTkuZ2lmP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI1MTAwOSUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNTEwMDlUMjMwMDM0WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9MmIzZDVjMjg1MTdmMDk4MGRhZWY3MzBjOTk1NmYyOTA0MjZiY2RjM2IzYjU4YTM3ZDdlYTZmMmYyYzVhNWFmZCZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.OMIHomzVXs7cZQ-Vx3Wse6LT2Wk4dYVLQ7HNaOiJLF8',
                    width: 500,
                    height: 500,
                    centerX: am5.p50,
                    centerY: am5.p50,
                    tooltipText: '{title}',
                    cursorOverStyle: 'pointer',
                    tooltipY: 0
                });
                return am5.Bullet.new(root, {
                    sprite: image
                });
            });

            pointSeries.bullets.push(function () {
                let label = am5.Label.new(root, {
                    text: '[#FFF]{label}',
                    populateText: true,
                    dy: -25,
                    dx: -120,
                });
                return am5.Bullet.new(root, {
                    sprite: label
                });
            });
            let india = addCity(
                pointSeries,
                { latitude: 22.74, longitude: 79.1025 },
                'LoanConnect'
            );
            // Calculate bounding box for the point series to set initial zoom
            zoomToPoints(polygonSeries);

            // Make stuff animate on load
            chart.appear(1000, 100);

            return { polygons: polygonSeries, points: pointSeries, chart: chart };
        } else {
            return { polygons: null, points: null, chart: null };
        }
    };

    useLayoutEffect(() => {
        const root = am5.Root.new(chartID);
        rootRef.current = root;
        let { polygons, points, chart } = initMap();
        setPolygonSeries(polygons);
        setPointSeries(points);
        setChart(chart);

        return () => {
            root.dispose();
        };
    }, [chartID]);

    function animateStart(startDataItem: any, endDataItem: any, duration: any) {
        let startAnimation = startDataItem.animate({
            key: 'positionOnLine',
            from: 0,
            to: 1,
            duration: duration,
            easing: am5.ease.linear
        });

        startAnimation.events.on('stopped', function () {
            animateEnd(startDataItem, endDataItem, duration);
        });
    }

    function animateEnd(startDataItem: any, endDataItem: any, duration: any) {
        startDataItem.set('positionOnLine', 0);
        let endAnimation = endDataItem.animate({
            key: 'positionOnLine',
            from: 0,
            to: 1,
            duration: duration,
            easing: am5.ease.linear
        });

        endAnimation.events.on('stopped', function () {
            animateStart(startDataItem, endDataItem, duration);
        });
    }

    function addCity(
        pointSeries: any,
        coords: { latitude: number; longitude: number },
        title: string
    ) {
        return pointSeries.pushDataItem({
            latitude: coords.latitude,
            longitude: coords.longitude,
            title: title,
        });
    }

    const zoomToPoints = (polygonSeries: any) => {
        polygonSeries.events.on('datavalidated', function () {

            const dataItem = polygonSeries.dataItems.find(
                (item: any) => item.dataContext?.id === "IN"
            );
            if (dataItem) {
                polygonSeries.zoomToDataItem(dataItem);
            }
        });
    };

    return (
        <Card>
            <CardContent>
                <div style={{ width: '100%', height: '350px' }} id={chartID}></div>
            </CardContent>
        </Card>
    );
}

export default ComputationMap;
