'use client';
import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Graticule,
  Sphere
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';

import {
  Shield,
  Lock,
  CheckCircle,
  Package,
  Send,
  ArrowRight,
  Clock,
  Zap,
  Search,
  MapPin
} from 'lucide-react';
import { geoCylindricalStereographic } from 'd3-geo-projection';
import { Tooltip } from 'react-tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Coordinates for Mumbai, India and London, UK
const ORIGIN = { name: 'Mumbai', coords: [72.8777, 19.076] };
const DEST = { name: 'London', coords: [-0.1276, 51.5072] };

const geoUrl =
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries-sans-antarctica.json';

const SCENES = ['setup', 'collect', 'encrypt', 'tunnel'];

// Country data extracted from features.json
const COUNTRIES = [
  { id: 'AFG', name: 'Afghanistan', coords: [67.709953, 33.93911] },
  { id: 'AGO', name: 'Angola', coords: [17.873887, -11.202692] },
  { id: 'ALB', name: 'Albania', coords: [20.168331, 41.153332] },
  { id: 'ARE', name: 'United Arab Emirates', coords: [53.847818, 23.424076] },
  { id: 'ARG', name: 'Argentina', coords: [-63.616672, -38.416097] },
  { id: 'ARM', name: 'Armenia', coords: [45.038189, 40.069099] },
  { id: 'AUS', name: 'Australia', coords: [133.775136, -25.274398] },
  { id: 'AUT', name: 'Austria', coords: [14.550072, 47.516231] },
  { id: 'AZE', name: 'Azerbaijan', coords: [47.576927, 40.069099] },
  { id: 'BDI', name: 'Burundi', coords: [29.918886, -3.373056] },
  { id: 'BEL', name: 'Belgium', coords: [4.469936, 50.503887] },
  { id: 'BEN', name: 'Benin', coords: [2.315834, 9.30769] },
  { id: 'BFA', name: 'Burkina Faso', coords: [-2.197568, 12.238333] },
  { id: 'BGD', name: 'Bangladesh', coords: [90.356331, 23.684994] },
  { id: 'BGR', name: 'Bulgaria', coords: [25.48583, 42.733883] },
  { id: 'BHS', name: 'Bahamas', coords: [-77.39628, 25.03428] },
  { id: 'BIH', name: 'Bosnia and Herzegovina', coords: [17.679076, 43.915886] },
  { id: 'BLR', name: 'Belarus', coords: [27.953389, 53.709807] },
  { id: 'BLZ', name: 'Belize', coords: [-88.49765, 17.189877] },
  { id: 'BOL', name: 'Bolivia', coords: [-63.588653, -16.290154] },
  { id: 'BRA', name: 'Brazil', coords: [-51.92528, -14.235004] },
  { id: 'BRN', name: 'Brunei', coords: [114.727669, 4.535277] },
  { id: 'BTN', name: 'Bhutan', coords: [90.433601, 27.514162] },
  { id: 'BWA', name: 'Botswana', coords: [24.684866, -22.328474] },
  {
    id: 'CAF',
    name: 'Central African Republic',
    coords: [20.939444, 6.611111]
  },
  { id: 'CAN', name: 'Canada', coords: [-106.346771, 56.130366] },
  { id: 'CHE', name: 'Switzerland', coords: [8.227512, 46.818188] },
  { id: 'CHL', name: 'Chile', coords: [-71.542969, -35.675147] },
  { id: 'CHN', name: 'China', coords: [104.195397, 35.86166] },
  { id: 'CIV', name: "Cote d'Ivoire", coords: [-5.54708, 7.539989] },
  { id: 'CMR', name: 'Cameroon', coords: [12.354722, 7.369722] },
  {
    id: 'COD',
    name: 'Democratic Republic of Congo',
    coords: [21.758664, -4.038333]
  },
  { id: 'COG', name: 'Congo', coords: [21.758664, -0.228021] },
  { id: 'COL', name: 'Colombia', coords: [-74.297333, 4.570868] },
  { id: 'CRI', name: 'Costa Rica', coords: [-83.753428, 9.748917] },
  { id: 'CUB', name: 'Cuba', coords: [-77.781167, 21.521757] },
  { id: 'CYP', name: 'Cyprus', coords: [33.429859, 35.126413] },
  { id: 'CZE', name: 'Czechia', coords: [15.472962, 49.817492] },
  { id: 'DEU', name: 'Germany', coords: [10.451526, 51.165691] },
  { id: 'DJI', name: 'Djibouti', coords: [42.590275, 11.825138] },
  { id: 'DNK', name: 'Denmark', coords: [9.501785, 56.26392] },
  { id: 'DOM', name: 'Dominican Republic', coords: [-70.162651, 18.735693] },
  { id: 'DZA', name: 'Algeria', coords: [1.659626, 28.033886] },
  { id: 'ECU', name: 'Ecuador', coords: [-78.183406, -1.831239] },
  { id: 'EGY', name: 'Egypt', coords: [30.802498, 26.097736] },
  { id: 'ERI', name: 'Eritrea', coords: [39.782334, 15.179384] },
  { id: 'ESP', name: 'Spain', coords: [-3.74922, 40.463667] },
  { id: 'EST', name: 'Estonia', coords: [25.013607, 58.595272] },
  { id: 'ETH', name: 'Ethiopia', coords: [40.489673, 9.145] },
  { id: 'FIN', name: 'Finland', coords: [25.748151, 61.92411] },
  { id: 'FJI', name: 'Fiji', coords: [-1.431947, -16.578971] },
  { id: 'FRA', name: 'France', coords: [2.213749, 46.227638] },
  { id: 'GAB', name: 'Gabon', coords: [11.609444, -0.803689] },
  { id: 'GBR', name: 'United Kingdom', coords: [-3.435973, 55.378051] },
  { id: 'GEO', name: 'Georgia', coords: [43.356892, 42.315407] },
  { id: 'GHA', name: 'Ghana', coords: [-1.023194, 7.946527] },
  { id: 'GIN', name: 'Guinea', coords: [-9.696645, 9.641185] },
  { id: 'GMB', name: 'Gambia', coords: [-15.310139, 13.443182] },
  { id: 'GNB', name: 'Guinea-Bissau', coords: [-15.180413, 11.803749] },
  { id: 'GNQ', name: 'Equatorial Guinea', coords: [10.267895, 1.650801] },
  { id: 'GRC', name: 'Greece', coords: [21.824312, 39.074208] },
  { id: 'GTM', name: 'Guatemala', coords: [-90.230759, 15.783471] },
  { id: 'GUY', name: 'Guyana', coords: [-58.93018, 4.860416] },
  { id: 'HND', name: 'Honduras', coords: [-87.173425, 15.199999] },
  { id: 'HRV', name: 'Croatia', coords: [15.2, 45.1] },
  { id: 'HTI', name: 'Haiti', coords: [-72.285215, 18.971187] },
  { id: 'HUN', name: 'Hungary', coords: [19.503304, 47.162494] },
  { id: 'IDN', name: 'Indonesia', coords: [113.921327, -0.789275] },
  { id: 'IND', name: 'India', coords: [78.96288, 20.593684] },
  { id: 'IRL', name: 'Ireland', coords: [-8.24389, 53.41291] },
  { id: 'IRN', name: 'Iran', coords: [53.688046, 32.427908] },
  { id: 'IRQ', name: 'Iraq', coords: [43.679291, 33.223191] },
  { id: 'ISL', name: 'Iceland', coords: [-19.020835, 64.963051] },
  { id: 'ISR', name: 'Israel', coords: [34.851612, 31.046051] },
  { id: 'ITA', name: 'Italy', coords: [12.56738, 41.87194] },
  { id: 'JAM', name: 'Jamaica', coords: [-77.297508, 18.109581] },
  { id: 'JOR', name: 'Jordan', coords: [36.238414, 30.585164] },
  { id: 'JPN', name: 'Japan', coords: [138.252924, 36.204824] },
  { id: 'KAZ', name: 'Kazakhstan', coords: [66.923684, 48.019573] },
  { id: 'KEN', name: 'Kenya', coords: [37.906193, -0.023559] },
  { id: 'KGZ', name: 'Kyrgyzstan', coords: [74.766098, 41.20438] },
  { id: 'KHM', name: 'Cambodia', coords: [104.990963, 12.565679] },
  { id: 'KOR', name: 'South Korea', coords: [127.766922, 35.907757] },
  { id: 'KWT', name: 'Kuwait', coords: [47.481766, 29.31166] },
  { id: 'LAO', name: 'Laos', coords: [102.495496, 19.85627] },
  { id: 'LBN', name: 'Lebanon', coords: [35.862285, 33.854721] },
  { id: 'LBR', name: 'Liberia', coords: [-9.429499, 6.428055] },
  { id: 'LBY', name: 'Libya', coords: [17.228331, 26.3351] },
  { id: 'LCA', name: 'Saint Lucia', coords: [-60.978893, 13.909444] },
  { id: 'LKA', name: 'Sri Lanka', coords: [80.771797, 7.873054] },
  { id: 'LSO', name: 'Lesotho', coords: [28.233608, -29.610009] },
  { id: 'LTU', name: 'Lithuania', coords: [23.881275, 55.169438] },
  { id: 'LUX', name: 'Luxembourg', coords: [6.129583, 49.815273] },
  { id: 'LVA', name: 'Latvia', coords: [24.603189, 56.879635] },
  { id: 'MAR', name: 'Morocco', coords: [-7.09262, 31.629472] },
  { id: 'MDA', name: 'Moldova', coords: [28.369885, 47.411631] },
  { id: 'MDG', name: 'Madagascar', coords: [46.869107, -18.766947] },
  { id: 'MEX', name: 'Mexico', coords: [-102.552784, 23.634501] },
  { id: 'MKD', name: 'Macedonia', coords: [21.745275, 41.608635] },
  { id: 'MLI', name: 'Mali', coords: [-3.996166, 17.570692] },
  { id: 'MMR', name: 'Myanmar', coords: [95.956223, 21.913965] },
  { id: 'MNE', name: 'Montenegro', coords: [19.37439, 42.708678] },
  { id: 'MNG', name: 'Mongolia', coords: [103.846656, 46.862496] },
  { id: 'MOZ', name: 'Mozambique', coords: [35.529562, -18.665695] },
  { id: 'MRT', name: 'Mauritania', coords: [-10.940835, 21.00789] },
  { id: 'MWI', name: 'Malawi', coords: [34.301525, -13.254308] },
  { id: 'MYS', name: 'Malaysia', coords: [101.975766, 4.210484] },
  { id: 'NAM', name: 'Namibia', coords: [18.49041, -22.95764] },
  { id: 'NER', name: 'Niger', coords: [8.081666, 17.607789] },
  { id: 'NGA', name: 'Nigeria', coords: [8.675277, 9.081999] },
  { id: 'NIC', name: 'Nicaragua', coords: [-85.207229, 12.865416] },
  { id: 'NLD', name: 'Netherlands', coords: [5.291266, 52.132633] },
  { id: 'NOR', name: 'Norway', coords: [8.468946, 60.472024] },
  { id: 'NPL', name: 'Nepal', coords: [84.124008, 28.394857] },
  { id: 'NZL', name: 'New Zealand', coords: [174.885971, -40.900557] },
  { id: 'OMN', name: 'Oman', coords: [55.923255, 21.512583] },
  { id: 'PAK', name: 'Pakistan', coords: [69.345116, 30.375321] },
  { id: 'PAN', name: 'Panama', coords: [-80.782127, 8.537981] },
  { id: 'PER', name: 'Peru', coords: [-75.015152, -9.189967] },
  { id: 'PHL', name: 'Philippines', coords: [121.774017, 12.879721] },
  { id: 'PNG', name: 'Papua New Guinea', coords: [143.95555, -6.314993] },
  { id: 'POL', name: 'Poland', coords: [19.134856, 51.919438] },
  { id: 'PRK', name: 'North Korea', coords: [127.510093, 40.339852] },
  { id: 'PRT', name: 'Portugal', coords: [-8.224454, 39.399872] },
  { id: 'PRY', name: 'Paraguay', coords: [-58.443832, -23.442503] },
  { id: 'QAT', name: 'Qatar', coords: [51.183884, 25.354826] },
  { id: 'ROU', name: 'Romania', coords: [24.96676, 45.943161] },
  { id: 'RUS', name: 'Russia', coords: [105.318756, 61.52401] },
  { id: 'RWA', name: 'Rwanda', coords: [29.873888, -1.940278] },
  { id: 'SAU', name: 'Saudi Arabia', coords: [45.079162, 23.885942] },
  { id: 'SDN', name: 'Sudan', coords: [30.217636, 12.862807] },
  { id: 'SEN', name: 'Senegal', coords: [-14.452362, 14.497401] },
  { id: 'SGP', name: 'Singapore', coords: [103.819836, 1.352083] },
  { id: 'SLB', name: 'Solomon Islands', coords: [160.156194, -9.64571] },
  { id: 'SLE', name: 'Sierra Leone', coords: [-11.779889, 8.460555] },
  { id: 'SLV', name: 'El Salvador', coords: [-88.89653, 13.794185] },
  { id: 'SOM', name: 'Somalia', coords: [46.199616, 5.152149] },
  { id: 'SRB', name: 'Serbia', coords: [21.005859, 44.016521] },
  { id: 'STP', name: 'Sao Tome and Principe', coords: [6.613081, 0.18636] },
  { id: 'SUR', name: 'Suriname', coords: [-56.027783, 3.919305] },
  { id: 'SVK', name: 'Slovakia', coords: [19.699024, 48.669026] },
  { id: 'SVN', name: 'Slovenia', coords: [14.995463, 46.151241] },
  { id: 'SWE', name: 'Sweden', coords: [18.643501, 60.128161] },
  { id: 'SWZ', name: 'Swaziland', coords: [31.465866, -26.522503] },
  { id: 'SYR', name: 'Syria', coords: [38.996815, 34.802075] },
  { id: 'TCD', name: 'Chad', coords: [18.732207, 15.454166] },
  { id: 'TGO', name: 'Togo', coords: [0.824782, 8.619543] },
  { id: 'THA', name: 'Thailand', coords: [100.992541, 15.870032] },
  { id: 'TJK', name: 'Tajikistan', coords: [71.276093, 38.861034] },
  { id: 'TKM', name: 'Turkmenistan', coords: [59.556278, 38.969719] },
  { id: 'TLS', name: 'East Timor', coords: [125.727539, -8.874217] },
  { id: 'TON', name: 'Tonga', coords: [-175.198242, -21.178986] },
  { id: 'TTO', name: 'Trinidad and Tobago', coords: [-61.222503, 10.691803] },
  { id: 'TUN', name: 'Tunisia', coords: [9.537499, 33.886917] },
  { id: 'TUR', name: 'Turkey', coords: [35.243322, 38.963745] },
  { id: 'TWN', name: 'Taiwan', coords: [120.960515, 23.69781] },
  { id: 'TZA', name: 'Tanzania', coords: [34.888822, -6.369028] },
  { id: 'UGA', name: 'Uganda', coords: [32.290275, 1.373333] },
  { id: 'UKR', name: 'Ukraine', coords: [31.16558, 48.379433] },
  { id: 'URY', name: 'Uruguay', coords: [-55.765835, -32.522779] },
  { id: 'USA', name: 'United States', coords: [-95.712891, 37.09024] },
  { id: 'UZB', name: 'Uzbekistan', coords: [64.585262, 41.377491] },
  { id: 'VEN', name: 'Venezuela', coords: [-66.58973, 6.42375] },
  { id: 'VNM', name: 'Vietnam', coords: [108.277199, 14.058324] },
  { id: 'VUT', name: 'Vanuatu', coords: [166.959158, -15.376706] },
  { id: 'WSM', name: 'Samoa', coords: [-172.104629, -13.759029] },
  { id: 'YEM', name: 'Yemen', coords: [48.516388, 15.552727] },
  { id: 'ZAF', name: 'South Africa', coords: [22.937506, -30.559482] },
  { id: 'ZMB', name: 'Zambia', coords: [27.849332, -13.133897] },
  { id: 'ZWE', name: 'Zimbabwe', coords: [29.154857, -19.015438] }
].sort((a, b) => a.name.localeCompare(b.name));

