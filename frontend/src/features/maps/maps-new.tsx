// SME onboarding
// Select country
// Select Bank

// Consent

'use client';
/* Imports */
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import React, { useLayoutEffect, useRef, forwardRef, useState } from 'react';
import CountrySearch from './country-search';
import { Card, CardContent } from '@/components/ui/card';

interface NewMapProps {
  chartID: string;
  getSelectedCountry: (value: string) => void;
}

interface NewMapRef {
  zoomToCountry: (countryCode: string) => void;
}

const NewMap = forwardRef<NewMapRef, NewMapProps>(
  ({ chartID, getSelectedCountry }, ref) => {
    const rootRef = useRef<any>(null);

    const [polygonSeries, setPolygonSeries] = useState<any>(null);
    const [pointSeries, setPointSeries] = useState<any>(null);

    useLayoutEffect(() => {
      const root = am5.Root.new(chartID);
      rootRef.current = root;
      let { polygons, points } = initMap();
      setPolygonSeries(polygons);
      setPointSeries(points);

      return () => {
        root.dispose();
      };
    }, [chartID]);

    const initMap = (): { polygons: any; points: any } => {
      // Set themes
      // https://www.amcharts.com/docs/v5/concepts/themes/
      if (rootRef.current) {
        let root = rootRef.current;
        rootRef.current.setThemes([am5themes_Animated.new(rootRef.current)]);

        // Create the map chart
        // https://www.amcharts.com/docs/v5/charts/map-chart/
        let chart = rootRef.current.container.children.push(
          am5map.MapChart.new(rootRef.current, {
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
          am5map.MapPolygonSeries.new(rootRef.current, {
            geoJSON: am5geodata_worldLow,
            exclude: ['AQ']
          })
        );

        polygonSeries.mapPolygons.template.setAll({
          tooltipText: '{name}',
          toggleKey: 'active',
          interactive: true
        });

        polygonSeries.mapPolygons.template.states.create('hover', {
          fill: rootRef.current.interfaceColors.get('primaryButtonHover')
        });

        polygonSeries.mapPolygons.template.states.create('active', {
          fill: rootRef.current.interfaceColors.get('primaryButtonHover')
        });

        let pointSeries = chart.series.push(
          am5map.MapPointSeries.new(rootRef.current, {})
        );

        // let previousPolygon: any;

        // polygonSeries.mapPolygons.template.on("active", function (active: boolean, target: any) {
        //   if (previousPolygon && previousPolygon != target) {
        //     previousPolygon.set("active", false);
        //   }
        //   if (target?.get("active")) {
        //     polygonSeries.zoomToDataItem(target?.dataItem as any);
        //     target.
        //     addPoints(pointSeries);
        //   }
        //   else {
        //     chart.goHome();
        //     previousPolygon.set("active", false);
        //     removePoints(pointSeries);
        //   }
        //   previousPolygon = target;
        // });

        // Add zoom control
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-pan-zoom/#Zoom_control
        // let zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(rootRef.current, {}));
        // zoomControl.homeButton.set("visible", true);

        // Set clicking on "water" to zoom out
        // chart.chartContainer?.get("background")?.events.on("click", function () {
        //   chart.goHome();
        //   removePoints(pointSeries);
        // })
        chart.appear(1000, 100);

        return { polygons: polygonSeries, points: pointSeries };
      } else {
        return { polygons: null, points: null };
      }
    };

    const addPoints = (pointSeries: any, data: any) => {
      pointSeries.bullets.push(function () {
        let picture = am5.Picture.new(rootRef.current, {
          src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBMaWNlbnNlOiBNSVQuIE1hZGUgYnkgVHdpdHRlcjogaHR0cHM6Ly9naXRodWIuY29tL3R3aXR0ZXIvdHdlbW9qaSAtLT4KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAzNiAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgYXJpYS1oaWRkZW49InRydWUiIHJvbGU9ImltZyIgY2xhc3M9Imljb25pZnkgaWNvbmlmeS0tdHdlbW9qaSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+PHBhdGggZmlsbD0iIzY2NzU3RiIgZD0iTTMgMTZoMzB2MThIM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjQ0NENkREIiBkPSJNMiAzNGgzMmEyIDIgMCAwIDEgMiAySDBhMiAyIDAgMCAxIDItMnoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMjkyRjMzIiBkPSJNMTggMjNhMyAzIDAgMCAwLTMgM3Y2aDZ2LTZhMyAzIDAgMCAwLTMtM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjQ0NENkREIiBkPSJNMyAyMWg0djExSDN6bTYgMGg0djExSDl6bTIwIDBoNHYxMWgtNHptLTYgMGg0djExaC00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNBQUI4QzIiIGQ9Ik0yIDMyaDMydjJIMnoiPjwvcGF0aD48cGF0aCBmaWxsPSIjNjY3NTdGIiBkPSJNMzYgMTFMMTggMEwwIDExeiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNDQ0Q2REQiIGQ9Ik0xOCAyLjRMMiAxMnY0aDMydi00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiM4ODk5QTYiIGQ9Ik0zIDE5aDR2Mkgzem02IDBoNHYySDl6bTE0IDBoNHYyaC00em02IDBoNHYyaC00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNDQ0Q2REQiIGQ9Ik0xIDEyaDM0djVIMXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjQUFCOEMyIiBkPSJNMzYgMTJhMSAxIDAgMCAxLTEgMUgxYTEgMSAwIDAgMS0xLTF2LTFhMSAxIDAgMCAxIDEtMWgzNGExIDEgMCAwIDEgMSAxdjF6bTAgNmExIDEgMCAwIDEtMSAxSDFhMSAxIDAgMCAxLTEtMXYtMWExIDEgMCAwIDEgMS0xaDM0YTEgMSAwIDAgMSAxIDF2MXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjRTFFOEVEIiBkPSJNMTMgMzJoMTB2MkgxM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjRjVGOEZBIiBkPSJNMTEgMzRoMTR2MkgxMXoiPjwvcGF0aD48L3N2Zz4=',
          width: 30,
          height: 30,
          centerX: am5.p50,
          centerY: am5.p50,
          cursorOverStyle: 'pointer'
        });

        picture.events.on('click', function (ev: any) {
          // Draw a border around the picture
          ev.target.set('stroke', am5.color('#000'));
          ev.target.set('strokeWidth', 2);
          setTimeout(function () {
            ev.target.set('stroke', am5.color('#FFF'));
            ev.target.set('strokeWidth', 0);
          }, 1000);
          // alert("Clicked on " + ev.target.dataItem.dataContext.name)
        });

        return am5.Bullet.new(rootRef.current, {
          sprite: picture
        });
      });

      pointSeries.bullets.push(function () {
        return am5.Bullet.new(rootRef.current, {
          sprite: am5.Label.new(rootRef.current, {
            templateField: 'labelSettings',
            centerX: am5.p50,
            dy: 10,
            fill: am5.color('#FFF')
          })
        });
      });

      pointSeries.data.setAll(
        data.map((item: any) => ({
          geometry: { type: 'Point', coordinates: item.coordinates },
          pictureSettings: {
            src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBMaWNlbnNlOiBNSVQuIE1hZGUgYnkgVHdpdHRlcjogaHR0cHM6Ly9naXRodWIuY29tL3R3aXR0ZXIvdHdlbW9qaSAtLT4KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAzNiAzNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgYXJpYS1oaWRkZW49InRydWUiIHJvbGU9ImltZyIgY2xhc3M9Imljb25pZnkgaWNvbmlmeS0tdHdlbW9qaSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+PHBhdGggZmlsbD0iIzY2NzU3RiIgZD0iTTMgMTZoMzB2MThIM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjQ0NENkREIiBkPSJNMiAzNGgzMmEyIDIgMCAwIDEgMiAySDBhMiAyIDAgMCAxIDItMnoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMjkyRjMzIiBkPSJNMTggMjNhMyAzIDAgMCAwLTMgM3Y2aDZ2LTZhMyAzIDAgMCAwLTMtM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjQ0NENkREIiBkPSJNMyAyMWg0djExSDN6bTYgMGg0djExSDl6bTIwIDBoNHYxMWgtNHptLTYgMGg0djExaC00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNBQUI4QzIiIGQ9Ik0yIDMyaDMydjJIMnoiPjwvcGF0aD48cGF0aCBmaWxsPSIjNjY3NTdGIiBkPSJNMzYgMTFMMTggMEwwIDExeiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNDQ0Q2REQiIGQ9Ik0xOCAyLjRMMiAxMnY0aDMydi00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiM4ODk5QTYiIGQ9Ik0zIDE5aDR2Mkgzem02IDBoNHYySDl6bTE0IDBoNHYyaC00em02IDBoNHYyaC00eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNDQ0Q2REQiIGQ9Ik0xIDEyaDM0djVIMXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjQUFCOEMyIiBkPSJNMzYgMTJhMSAxIDAgMCAxLTEgMUgxYTEgMSAwIDAgMS0xLTF2LTFhMSAxIDAgMCAxIDEtMWgzNGExIDEgMCAwIDEgMSAxdjF6bTAgNmExIDEgMCAwIDEtMSAxSDFhMSAxIDAgMCAxLTEtMXYtMWExIDEgMCAwIDEgMS0xaDM0YTEgMSAwIDAgMSAxIDF2MXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjRTFFOEVEIiBkPSJNMTMgMzJoMTB2MkgxM3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjRjVGOEZBIiBkPSJNMTEgMzRoMTR2MkgxMXoiPjwvcGF0aD48L3N2Zz4=',
            width: 30,
            height: 30,
            centerX: am5.p50,
            centerY: am5.p50,
            cursorOverStyle: 'pointer',
            onclick: function (ev: any) {
              alert('Clicked on ' + ev.target.dataItem.dataContext.name);
            }
          },
          labelSettings: {
            text: item.name
          }
        }))
      );
    };

    // const removePoints = (pointSeries: any) => {
    //   pointSeries.bullets.clear();
    //   pointSeries.data.clear();
    // }

    let countryBanks: any = {
      India: [
        {
          name: 'ICICI Bank',
          coordinates: [72.8777, 19.076]
        },
        {
          name: 'HDFC Bank',
          coordinates: [77.1025, 28.7041]
        },
        {
          name: 'Axis Bank',
          coordinates: [80.2707, 13.0827]
        }
      ],
      'South Africa': [
        {
          name: 'SA Mock Bank 1',
          coordinates: [30.9085504, -29.868299]
        },
        {
          name: 'SA Mock Bank 2',
          coordinates: [28.0331386, -25.7582479]
        },
        {
          name: 'SA Mock Bank 3',
          coordinates: [17.996632, -33.9126408]
        }
      ],
      Singapore: [
        {
          name: 'SG Mock Bank 1',
          coordinates: [103.8198, 1.3521]
        }
      ]
    };

    return (
      <div className='flex w-full flex-col gap-4'>
        <CountrySearch
          onCountrySelect={(countryCode, countryName) => {
            if (polygonSeries) {
              const dataItem = polygonSeries.dataItems.find(
                (item: any) => item.dataContext?.id === countryCode
              );
              if (dataItem) {
                polygonSeries.zoomToDataItem(dataItem);
                let target = dataItem.get('mapPolygon');
                target.set('active', true);
                target.showTooltip();
                addPoints(pointSeries, countryBanks[countryName]);
              }
              getSelectedCountry(countryName);
            }
          }}
        />
        <Card>
          <CardContent>
            <div id={chartID} style={{ height: '500px', width: '100%' }}></div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

NewMap.displayName = 'NewMap';

export default NewMap;
