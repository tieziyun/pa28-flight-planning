// VFR pre-flight planning items for the pre-flight planning page.
// Sources (wording kept close to the source):
//   SS05 = CAA Safety Sense Leaflet 05 "Flight under VFR" (October 2022)
//   INF  = CAA Airspace Infringement site, "Route Planning" (infringements.caa.co.uk)
//   SERA = SERA.2010(b) Pre-flight action (UK CAA regulatory library)
//   SWC  = CAA Skyway Code (CAP 1535) pre-flight checklist
//   POH  = G-CEZO POH
//   Practice = common UK GA practice (not from the documents above)

const PLAN_GROUPS = [
  { title: 'Pilot', step: 1, items: [
    ['Personal licence, ratings and medical valid for the intended flight', 'SS05'],
    ['Fit to fly: physical and mental wellbeing (IMSAFE)', 'SS05 / INF'],
    ['Proficient and current for the planned flight (extra time allowed if it has been a while since you last flew)', 'SS05'],
    ['Planning done in a quiet environment free from distraction', 'SS05'],
    ['Threat and Error Management: threats (e.g. uncertain weather, complex airspace) identified and mitigations planned', 'SS05 / INF'],
  ]},
  { title: 'Aircraft', step: 2, items: [
    ['Aircraft serviceability checked (tech log / defects / maintenance due)', 'SS05'],
    ['Aircraft documents on board', 'POH 4.5a'],
    ['Electronic conspicuity device configured, functions and limitations understood', 'SS05'],
    ['Overnight weather checked for high winds, frost or snow (if aircraft to be left outside)', 'SWC'],
  ]},
  { title: 'Weather', step: 3, items: [
    ['Careful study of available current weather reports and forecasts', 'SERA'],
    ['Cloud base and visibility suitable; conditions at or above VFR minima for departure, en route and destination', 'SS05'],
    ['Wider picture reviewed (Metform 215); weather systems / fronts on the route considered', 'SS05'],
    ['TAFs and METARs reviewed for departure, destination and aerodromes along the route (elevation differences accounted for)', 'SS05'],
    ['Source of any third-party weather data understood', 'SS05'],
    ['Freezing level / carburettor icing risk considered', 'Practice'],
  ]},
  { title: 'NOTAMs and temporary airspace', step: 3, items: [
    ['NOTAMs checked for route, destination and alternate aerodromes (NATS narrow route / point / aerodrome brief)', 'SS05 / SWC'],
    ['AIP Supplements checked', 'SS05'],
    ['NOTAM times, altitudes and operational information reviewed; contact phone numbers noted', 'SS05'],
    ['Temporary airspace (RA(T), TDA, Prohibited, Danger) checked and marked on the paper chart', 'INF'],
    ['NOTAM brief revisited shortly before departure', 'INF'],
    ['AIS Information Line called just before engine start for short-term restrictions (08085 354802)', 'SS05 / INF'],
  ]},
  { title: 'Route and airspace', step: 4, items: [
    ['Suitable and current charts carried; paper chart (1:500,000 or 1:250,000) with route marked as backup', 'SS05 / INF'],
    ['Moving map has current aeronautical data and is integrated into the plan', 'SS05'],
    ['Airspace above and below the route checked; max / min airspace-clear altitude for each leg', 'INF'],
    ['"Take 2": plan to stay 2 nm laterally / 200 ft vertically clear of controlled airspace', 'INF'],
    ['Hazards reviewed: Class D, Danger areas, Restricted/Prohibited areas, Glider sites, Parachuting, RMZ/TMZ, MATZ, instrument approaches outside CAS', 'SS05'],
    ['Gliding sites on the route checked (winch launch height, cable risk)', 'INF'],
    ['High ground and obstacles reviewed; altitudes established below which the flight will not continue', 'SS05'],
    ['Prominent ground features / VRPs identified along the route', 'SS05'],
    ['Plan B route for any airspace requiring a clearance, with fuel to avoid it', 'SS05 / INF'],
    ['Alternative course of action if the flight cannot be completed as planned (diversion / turn back)', 'SERA'],
    ['Open areas identified to orbit if weather or position becomes uncertain', 'INF'],
    ['Cruise planned as high as practical, subject to airspace and performance', 'SS05'],
    ['Altimeter settings planned (most relevant QNH; RPS only if nothing better); set before any altitude-limited entry point', 'SS05 / INF'],
    ['ATSOCAS / LARS units and frequencies noted; Basic vs Traffic Service understood', 'SS05'],
    ['Frequency Monitoring Code (listening squawk) noted where near controlled airspace', 'INF'],
    ['Daylight checked: sunrise/sunset at departure, destination and alternate; whole flight, including any diversion and reserve, completed before night (UK: night begins 30 min after sunset) unless night-qualified and planned as a night flight', 'ANO / Practice'],
  ]},
  { title: 'Aerodromes', step: 4, items: [
    ['Prior permission (PPR) obtained for the destination', 'SS05'],
    ['Arrival planned: UK AIP AD 2.22 flight procedures, VFR guide, aerodrome website or verbal brief', 'INF'],
    ['Alternate / diversion aerodromes chosen and checked', 'SERA / SS05'],
    ['Fuel availability, opening hours and landing fees checked at destination', 'Practice'],
  ]},
  { title: 'Administration', step: 8, items: [
    ['Flight plan filed (required for international flight)', 'SWC'],
    ['Booked out with the departure aerodrome (where required)', 'Practice'],
    ['Someone on the ground told the route and ETA', 'Practice'],
    ['Passengers briefed', 'SWC'],
  ]},
];