export default function SecureTransferBoard() {
  const [scene, setScene] = useState(0);
  const [tooltipContent, setTooltipContent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapScale, setMapScale] = useState(100);

  // For path animation (dotted line)
  //   const interpolateLine = (fraction: number) => [
  //     ORIGIN.coords,
  //     [
  //       ORIGIN.coords[0] + (DEST.coords[0] - ORIGIN.coords[0]) * fraction,
  //       ORIGIN.coords[1] + (DEST.coords[1] - ORIGIN.coords[1]) * fraction
  //     ]
  //   ];

  const width = 750;
  const height = 400;

  // Handle country selection
  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    const country = COUNTRIES.find((c) => c.id === countryId);
    if (country) {
      setMapCenter([country.coords[0], country.coords[1]]);
      setMapScale(300); // Zoom in when country is selected
    }
  };

  // Reset map view
  const resetMapView = () => {
    setSelectedCountry('');
    setMapCenter([0, 0]);
    setMapScale(100);
  };

  const projection = geoCylindricalStereographic()
    .translate([width / 2, height / 2])
    .scale(mapScale)
    .center(mapCenter);

  return (
    <div className='w-full'>
      {/* Country Selection Dropdown */}
      <div className='mb-4 flex items-center gap-4'>
        <div className='flex-1'>
          <label className='mb-2 block text-sm font-medium text-gray-300'>
            Select Country to Zoom
          </label>
          <Select value={selectedCountry} onValueChange={handleCountrySelect}>
            <SelectTrigger className='w-full border-slate-600 bg-slate-800 text-white'>
              <div className='flex items-center gap-2'>
                <Search className='h-4 w-4 text-gray-400' />
                <SelectValue placeholder='Search and select a country...' />
              </div>
            </SelectTrigger>
            <SelectContent className='max-h-60 border-slate-600 bg-slate-800'>
              {COUNTRIES.map((country) => (
                <SelectItem
                  key={country.id}
                  value={country.id}
                  className='text-white hover:bg-slate-700 focus:bg-slate-700'
                >
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-3 w-3 text-blue-400' />
                    {country.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCountry && (
          <div className='flex items-center gap-2'>
            <div className='text-sm text-gray-300'>
              Viewing:{' '}
              <span className='font-semibold text-blue-400'>
                {COUNTRIES.find((c) => c.id === selectedCountry)?.name}
              </span>
            </div>
            <button
              onClick={resetMapView}
              className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
            >
              <MapPin className='h-4 w-4' />
              Reset View
            </button>
          </div>
        )}
      </div>

      <div className='relative mb-8 h-[600px] w-full overflow-hidden rounded-xl bg-[#10172A] p-4 shadow-lg'>
        <ComposableMap projection={projection} width={width} height={height}>
          {/* <Graticule stroke="white" /> */}
          <Geographies geography='/features.json'>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isSelected =
                  selectedCountry && geo.id === selectedCountry;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isSelected ? '#3B82F6' : '#222a38',
                        outline: 'none'
                      },
                      hover: {
                        fill: isSelected ? '#2563EB' : '#29324c',
                        outline: 'none'
                      },
                      pressed: {
                        fill: isSelected ? '#1D4ED8' : '#1e2738',
                        outline: 'none'
                      }
                    }}
                    stroke={isSelected ? '#60A5FA' : '#FFF'}
                    strokeWidth={isSelected ? 1 : 0.2}
                    data-tooltip-id='my-tooltip'
                    data-tooltip-content={geo.properties.name}
                  />
                );
              })
            }
          </Geographies>

          <Line
            from={ORIGIN.coords as [number, number]}
            to={DEST.coords as [number, number]}
            stroke='#FF5533'
            strokeWidth={4}
            strokeLinecap='round'
          />

          {/* Origin Point */}
          <Marker coordinates={ORIGIN.coords as [number, number]}>
            <motion.circle
              r={5}
              fill='#4A90E2'
              animate={scene >= 0 ? { scale: [0.6, 1.1, 1] } : { scale: 0.6 }}
              transition={{ duration: 0.9, type: 'spring' }}
            />
            <g className='absolute top-20 left-1/2 -translate-x-1/2 transform whitespace-nowrap'>
              <g className='rounded-lg border border-blue-400 bg-slate-800 px-3 py-1 shadow-lg'>
                <text className='text-sm font-semibold'>Mumbai, India 🇮🇳</text>
                <text className='text-xs text-blue-300'>Your Bank</text>
              </g>
            </g>
          </Marker>
          {/* Destination Point */}
          <Marker coordinates={DEST.coords as [number, number]}>
            <motion.circle
              r={5}
              fill='#50C878'
              animate={scene >= 0 ? { scale: [0.6, 1.1, 1] } : { scale: 0.6 }}
              transition={{ duration: 0.9, type: 'spring' }}
            />
            <text
              textAnchor='middle'
              y={-18}
              style={{ fontFamily: 'sans-serif', fill: '#fff', fontSize: 16 }}
            >
              Lending Partner - London, UK
            </text>
          </Marker>
          {/* Dotted Line path */}
          <motion.g>
            <motion.line
              x1={ORIGIN.coords[0]}
              y1={ORIGIN.coords[1]}
              x2={DEST.coords[0]}
              y2={DEST.coords[1]}
              stroke='#00D4FF'
              strokeDasharray='6 8'
              strokeWidth={3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 2 }}
              transition={{ duration: 1.3 }}
            />
          </motion.g>
          {/* Data package Icon (glowing briefcase/cube) */}
          <AnimatePresence>
            {scene >= 0 && (
              <motion.g
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <rect
                  x={ORIGIN.coords[0]}
                  y={ORIGIN.coords[1]}
                  width={18}
                  height={13}
                  rx={4}
                  fill='#00D4FF'
                  opacity={0.82}
                  filter='url(#glow)'
                />
              </motion.g>
            )}
          </AnimatePresence>
        </ComposableMap>
        <Tooltip id='my-tooltip'>{tooltipContent}</Tooltip>
        {/* Info Panels/Overlays per scene */}
        {/* <SceneOverlay scene={SCENES[scene]} /> */}
        <div className='absolute right-2 bottom-2 flex gap-2'>
          <button
            onClick={() => setScene(Math.max(scene - 1, 0))}
            className='rounded-full bg-gray-500 px-3 py-1 text-white'
          >
            Prev
          </button>
          <button
            onClick={() => setScene(Math.min(scene + 1, SCENES.length - 1))}
            className='rounded-full bg-blue-600 px-3 py-1 text-white'
          >
            Next
          </button>
        </div>
      </div>
      <SecureTransferJourney />
    </div>
  );
}

