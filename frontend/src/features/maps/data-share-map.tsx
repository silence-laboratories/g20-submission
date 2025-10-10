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

function DataShareMap({ chartID }: { chartID: string }) {
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
        strokeOpacity: 0,
        strokeWidth: 3,
        strokeDasharray: [5, 5] // Dashed line to show data flow
      });

      // Create point series for markers
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
      let pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

      pointSeries.bullets.push(function () {
        let image = am5.Picture.new(root, {
          src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KCjwhLS0gTGljZW5zZTogQ0MwIExpY2Vuc2UuIE1hZGUgYnkgU1ZHIFJlcG86IGh0dHBzOi8vd3d3LnN2Z3JlcG8uY29tL3N2Zy80NzQzOTQvc2VydmVyIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgY2xhc3M9Imljb24iICB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUyOS4wMjQ1OTUgMzcwLjM1MjIyM2MwLTcuNDQ2NjIzLTQuNTM0MTc3LTE2LjExMDE0LTEwLjExODU0OC0xOS4zMzQ1NDlMMjA4LjU2NzM2NyAxNzEuODQzODdDMTk5LjI2MDg3NCAxNjYuNDY5MDYgMTkxLjcwMjMyNiAxNzIuMTg0NDA5IDE5MS43MDIzMjYgMTg0LjU5Mzg2djY0Mi4xNjIzMDdjMCA5LjkyODAzNyA2LjA0NjM2MyAyMS40ODAxODYgMTMuNDkyOTg2IDI1Ljc4MDk4NmwyNzYuNjAzODMyIDE1OS42OTYzNzNjMjYuMDY0MzcyIDE1LjA0ODAzNyA0Ny4yMjU0NTEtMC45NDc3OTUgNDcuMjI1NDUxLTM1LjcwMTg3OVYzNzAuMzUyMjIzeiIgZmlsbD0iIzRFNkZCQiIgLz48cGF0aCBkPSJNODMxLjU1MjI5OCAxOTAuNTQ0OTY3YzAtNC42MDgtMi44MDUyODQtNi43Mjk4MjMtNi4yNjA2ODktNC43MzQyMTRsLTMwMC41ODY4NjUgMTczLjU0NDE4N2MtMy40NTU0MDUgMS45OTU2MDktNi4yNjMwNyA3LjM1NjEzLTYuMjYzMDcgMTEuOTY0MTN2NjE3LjAxOTUzNWMwIDI1LjM0NTE5MSAxNS40MzM4MjMgMzcuMDExNjQ3IDM0LjQ0MjEyMSAyNi4wMzU3OTVsMjcyLjQwNzgxNC0xNTcuMjcyMTEyYzMuNDU1NDA1LTEuOTk1NjA5IDYuMjYwNjg4LTcuMzU4NTEyIDYuMjYwNjg5LTExLjk2NjUxMVYxOTAuNTQ0OTY3eiIgZmlsbD0iIzRENkZCQiIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA5LjA4MjY0MmMtMTkuMDEzMDYtMTAuOTc4MjMzLTQ3LjgyMDgtMTIuMTcxMzEyLTY0LjI4ODE0OS0yLjY2NDc4MkwyMDQuNTE0MjMzIDE2My4xMTM2NzRjLTE2LjQ2NDk2NyA5LjUwNjUzLTE0LjM5NzkxNiAyNi4xMzgxOTUgNC42MTc1MjUgMzcuMTE2NDI4bDI3NS42MTMxNzIgMTU5LjEyNDgzOGMxOS4wMTMwNiAxMC45NzgyMzMgNDcuODIwOCAxMi4xNzM2OTMgNjQuMjg4MTQ5IDIuNjY0NzgxbDI3MS40MDUyNDctMTU2LjY5NTgxNGMxNi40NjczNDktOS41MDY1MyAxNC4zOTc5MTYtMjYuMTM4MTk1LTQuNjE1MTQ1LTM3LjExNjQyOEw1NDAuMjA3NjI4IDkuMDgyNjQyeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA2NjMuNjYxNTQ0Yy0xOS4wMTMwNi0xMC45NzgyMzMtNDcuODIwOC0xMi4xNzM2OTMtNjQuMjg4MTQ5LTIuNjY0NzgxTDIwNC41MTQyMzMgODE3LjY5MjU3N2MtMTYuNDY0OTY3IDkuNTA2NTMtMTQuMzk3OTE2IDI2LjEzODE5NSA0LjYxNzUyNSAzNy4xMTY0MjhsMjc1LjYxMzE3MiAxNTkuMTI0ODM3YzE5LjAxMzA2IDEwLjk3ODIzMyA0Ny44MjA4IDEyLjE3MzY5MyA2NC4yODgxNDkgMi42NjQ3ODFsMjcxLjQwNTI0Ny0xNTYuNjk1ODE0YzE2LjQ2NzM0OS05LjUwNjUzIDE0LjM5NzkxNi0yNi4xMzgxOTUtNC42MTUxNDUtMzcuMTE2NDI4bC0yNzUuNjE1NTUzLTE1OS4xMjQ4Mzd6IiBmaWxsPSIjNEQ2RkJCIiAvPjxwYXRoIGQ9Ik01MTMuMjUyNjE0IDUzMy4yMzk2NjVMMTkzLjQwMDI2IDM0OC41NzE5ODF2MzYuNDI1ODI0bDMxOS44NTIzNTQgMTg0LjY2NTMwMnYtMzYuNDIzNDQyek04MTUuNzgwMzE2IDM1OC41NzM4NDJsLTMwMi41Mjc3MDIgMTc0LjY2NTgyM3YzNi40MjM0NDJsMzAyLjUyNzcwMi0xNzQuNjYzNDQydi0zNi40MjU4MjN6IiBmaWxsPSIjNDQ2N0FFIiAvPjxwYXRoIGQ9Ik00NTQuNjM2OTQ5IDY1OS4xMDU5MzVjMC0yLjEzODQ5My0xLjMwMDI0Mi00LjYyNDY3LTIuOTAyOTIxLTUuNTUxMDMzbC0yMTAuODk4NzU0LTEyMS43NjA3NDRjLTEuNjAyNjc5LTAuOTI2MzYzLTIuOTA1MzAyIDAuMDU3MTUzLTIuOTA1MzAyIDIuMTk1NjQ3djY5LjcwMzQ0MmMwIDIuMTM2MTEyIDEuMzAyNjIzIDQuNjIyMjg4IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNWMxLjYwMjY3OSAwLjkyMzk4MSAyLjkwMjkyMS0wLjA1OTUzNSAyLjkwMjkyMS0yLjE5NTY0NnYtNjkuNzAzNDQyek00NTQuNjM2OTQ5IDgwOS4yNzY3MjZjMC0yLjEzNjExMi0xLjMwMDI0Mi00LjYyMjI4OC0yLjkwMjkyMS01LjU0ODY1MmwtMjEwLjg5ODc1NC0xMjEuNzYzMTI1Yy0xLjYwMjY3OS0wLjkyMzk4MS0yLjkwNTMwMiAwLjA1OTUzNS0yLjkwNTMwMiAyLjE5NTY0NnY2OS43MDM0NDJjMCAyLjEzODQ5MyAxLjMwMjYyMyA0LjYyNDY3IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNmMxLjYwMjY3OSAwLjkyNjM2MyAyLjkwMjkyMS0wLjA1NzE1MyAyLjkwMjkyMS0yLjE5NTY0N3YtNjkuNzAzNDQxeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNDQwLjM0ODU3NyAzNTUuMzE2MDkzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA3LTcuODg0OC00LjU1MzIyOC0xNC4yODgzNzItMTguODgyMDg0LTE0LjI4ODM3Mi0zMS45NzczNzcgMC0xMy4wOTc2NzQgNi40MDM1NzItMjAuMDMyMjk4IDE0LjI4ODM3Mi0xNS40NzkwN3pNNDQwLjM0ODU3NyA0MjEuOTk1MTYzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA2OS03Ljg4NDgtNC41NTMyMjgtMTQuMjg4MzcyLTE4Ljg4MjA4NC0xNC4yODgzNzItMzEuOTc3Mzc2IDAtMTMuMDk3Njc0IDYuNDAzNTcyLTIwLjAzMjI5OCAxNC4yODgzNzItMTUuNDc5MDd6IiBmaWxsPSIjRURFRUYwIiAvPjwvc3ZnPg==',
          width: 20,
          height: 20,
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
          text: '[#FFF]{title}',
          populateText: true
        });
        return am5.Bullet.new(root, {
          sprite: label
        });
      });

      let animatedLineSeries = chart.series.push(
        am5map.MapLineSeries.new(root, {})
      );
      animatedLineSeries.mapLines.template.setAll({
        stroke: am5.color(0x00ff00), // Green for secure connection
        strokeOpacity: 0.6,
        strokeWidth: 3,
        strokeDasharray: [5, 5]
      });

      let citySeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

      // visible city circles
      citySeries.bullets.push(function () {
        let image = am5.Picture.new(root, {
          src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KCjwhLS0gTGljZW5zZTogQ0MwIExpY2Vuc2UuIE1hZGUgYnkgU1ZHIFJlcG86IGh0dHBzOi8vd3d3LnN2Z3JlcG8uY29tL3N2Zy80NzQzOTQvc2VydmVyIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgY2xhc3M9Imljb24iICB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUyOS4wMjQ1OTUgMzcwLjM1MjIyM2MwLTcuNDQ2NjIzLTQuNTM0MTc3LTE2LjExMDE0LTEwLjExODU0OC0xOS4zMzQ1NDlMMjA4LjU2NzM2NyAxNzEuODQzODdDMTk5LjI2MDg3NCAxNjYuNDY5MDYgMTkxLjcwMjMyNiAxNzIuMTg0NDA5IDE5MS43MDIzMjYgMTg0LjU5Mzg2djY0Mi4xNjIzMDdjMCA5LjkyODAzNyA2LjA0NjM2MyAyMS40ODAxODYgMTMuNDkyOTg2IDI1Ljc4MDk4NmwyNzYuNjAzODMyIDE1OS42OTYzNzNjMjYuMDY0MzcyIDE1LjA0ODAzNyA0Ny4yMjU0NTEtMC45NDc3OTUgNDcuMjI1NDUxLTM1LjcwMTg3OVYzNzAuMzUyMjIzeiIgZmlsbD0iIzRFNkZCQiIgLz48cGF0aCBkPSJNODMxLjU1MjI5OCAxOTAuNTQ0OTY3YzAtNC42MDgtMi44MDUyODQtNi43Mjk4MjMtNi4yNjA2ODktNC43MzQyMTRsLTMwMC41ODY4NjUgMTczLjU0NDE4N2MtMy40NTU0MDUgMS45OTU2MDktNi4yNjMwNyA3LjM1NjEzLTYuMjYzMDcgMTEuOTY0MTN2NjE3LjAxOTUzNWMwIDI1LjM0NTE5MSAxNS40MzM4MjMgMzcuMDExNjQ3IDM0LjQ0MjEyMSAyNi4wMzU3OTVsMjcyLjQwNzgxNC0xNTcuMjcyMTEyYzMuNDU1NDA1LTEuOTk1NjA5IDYuMjYwNjg4LTcuMzU4NTEyIDYuMjYwNjg5LTExLjk2NjUxMVYxOTAuNTQ0OTY3eiIgZmlsbD0iIzRENkZCQiIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA5LjA4MjY0MmMtMTkuMDEzMDYtMTAuOTc4MjMzLTQ3LjgyMDgtMTIuMTcxMzEyLTY0LjI4ODE0OS0yLjY2NDc4MkwyMDQuNTE0MjMzIDE2My4xMTM2NzRjLTE2LjQ2NDk2NyA5LjUwNjUzLTE0LjM5NzkxNiAyNi4xMzgxOTUgNC42MTc1MjUgMzcuMTE2NDI4bDI3NS42MTMxNzIgMTU5LjEyNDgzOGMxOS4wMTMwNiAxMC45NzgyMzMgNDcuODIwOCAxMi4xNzM2OTMgNjQuMjg4MTQ5IDIuNjY0NzgxbDI3MS40MDUyNDctMTU2LjY5NTgxNGMxNi40NjczNDktOS41MDY1MyAxNC4zOTc5MTYtMjYuMTM4MTk1LTQuNjE1MTQ1LTM3LjExNjQyOEw1NDAuMjA3NjI4IDkuMDgyNjQyeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA2NjMuNjYxNTQ0Yy0xOS4wMTMwNi0xMC45NzgyMzMtNDcuODIwOC0xMi4xNzM2OTMtNjQuMjg4MTQ5LTIuNjY0NzgxTDIwNC41MTQyMzMgODE3LjY5MjU3N2MtMTYuNDY0OTY3IDkuNTA2NTMtMTQuMzk3OTE2IDI2LjEzODE5NSA0LjYxNzUyNSAzNy4xMTY0MjhsMjc1LjYxMzE3MiAxNTkuMTI0ODM3YzE5LjAxMzA2IDEwLjk3ODIzMyA0Ny44MjA4IDEyLjE3MzY5MyA2NC4yODgxNDkgMi42NjQ3ODFsMjcxLjQwNTI0Ny0xNTYuNjk1ODE0YzE2LjQ2NzM0OS05LjUwNjUzIDE0LjM5NzkxNi0yNi4xMzgxOTUtNC42MTUxNDUtMzcuMTE2NDI4bC0yNzUuNjE1NTUzLTE1OS4xMjQ4Mzd6IiBmaWxsPSIjNEQ2RkJCIiAvPjxwYXRoIGQ9Ik01MTMuMjUyNjE0IDUzMy4yMzk2NjVMMTkzLjQwMDI2IDM0OC41NzE5ODF2MzYuNDI1ODI0bDMxOS44NTIzNTQgMTg0LjY2NTMwMnYtMzYuNDIzNDQyek04MTUuNzgwMzE2IDM1OC41NzM4NDJsLTMwMi41Mjc3MDIgMTc0LjY2NTgyM3YzNi40MjM0NDJsMzAyLjUyNzcwMi0xNzQuNjYzNDQydi0zNi40MjU4MjN6IiBmaWxsPSIjNDQ2N0FFIiAvPjxwYXRoIGQ9Ik00NTQuNjM2OTQ5IDY1OS4xMDU5MzVjMC0yLjEzODQ5My0xLjMwMDI0Mi00LjYyNDY3LTIuOTAyOTIxLTUuNTUxMDMzbC0yMTAuODk4NzU0LTEyMS43NjA3NDRjLTEuNjAyNjc5LTAuOTI2MzYzLTIuOTA1MzAyIDAuMDU3MTUzLTIuOTA1MzAyIDIuMTk1NjQ3djY5LjcwMzQ0MmMwIDIuMTM2MTEyIDEuMzAyNjIzIDQuNjIyMjg4IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNWMxLjYwMjY3OSAwLjkyMzk4MSAyLjkwMjkyMS0wLjA1OTUzNSAyLjkwMjkyMS0yLjE5NTY0NnYtNjkuNzAzNDQyek00NTQuNjM2OTQ5IDgwOS4yNzY3MjZjMC0yLjEzNjExMi0xLjMwMDI0Mi00LjYyMjI4OC0yLjkwMjkyMS01LjU0ODY1MmwtMjEwLjg5ODc1NC0xMjEuNzYzMTI1Yy0xLjYwMjY3OS0wLjkyMzk4MS0yLjkwNTMwMiAwLjA1OTUzNS0yLjkwNTMwMiAyLjE5NTY0NnY2OS43MDM0NDJjMCAyLjEzODQ5MyAxLjMwMjYyMyA0LjYyNDY3IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNmMxLjYwMjY3OSAwLjkyNjM2MyAyLjkwMjkyMS0wLjA1NzE1MyAyLjkwMjkyMS0yLjE5NTY0N3YtNjkuNzAzNDQxeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNDQwLjM0ODU3NyAzNTUuMzE2MDkzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA3LTcuODg0OC00LjU1MzIyOC0xNC4yODgzNzItMTguODgyMDg0LTE0LjI4ODM3Mi0zMS45NzczNzcgMC0xMy4wOTc2NzQgNi40MDM1NzItMjAuMDMyMjk4IDE0LjI4ODM3Mi0xNS40NzkwN3pNNDQwLjM0ODU3NyA0MjEuOTk1MTYzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA2OS03Ljg4NDgtNC41NTMyMjgtMTQuMjg4MzcyLTE4Ljg4MjA4NC0xNC4yODgzNzItMzEuOTc3Mzc2IDAtMTMuMDk3Njc0IDYuNDAzNTcyLTIwLjAzMjI5OCAxNC4yODgzNzItMTUuNDc5MDd6IiBmaWxsPSIjRURFRUYwIiAvPjwvc3ZnPg==',
          width: 20,
          height: 20,
          centerX: am5.p50,
          centerY: am5.p50,
          cursorOverStyle: 'pointer'
        });
        return am5.Bullet.new(root, {
          sprite: image
        });
      });

      citySeries.bullets.push(function () {
        let label = am5.Label.new(root, {
          text: '[#FFF]{title}',
          populateText: true
        });
        return am5.Bullet.new(root, {
          sprite: label
        });
      });

      // Create secure data transfer icon (file with lock)
      let secureDataIcon = am5.Graphics.new(root, {
        svgPath:
          'M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M15.1,8H8.9V6A3.1,3.1 0 0,1 12,2.9A3.1,3.1 0 0,1 15.1,6V8Z',
        scale: 0.8,
        centerY: am5.p50,
        centerX: am5.p50,
        fill: am5.color(0x00ff00) // Green for secure
      });

      // Add a pulsing effect to show data transfer
      let pulseCircle = am5.Circle.new(root, {
        radius: 15,
        fill: am5.color(0x00ff00),
        fillOpacity: 0.3,
        stroke: am5.color(0x00ff00),
        strokeWidth: 2,
        strokeOpacity: 0.8
      });

      let animatedBulletSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {})
      );

      animatedBulletSeries.bullets.push(function () {
        let container = am5.Container.new(root, {});
        container.children.push(pulseCircle);
        container.children.push(secureDataIcon);
        return am5.Bullet.new(root, { sprite: container });
      });

      let cities = [
        {
          title: 'LoanConnect',
          id: 'loanConnect',
          geometry: { type: 'Point', coordinates: [79.1025, 22.74] }
        },
        {
          title: 'Credit Bureaus',
          id: 'credit',
          geometry: { type: 'Point', coordinates: [17.996632, -33.9126408] }
        },
        {
          title: 'Tax Authorities',
          id: 'tax',
          geometry: { type: 'Point', coordinates: [17.996632, -33.9126408] }
        },
        {
          title: 'SME Mock Bank',
          id: 'bank',
          geometry: { type: 'Point', coordinates: [17.996632, -33.9126408] }
        }
      ];

      citySeries.data.setAll(cities);
      animatedBulletSeries.setAll(cities);

      let destinations = ['bank'];

      // London coordinates
      let originLongitude = 79.1025;
      let originLatitude = 22.74;

      let londonDataItem = citySeries.getDataItemById('loanConnect');

      setTimeout(() => {
        londonDataItem.set("title", "Loan testing")
      }, 3000)
      let londonDataItem1 = animatedBulletSeries.getDataItemById('loanConnect');

      am5.array.each(destinations, function (did) {
        let destinationDataItem = citySeries.getDataItemById(did);
        let lineDataItem = lineSeries.pushDataItem({});
        lineDataItem.set('pointsToConnect', [
          destinationDataItem,
          londonDataItem
        ]);

        // let dataTransferSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
        // dataTransferSeries.bullets.push(function () {
        //     let container = am5.Container.new(root, {});
        //     container.children.push(pulseCircle);
        //     container.children.push(secureDataIcon);
        //     return am5.Bullet.new(root, { sprite: container });
        // });

        let startDataItem = animatedBulletSeries.pushDataItem({});
        startDataItem.setAll({
          lineDataItem: lineDataItem,
          positionOnLine: 0
        });

        let endDataItem = animatedBulletSeries.pushDataItem({});
        endDataItem.setAll({
          lineDataItem: lineDataItem,
          positionOnLine: 1
        });

        // let dataTransferItem = dataTransferSeries.pushDataItem({
        //     lineDataItem: lineDataItem,
        //     positionOnLine: 0,
        //     autoRotate: false
        // });
        // dataTransferItem.dataContext = {} as any;

        // dataTransferItem.animate({
        //     key: "positionOnLine",
        //     from: 0,
        //     to: 1,
        //     duration: 8000,
        //     easing: am5.ease.linear
        // });

        let lon0 = londonDataItem.get('longitude');
        let lat0 = londonDataItem.get('latitude');

        let lon1 = destinationDataItem.get('longitude');
        let lat1 = destinationDataItem.get('latitude');

        let distance = Math.hypot(lon1 - lon0, lat1 - lat0);
        let duration = distance * 100;

        animateEnd(endDataItem, startDataItem, duration);

        let animatedLineDataItem = animatedLineSeries.pushDataItem({});
        animatedLineDataItem.set('pointsToConnect', [
          startDataItem,
          endDataItem
        ]);
        
      });

      // let dataTransferSeriesNew = chart.series.push(am5map.MapPointSeries.new(root, {}));

      // dataTransferSeries.bullets.push(function () {
      //     let container = am5.Container.new(root, {});
      //     container.children.push(pulseCircle);
      //     container.children.push(secureDataIcon);
      //     return am5.Bullet.new(root, { sprite: container });
      // });

      // dataTransferSeriesNew.bullets.push(function () {
      //     let container = am5.Container.new(root, {});
      //     container.children.push(pulseCircle);
      //     container.children.push(secureDataIcon);
      //     return am5.Bullet.new(root, { sprite: container });
      // });

      // let dataTransferItem1 = dataTransferSeries.pushDataItem({
      //     lineDataItem: lineDataItem2,
      //     positionOnLine: 0,
      //     autoRotate: false
      // });
      // dataTransferItem1.dataContext = {} as any;

      // let dataTransferItem2 = dataTransferSeriesNew.pushDataItem({
      //     lineDataItem: lineDataItem1,
      //     positionOnLine: 0,
      //     autoRotate: false
      // });
      // dataTransferItem2.dataContext = {} as any;

      // dataTransferItem2.animate({
      //     key: "positionOnLine",
      //     from: 0,
      //     to: 1,
      //     duration: 8000,
      //     easing: am5.ease.linear
      // });

      // // Animate the data transfer
      // let startAnimation1 = dataTransferItem1.animate({
      //     key: "positionOnLine",
      //     from: 0,
      //     to: 1,
      //     duration: 8000,
      //     easing: am5.ease.linear
      // });

      // dataTransferItem2.animate({
      //     key: "positionOnLine",
      //     from: 0,
      //     to: 1,
      //     duration: 8000,
      //     easing: am5.ease.linear
      // });

      // dataTransferItem3.animate({
      //     key: "positionOnLine",
      //     from: 0,
      //     to: 1,
      //     duration: 8000,
      //     easing: am5.ease.linear
      // });

      // Add pulsing animation for the security indicator
      pulseCircle.animate({
        key: 'radius',
        to: 25,
        duration: 2000,
        loops: Infinity,
        easing: am5.ease.yoyo(am5.ease.linear)
      });

      pulseCircle.animate({
        key: 'fillOpacity',
        to: 0.1,
        duration: 2000,
        loops: Infinity,
        easing: am5.ease.yoyo(am5.ease.linear)
      });

      // Calculate bounding box for the point series to set initial zoom
      zoomToPoints(polygonSeries, chart);

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
      animateEnd(endDataItem, startDataItem, duration);
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
      title: title
    });
  }

  function addImage(title: string): any {
    let image = am5.Picture.new(rootRef.current, {
      src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KCjwhLS0gTGljZW5zZTogQ0MwIExpY2Vuc2UuIE1hZGUgYnkgU1ZHIFJlcG86IGh0dHBzOi8vd3d3LnN2Z3JlcG8uY29tL3N2Zy80NzQzOTQvc2VydmVyIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgY2xhc3M9Imljb24iICB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTUyOS4wMjQ1OTUgMzcwLjM1MjIyM2MwLTcuNDQ2NjIzLTQuNTM0MTc3LTE2LjExMDE0LTEwLjExODU0OC0xOS4zMzQ1NDlMMjA4LjU2NzM2NyAxNzEuODQzODdDMTk5LjI2MDg3NCAxNjYuNDY5MDYgMTkxLjcwMjMyNiAxNzIuMTg0NDA5IDE5MS43MDIzMjYgMTg0LjU5Mzg2djY0Mi4xNjIzMDdjMCA5LjkyODAzNyA2LjA0NjM2MyAyMS40ODAxODYgMTMuNDkyOTg2IDI1Ljc4MDk4NmwyNzYuNjAzODMyIDE1OS42OTYzNzNjMjYuMDY0MzcyIDE1LjA0ODAzNyA0Ny4yMjU0NTEtMC45NDc3OTUgNDcuMjI1NDUxLTM1LjcwMTg3OVYzNzAuMzUyMjIzeiIgZmlsbD0iIzRFNkZCQiIgLz48cGF0aCBkPSJNODMxLjU1MjI5OCAxOTAuNTQ0OTY3YzAtNC42MDgtMi44MDUyODQtNi43Mjk4MjMtNi4yNjA2ODktNC43MzQyMTRsLTMwMC41ODY4NjUgMTczLjU0NDE4N2MtMy40NTU0MDUgMS45OTU2MDktNi4yNjMwNyA3LjM1NjEzLTYuMjYzMDcgMTEuOTY0MTN2NjE3LjAxOTUzNWMwIDI1LjM0NTE5MSAxNS40MzM4MjMgMzcuMDExNjQ3IDM0LjQ0MjEyMSAyNi4wMzU3OTVsMjcyLjQwNzgxNC0xNTcuMjcyMTEyYzMuNDU1NDA1LTEuOTk1NjA5IDYuMjYwNjg4LTcuMzU4NTEyIDYuMjYwNjg5LTExLjk2NjUxMVYxOTAuNTQ0OTY3eiIgZmlsbD0iIzRENkZCQiIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA5LjA4MjY0MmMtMTkuMDEzMDYtMTAuOTc4MjMzLTQ3LjgyMDgtMTIuMTcxMzEyLTY0LjI4ODE0OS0yLjY2NDc4MkwyMDQuNTE0MjMzIDE2My4xMTM2NzRjLTE2LjQ2NDk2NyA5LjUwNjUzLTE0LjM5NzkxNiAyNi4xMzgxOTUgNC42MTc1MjUgMzcuMTE2NDI4bDI3NS42MTMxNzIgMTU5LjEyNDgzOGMxOS4wMTMwNiAxMC45NzgyMzMgNDcuODIwOCAxMi4xNzM2OTMgNjQuMjg4MTQ5IDIuNjY0NzgxbDI3MS40MDUyNDctMTU2LjY5NTgxNGMxNi40NjczNDktOS41MDY1MyAxNC4zOTc5MTYtMjYuMTM4MTk1LTQuNjE1MTQ1LTM3LjExNjQyOEw1NDAuMjA3NjI4IDkuMDgyNjQyeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNTQwLjIwNzYyOCA2NjMuNjYxNTQ0Yy0xOS4wMTMwNi0xMC45NzgyMzMtNDcuODIwOC0xMi4xNzM2OTMtNjQuMjg4MTQ5LTIuNjY0NzgxTDIwNC41MTQyMzMgODE3LjY5MjU3N2MtMTYuNDY0OTY3IDkuNTA2NTMtMTQuMzk3OTE2IDI2LjEzODE5NSA0LjYxNzUyNSAzNy4xMTY0MjhsMjc1LjYxMzE3MiAxNTkuMTI0ODM3YzE5LjAxMzA2IDEwLjk3ODIzMyA0Ny44MjA4IDEyLjE3MzY5MyA2NC4yODgxNDkgMi42NjQ3ODFsMjcxLjQwNTI0Ny0xNTYuNjk1ODE0YzE2LjQ2NzM0OS05LjUwNjUzIDE0LjM5NzkxNi0yNi4xMzgxOTUtNC42MTUxNDUtMzcuMTE2NDI4bC0yNzUuNjE1NTUzLTE1OS4xMjQ4Mzd6IiBmaWxsPSIjNEQ2RkJCIiAvPjxwYXRoIGQ9Ik01MTMuMjUyNjE0IDUzMy4yMzk2NjVMMTkzLjQwMDI2IDM0OC41NzE5ODF2MzYuNDI1ODI0bDMxOS44NTIzNTQgMTg0LjY2NTMwMnYtMzYuNDIzNDQyek04MTUuNzgwMzE2IDM1OC41NzM4NDJsLTMwMi41Mjc3MDIgMTc0LjY2NTgyM3YzNi40MjM0NDJsMzAyLjUyNzcwMi0xNzQuNjYzNDQydi0zNi40MjU4MjN6IiBmaWxsPSIjNDQ2N0FFIiAvPjxwYXRoIGQ9Ik00NTQuNjM2OTQ5IDY1OS4xMDU5MzVjMC0yLjEzODQ5My0xLjMwMDI0Mi00LjYyNDY3LTIuOTAyOTIxLTUuNTUxMDMzbC0yMTAuODk4NzU0LTEyMS43NjA3NDRjLTEuNjAyNjc5LTAuOTI2MzYzLTIuOTA1MzAyIDAuMDU3MTUzLTIuOTA1MzAyIDIuMTk1NjQ3djY5LjcwMzQ0MmMwIDIuMTM2MTEyIDEuMzAyNjIzIDQuNjIyMjg4IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNWMxLjYwMjY3OSAwLjkyMzk4MSAyLjkwMjkyMS0wLjA1OTUzNSAyLjkwMjkyMS0yLjE5NTY0NnYtNjkuNzAzNDQyek00NTQuNjM2OTQ5IDgwOS4yNzY3MjZjMC0yLjEzNjExMi0xLjMwMDI0Mi00LjYyMjI4OC0yLjkwMjkyMS01LjU0ODY1MmwtMjEwLjg5ODc1NC0xMjEuNzYzMTI1Yy0xLjYwMjY3OS0wLjkyMzk4MS0yLjkwNTMwMiAwLjA1OTUzNS0yLjkwNTMwMiAyLjE5NTY0NnY2OS43MDM0NDJjMCAyLjEzODQ5MyAxLjMwMjYyMyA0LjYyNDY3IDIuOTA1MzAyIDUuNTQ4NjUxbDIxMC44OTg3NTQgMTIxLjc2MzEyNmMxLjYwMjY3OSAwLjkyNjM2MyAyLjkwMjkyMS0wLjA1NzE1MyAyLjkwMjkyMS0yLjE5NTY0N3YtNjkuNzAzNDQxeiIgZmlsbD0iIzZEOEFDQSIgLz48cGF0aCBkPSJNNDQwLjM0ODU3NyAzNTUuMzE2MDkzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA3LTcuODg0OC00LjU1MzIyOC0xNC4yODgzNzItMTguODgyMDg0LTE0LjI4ODM3Mi0zMS45NzczNzcgMC0xMy4wOTc2NzQgNi40MDM1NzItMjAuMDMyMjk4IDE0LjI4ODM3Mi0xNS40NzkwN3pNNDQwLjM0ODU3NyA0MjEuOTk1MTYzYzcuODg3MTgxIDQuNTUwODQ3IDE0LjI4ODM3MiAxOC44Nzk3MDIgMTQuMjg4MzcyIDMxLjk3NzM3NyAwIDEzLjA5NTI5My02LjQwMTE5MSAyMC4wMzIyOTgtMTQuMjg4MzcyIDE1LjQ3OTA2OS03Ljg4NDgtNC41NTMyMjgtMTQuMjg4MzcyLTE4Ljg4MjA4NC0xNC4yODgzNzItMzEuOTc3Mzc2IDAtMTMuMDk3Njc0IDYuNDAzNTcyLTIwLjAzMjI5OCAxNC4yODgzNzItMTUuNDc5MDd6IiBmaWxsPSIjRURFRUYwIiAvPjwvc3ZnPg==',
      width: 50,
      height: 50,
      centerX: am5.p50,
      centerY: am5.p50,
      tooltipText: title,
      cursorOverStyle: 'pointer',
      tooltipY: 0
    });

    return image;
  }

  const zoomToPoints = (polygonSeries: any, chart: any) => {
    const points = [
      { latitude: -30.567, longitude: 22.9375 },
      { latitude: 22.2105, longitude: 79.1025 }
    ];

    const latitudes = points.map((p) => p.latitude);
    const longitudes = points.map((p) => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Add some padding around the points
    const latPadding = (maxLat - minLat) * 0.2;
    const lngPadding = (maxLng - minLng) * 0.2;

    const bounds = {
      north: maxLat + latPadding,
      south: minLat - latPadding,
      east: maxLng + lngPadding,
      west: minLng - lngPadding
    };

    polygonSeries.events.on('datavalidated', function () {
      chart.zoomToGeoPoint(
        {
          longitude: (bounds.east + bounds.west) / 2,
          latitude: (bounds.north + bounds.south) / 2
        },
        4
      );
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

export default DataShareMap;