// Planning order used on the pre-flight page
const PLAN_STEPS = {
  1: 'Pilot', 2: 'Documents & aircraft', 3: 'Weather & NOTAMs', 4: 'Route & navigation log',
  5: 'Fuel', 6: 'Weight & balance', 7: 'Take-off & landing performance', 8: 'Before you go',
};

// Part-NCO minimum final reserve, aeroplanes (as summarised in SS05):
const NCO_RESERVE = {
  dayLocal: { min: 10, label: 'Day, remaining within sight of the aerodrome and returning to it' },
  day:      { min: 30, label: 'Day' },
  night:    { min: 45, label: 'Night' },
};

// SERA VMC minima as given in SS05 (UK).
const VMC_TABLE_HTML = `<table>
<tr><th>Altitude band</th><th>Class</th><th>Flight visibility</th><th>Distance from cloud</th></tr>
<tr><td>At and above 10,000 ft AMSL/FL100</td><td>A B C D E F G</td><td>8 km</td><td>1,500 m horizontally, 1,000 ft vertically</td></tr>
<tr><td>Below 10,000 ft AMSL/FL100 and above 3,000 ft AMSL, or above 1,000 ft above terrain, whichever is the higher</td><td>A B C D E F G</td><td>5 km</td><td>1,500 m horizontally, 1,000 ft vertically</td></tr>
<tr><td rowspan="2">At and below 3,000 ft AMSL, or 1,000 ft above terrain, whichever is the higher</td><td>A B C D** E</td><td>5 km</td><td>1,500 m horizontally, 1,000 ft vertically</td></tr>
<tr><td>F G</td><td>5 km*</td><td>Clear of cloud and with the surface in sight</td></tr>
</table>
<p class="note">*5 km: In the UK this may be reduced to 1500 m if flying by day, in sight of the surface and at 140 kts IAS or less. This may vary in other states.<br>
**Class D exception: Under the following circumstances you may fly 'clear of cloud' in class D airspace, without complying with the specific cloud separation distances:
by day at or below 3000 ft AMSL, in sight of the surface and at 140 kts IAS or less. 5 km visibility is still required, except for helicopters for which 1500 m is required.
Note this is a UK difference from Part-SERA as applies in the EU. Class A: VFR flight not permitted. (CAA SS05, Oct 2022)</p>`;

// FREDA in-flight check (SS05)
const FREDA = [
  ['Fuel', 'check fuel consumption against plan, do you need to change tank selection?'],
  ['Radio', 'are you still on the most appropriate frequency, is the transponder set correctly?'],
  ['Engine', 'check temperatures and pressures, apply carb heat as required.'],
  ['Direction', 'is the Direction Indicator synchronised, is your heading correct?'],
  ['Altimeter', 'are you still at the correct altitude and using the most appropriate QNH?'],
];

if (typeof module !== 'undefined') module.exports = { PLAN_GROUPS, PLAN_STEPS, NCO_RESERVE };