// Overlay for scene-specific info & UI
function SceneOverlay({ scene }: { scene: any }) {
  switch (scene) {
    case 'setup':
      return (
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-[#16213e] px-8 py-3 text-white shadow-lg'>
          <span className='text-xl font-semibold'>
            Preparing Secure Data Transfer
          </span>
        </div>
      );
    case 'collect':
      return (
        <motion.div
          key='collect'
          className='absolute top-4 right-8 w-[320px] rounded-lg bg-[#1B2535] p-5 text-white shadow-xl'
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
        >
          <div className='mb-3 font-bold'>Collecting approved data...</div>
          <ul className='space-y-1'>
            <li>✓  Financial statements</li>
            <li>✓  Identity documents</li>
            <li>✓  Credit history</li>
            <li>✓  Business verification</li>
          </ul>
        </motion.div>
      );
    case 'encrypt':
      return (
        <motion.div
          key='encrypt'
          className='absolute bottom-9 left-1/2 min-w-[320px] -translate-x-1/2 rounded-lg border-4 border-blue-500 bg-[#11204d] p-5 text-white shadow-2xl'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div>
            <span className='font-bold text-cyan-400'>
              🔒 2048-bit RSA + AES-256
            </span>
          </div>
          <div className='mb-2'>
            Data is now unreadable to unauthorized parties.
          </div>
          <div className='text-xs'>Encryption complete: 1.3 seconds</div>
        </motion.div>
      );
    case 'tunnel':
      return (
        <motion.div
          key='tunnel'
          className='absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg border-2 border-cyan-300 bg-[#122620] px-7 py-3 text-white shadow-2xl'
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div>
            <div className='font-semibold'>TLS 1.3 Connection Active</div>
            <div className='text-sm text-cyan-200'>
              Quantum-resistant encryption enabled
            </div>
          </div>
        </motion.div>
      );
    default:
      return null;
  }
}

const SecureTransferJourney = () => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [encryptionLayers, setEncryptionLayers] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Stage timing
  useEffect(() => {
    const stages = [
      { duration: 2000, progressSpeed: 0 }, // Stage 0: Setup
      { duration: 3000, progressSpeed: 0 }, // Stage 1: Data Collection
      { duration: 4000, progressSpeed: 0 }, // Stage 2: Encryption
      { duration: 3000, progressSpeed: 0 }, // Stage 3: Tunnel Creation
      { duration: 2000, progressSpeed: 0 }, // Stage 4: Handshake
      { duration: 5000, progressSpeed: 20 }, // Stage 5: Transfer (with progress)
      { duration: 2000, progressSpeed: 0 }, // Stage 6: Arrival
      { duration: 3000, progressSpeed: 0 }, // Stage 7: Decryption
      { duration: 3000, progressSpeed: 0 } // Stage 8: Success
    ];

    if (stage < stages.length) {
      const currentStage = stages[stage];
      const timer = setTimeout(() => {
        if (stage < stages.length - 1) {
          setStage(stage + 1);
          if (stage !== 5) setProgress(0);
        }
      }, currentStage.duration);

      // Progress bar for transfer stage
      if (stage === 5) {
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 2;
          });
        }, 100);
        return () => {
          clearTimeout(timer);
          clearInterval(progressInterval);
        };
      }

      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Encryption layers animation
  useEffect(() => {
    if (stage === 2) {
      const intervals = [500, 1200, 2000];
      intervals.forEach((delay, index) => {
        setTimeout(() => setEncryptionLayers(index + 1), delay);
      });
    }
  }, [stage]);

  const getStageTitle = () => {
    const titles = [
      'Preparing Secure Data Transfer',
      'Collecting Approved Data',
      'Encrypting Your Data',
      'Creating Secure Channel',
      'Verifying Connection',
      'Transferring Securely',
      'Data Received',
      'Secure Decryption',
      'Transfer Complete'
    ];
    return titles[stage] || titles[0];
  };

  const getStageDescription = () => {
    const descriptions = [
      'Establishing connection between Mumbai and London',
      'Gathering financial records, documents, and verification data',
      'Applying military-grade encryption to protect your data',
      'Building secure tunnel with TLS 1.3 protection',
      'Both parties authenticating and establishing trust',
      'Your encrypted data is traveling through the secure channel',
      'Verifying data integrity and confirming safe arrival',
      'Authorized recipient decrypting data with secure keys',
      'Your data has been transferred securely across borders'
    ];
    return descriptions[stage] || descriptions[0];
  };

  return (
    <div className='min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 text-white'>
      {/* Header */}
      <div className='mx-auto mb-8 max-w-7xl'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold'>{getStageTitle()}</h1>
            <p className='text-blue-200'>{getStageDescription()}</p>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700'
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {/* Main Visualization */}
      <div className='relative mx-auto max-w-7xl'>
        {/* Map Background with Grid */}
        <div className='relative h-96 overflow-hidden rounded-2xl border border-blue-500/30 bg-slate-800/50 backdrop-blur-sm'>
          {/* Grid Pattern */}
          <div className='absolute inset-0 opacity-20'>
            <div
              className='h-full w-full'
              style={{
                backgroundImage:
                  'linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}
            ></div>
          </div>

          {/* Origin Point - Mumbai */}
          <div
            className={`absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-1000 ${stage >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
          >
            <div className='relative'>
              {/* Pin */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl ${stage >= 1 ? 'animate-pulse' : ''}`}
              >
                <Package className='h-8 w-8' />
              </div>
              {/* Label */}
              <div className='absolute top-20 left-1/2 -translate-x-1/2 transform whitespace-nowrap'>
                <div className='rounded-lg border border-blue-400 bg-slate-800 px-3 py-1 shadow-lg'>
                  <p className='text-sm font-semibold'>Mumbai, India 🇮🇳</p>
                  <p className='text-xs text-blue-300'>Your Bank</p>
                </div>
              </div>

              {/* Data Collection Animation */}
              {stage === 1 && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className='absolute animate-ping'
                      style={{
                        top: `${-40 - i * 20}px`,
                        left: `${-20 + i * 15}px`,
                        animationDelay: `${i * 200}ms`,
                        animationDuration: '2s'
                      }}
                    >
                      <div className='h-8 w-8 rounded bg-blue-400 opacity-75'></div>
                    </div>
                  ))}
                </>
              )}

              {/* Encryption Layers */}
              {stage === 2 && (
                <>
                  {encryptionLayers >= 1 && (
                    <div className='absolute inset-0 -m-2 animate-pulse rounded-full border-2 border-cyan-400'></div>
                  )}
                  {encryptionLayers >= 2 && (
                    <div
                      className='absolute inset-0 -m-4 animate-pulse rounded-full border-2 border-cyan-300'
                      style={{ animationDelay: '0.3s' }}
                    ></div>
                  )}
                  {encryptionLayers >= 3 && (
                    <div
                      className='absolute inset-0 -m-6 animate-pulse rounded-full border-4 border-blue-500 shadow-2xl shadow-blue-500/50'
                      style={{ animationDelay: '0.6s' }}
                    ></div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Destination Point - London */}
          <div
            className={`absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 transform transition-all duration-1000 ${stage >= 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
          >
            <div className='relative'>
              {/* Pin */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-teal-400 to-green-600 shadow-2xl ${stage >= 6 ? 'animate-pulse' : ''}`}
              >
                <Shield className='h-8 w-8' />
              </div>
              {/* Label */}
              <div className='absolute top-20 left-1/2 -translate-x-1/2 transform whitespace-nowrap'>
                <div className='rounded-lg border border-green-400 bg-slate-800 px-3 py-1 shadow-lg'>
                  <p className='text-sm font-semibold'>London, UK 🇬🇧</p>
                  <p className='text-xs text-green-300'>Lending Partner</p>
                </div>
              </div>

              {/* Arrival Animation */}
              {stage === 6 && (
                <div className='absolute inset-0 -m-8'>
                  <div className='h-full w-full animate-ping rounded-full border-4 border-green-400'></div>
                </div>
              )}

              {/* Success Glow */}
              {stage >= 8 && (
                <div className='absolute inset-0 -m-4 animate-pulse rounded-full bg-green-400/20'></div>
              )}
            </div>
          </div>

          {/* Secure Tunnel */}
          {stage >= 3 && (
            <div className='absolute top-1/2 right-1/4 left-1/4 -translate-y-1/2 transform'>
              <svg
                className='h-24 w-full'
                viewBox='0 0 100 24'
                preserveAspectRatio='none'
              >
                {/* Tunnel Base */}
                <defs>
                  <linearGradient
                    id='tunnelGradient'
                    x1='0%'
                    y1='0%'
                    x2='100%'
                    y2='0%'
                  >
                    <stop offset='0%' stopColor='#3B82F6' stopOpacity='0.8' />
                    <stop offset='50%' stopColor='#00D4FF' stopOpacity='0.9' />
                    <stop offset='100%' stopColor='#00B8A9' stopOpacity='0.8' />
                  </linearGradient>
                </defs>
                <path
                  d='M 0 12 Q 25 8, 50 12 T 100 12'
                  stroke='url(#tunnelGradient)'
                  strokeWidth='8'
                  fill='none'
                  className={`transition-all duration-1000 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}
                  strokeDasharray={stage === 3 ? '5, 5' : '0'}
                />

                {/* Tunnel Glow */}
                <path
                  d='M 0 12 Q 25 8, 50 12 T 100 12'
                  stroke='url(#tunnelGradient)'
                  strokeWidth='16'
                  fill='none'
                  opacity='0.3'
                  className='blur-sm'
                />
              </svg>

              {/* Checkpoint Nodes */}
              {stage >= 3 && (
                <>
                  <div className='absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 transform'>
                    <div
                      className={`h-4 w-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 ${stage >= 5 ? 'animate-pulse' : ''}`}
                    ></div>
                  </div>
                  <div className='absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 transform'>
                    <div
                      className={`h-4 w-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 ${stage >= 5 ? 'animate-pulse' : ''}`}
                    ></div>
                  </div>
                </>
              )}

              {/* Handshake Keys */}
              {stage === 4 && (
                <>
                  <div className='absolute top-1/2 left-1/4 -translate-y-1/2 transform animate-pulse'>
                    <Lock className='h-6 w-6 text-yellow-400' />
                  </div>
                  <div className='absolute top-1/2 right-1/4 -translate-y-1/2 transform animate-pulse'>
                    <Lock className='h-6 w-6 text-yellow-400' />
                  </div>
                </>
              )}

              {/* Traveling Data Package */}
              {stage === 5 && (
                <div
                  className='absolute top-1/2 -translate-y-1/2 transform transition-all duration-200'
                  style={{ left: `${progress}%` }}
                >
                  <div className='relative'>
                    <div className='flex h-10 w-10 animate-pulse items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-400/50'>
                      <Send className='h-5 w-5' />
                    </div>
                    {/* Trail effect */}
                    <div className='absolute inset-0 animate-pulse rounded-lg bg-cyan-400 opacity-50 blur-xl'></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Checkmark */}
          {stage >= 8 && (
            <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
              <div className='flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-green-500 shadow-2xl shadow-green-500/50'>
                <CheckCircle className='h-12 w-12' />
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for Transfer Stage */}
        {stage === 5 && (
          <div className='mt-6 rounded-xl border border-blue-500/30 bg-slate-800/50 p-4'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm font-semibold'>Transfer Progress</span>
              <span className='text-sm text-blue-300'>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className='h-3 w-full overflow-hidden rounded-full bg-slate-700'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg shadow-cyan-400/50 transition-all duration-200'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className='mt-3 grid grid-cols-3 gap-4 text-xs'>
              <div>
                <p className='text-blue-300'>Data Size</p>
                <p className='font-semibold'>15.8 MB</p>
              </div>
              <div>
                <p className='text-blue-300'>Distance</p>
                <p className='font-semibold'>7,200 km</p>
              </div>
              <div>
                <p className='text-blue-300'>Speed</p>
                <p className='flex items-center gap-1 font-semibold'>
                  <Zap className='h-3 w-3 text-yellow-400' />
                  Optimal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Panels */}
        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* Security Status */}
          <div className='rounded-xl border border-blue-500/30 bg-slate-800/50 p-4 backdrop-blur-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-400' />
              <h3 className='font-semibold'>Security Status</h3>
            </div>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center justify-between'>
                <span className='text-blue-200'>Encryption</span>
                <span
                  className={`font-semibold ${stage >= 2 ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {stage >= 2 ? 'AES-256' : 'Pending'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-blue-200'>Channel</span>
                <span
                  className={`font-semibold ${stage >= 3 ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {stage >= 3 ? 'TLS 1.3' : 'Pending'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-blue-200'>Verification</span>
                <span
                  className={`font-semibold ${stage >= 4 ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {stage >= 4 ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Stage Checklist */}
          <div className='rounded-xl border border-blue-500/30 bg-slate-800/50 p-4 backdrop-blur-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <Clock className='h-5 w-5 text-blue-400' />
              <h3 className='font-semibold'>Transfer Stages</h3>
            </div>
            <div className='space-y-2 text-sm'>
              {[
                'Collected',
                'Encrypted',
                'Secured',
                'Transferred',
                'Verified'
              ].map((label, i) => (
                <div key={i} className='flex items-center gap-2'>
                  {stage > i + 1 ? (
                    <CheckCircle className='h-4 w-4 text-green-400' />
                  ) : stage === i + 1 ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent'></div>
                  ) : (
                    <div className='h-4 w-4 rounded-full border-2 border-gray-600'></div>
                  )}
                  <span
                    className={
                      stage > i + 1
                        ? 'text-green-400'
                        : stage === i + 1
                          ? 'text-blue-400'
                          : 'text-gray-400'
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Encryption Details */}
          <div className='rounded-xl border border-blue-500/30 bg-slate-800/50 p-4 backdrop-blur-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <Lock className='h-5 w-5 text-blue-400' />
              <h3 className='font-semibold'>Encryption Layers</h3>
            </div>
            <div className='space-y-2 text-sm'>
              <div
                className={`flex items-center gap-2 transition-all ${encryptionLayers >= 1 ? 'text-cyan-400' : 'text-gray-500'}`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${encryptionLayers >= 1 ? 'bg-cyan-400' : 'bg-gray-600'}`}
                ></div>
                <span>AES-256 Applied</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-all ${encryptionLayers >= 2 ? 'text-cyan-400' : 'text-gray-500'}`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${encryptionLayers >= 2 ? 'bg-cyan-400' : 'bg-gray-600'}`}
                ></div>
                <span>End-to-End Active</span>
              </div>
              <div
                className={`flex items-center gap-2 transition-all ${encryptionLayers >= 3 ? 'text-blue-400' : 'text-gray-500'}`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${encryptionLayers >= 3 ? 'bg-blue-400' : 'bg-gray-600'}`}
                ></div>
                <span>Military-Grade Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details Panel */}
        {showDetails && stage >= 2 && (
          <div className='animate-in fade-in mt-6 rounded-xl border border-blue-500/30 bg-slate-800/70 p-6 backdrop-blur-sm duration-500'>
            <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
              <Shield className='h-5 w-5 text-blue-400' />
              Technical Details
            </h3>
            <div className='grid grid-cols-1 gap-6 text-sm md:grid-cols-2'>
              <div>
                <p className='mb-2 text-blue-300'>Encryption Standards</p>
                <ul className='space-y-1 text-gray-300'>
                  <li>• RSA-2048 for key exchange</li>
                  <li>• AES-256-GCM for data encryption</li>
                  <li>• SHA-256 for integrity verification</li>
                  <li>• Perfect Forward Secrecy enabled</li>
                </ul>
              </div>
              <div>
                <p className='mb-2 text-blue-300'>Transfer Protocol</p>
                <ul className='space-y-1 text-gray-300'>
                  <li>• TLS 1.3 secure channel</li>
                  <li>• Zero-knowledge architecture</li>
                  <li>• Multi-hop routing via secure nodes</li>
                  <li>• Real-time integrity checks</li>
                </ul>
              </div>
              <div>
                <p className='mb-2 text-blue-300'>Compliance</p>
                <ul className='space-y-1 text-gray-300'>
                  <li>• GDPR compliant data handling</li>
                  <li>• SOC 2 Type II certified</li>
                  <li>• ISO 27001 standards</li>
                  <li>• PCI DSS Level 1</li>
                </ul>
              </div>
              <div>
                <p className='mb-2 text-blue-300'>Audit Trail</p>
                <ul className='space-y-1 text-gray-300'>
                  <li>• Immutable transaction logs</li>
                  <li>• Timestamp verification</li>
                  <li>• Multi-party signatures</li>
                  <li>• Blockchain-anchored proof</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Summary */}
        {stage >= 8 && (
          <div className='animate-in fade-in mt-6 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-6 backdrop-blur-sm duration-500'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500'>
                <CheckCircle className='h-8 w-8' />
              </div>
              <div className='flex-1'>
                <h3 className='mb-2 text-xl font-bold'>Transfer Complete!</h3>
                <p className='mb-4 text-green-100'>
                  Your data has been securely transferred from Mumbai to London
                  using military-grade encryption.
                </p>
                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                  <div>
                    <p className='text-green-300'>Transfer ID</p>
                    <p className='font-mono'>TXN-2024-A7B9</p>
                  </div>
                  <div>
                    <p className='text-green-300'>Duration</p>
                    <p className='font-semibold'>8.2 seconds</p>
                  </div>
                  <div>
                    <p className='text-green-300'>Data Integrity</p>
                    <p className='font-semibold'>100% Verified</p>
                  </div>
                  <div>
                    <p className='text-green-300'>Security Level</p>
                    <p className='font-semibold'>Maximum</p>
                  </div>
                </div>
                <div className='mt-4 flex gap-3'>
                  <button className='rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-green-700'>
                    Download Certificate
                  </button>
                  <button className='rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-600'>
                    View Security Log
                  </button>
                  <button
                    onClick={() => {
                      setStage(0);
                      setProgress(0);
                      setEncryptionLayers(0);
                    }}
                    className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-blue-700'
                  >
                    Replay Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
