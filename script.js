/**
 * AquaTrace — Agricultural Water Footprint Calculator
 * All data based on Mekonnen & Hoekstra (2011), Water Footprint Network,
 * FAO AQUASTAT. No external API required.
 */

/* ============================================================
   DATA
   ============================================================ */
const WF_DATA = {
  products: {
    wheat:      { label:"Wheat",              icon:"🌾", category:"Grains",      baseFootprint:1827,  green:1654, blue:152,  grey:21,   description:"Global average water footprint for wheat production" },
    rice:       { label:"Rice",               icon:"🍚", category:"Grains",      baseFootprint:2497,  green:1022, blue:1236, grey:239,  description:"Paddy rice — highly water-intensive due to flooded fields" },
    maize:      { label:"Maize (Corn)",        icon:"🌽", category:"Grains",      baseFootprint:1222,  green:1103, blue:86,   grey:33,   description:"Corn is moderately water-intensive" },
    sugarcane:  { label:"Sugarcane",           icon:"🎋", category:"Cash Crops",  baseFootprint:210,   green:155,  blue:35,   grey:20,   description:"Relatively low per kg but grown in huge volumes" },
    cotton:     { label:"Cotton",              icon:"☁️", category:"Cash Crops",  baseFootprint:10000, green:6003, blue:2535, grey:1514, description:"One of the most water-intensive crops globally" },
    soybean:    { label:"Soybean",             icon:"🫘", category:"Legumes",     baseFootprint:2145,  green:2097, blue:8,    grey:40,   description:"Mostly rain-fed; heavily grown in South America" },
    potato:     { label:"Potato",              icon:"🥔", category:"Vegetables",  baseFootprint:287,   green:197,  blue:64,   grey:26,   description:"One of the most water-efficient staple crops" },
    tomato:     { label:"Tomato",              icon:"🍅", category:"Vegetables",  baseFootprint:214,   green:93,   blue:89,   grey:32,   description:"Moderate water use — common in drip-irrigated systems" },
    onion:      { label:"Onion",               icon:"🧅", category:"Vegetables",  baseFootprint:272,   green:173,  blue:78,   grey:21,   description:"Moderately water-intensive vegetable" },
    apple:      { label:"Apple",               icon:"🍎", category:"Fruits",      baseFootprint:822,   green:693,  blue:96,   grey:33,   description:"Fruit orchards require consistent water year-round" },
    banana:     { label:"Banana",              icon:"🍌", category:"Fruits",      baseFootprint:790,   green:577,  blue:103,  grey:110,  description:"Tropical fruit grown in high-rainfall regions" },
    mango:      { label:"Mango",               icon:"🥭", category:"Fruits",      baseFootprint:1600,  green:1200, blue:280,  grey:120,  description:"Popular tropical drupe — water-intensive in dry climates" },
    groundnut:  { label:"Groundnut (Peanut)",  icon:"🥜", category:"Legumes",     baseFootprint:2782,  green:2637, blue:87,   grey:58,   description:"Largely rain-fed legume, significant grey water" },
    sunflower:  { label:"Sunflower",           icon:"🌻", category:"Cash Crops",  baseFootprint:3366,  green:3167, blue:130,  grey:69,   description:"Oil-seed crop with high water demand" },
    coffee:     { label:"Coffee",              icon:"☕", category:"Cash Crops",  baseFootprint:18900, green:15263,blue:2201, grey:1437, description:"Extremely water-intensive — includes processing" },
    tea:        { label:"Tea",                 icon:"🍵", category:"Cash Crops",  baseFootprint:9200,  green:8277, blue:553,  grey:370,  description:"High rainfall regions reduce blue water but totals remain high" },
    sugarbeet:  { label:"Sugar Beet",          icon:"🌱", category:"Cash Crops",  baseFootprint:132,   green:73,   blue:44,   grey:15,   description:"Much more water-efficient than sugarcane" },
    cassava:    { label:"Cassava",             icon:"🍠", category:"Root Crops",  baseFootprint:558,   green:514,  blue:6,    grey:38,   description:"Drought-tolerant root crop, mostly rain-fed" }
  },
  climateMultipliers: {
    tropical:          { label:"Tropical",           multiplier:0.85, description:"High rainfall reduces blue water dependency" },
    arid:              { label:"Arid / Desert",       multiplier:1.55, description:"Low rainfall increases irrigation demand significantly" },
    semi_arid:         { label:"Semi-Arid",           multiplier:1.25, description:"Moderate water stress — supplemental irrigation common" },
    temperate:         { label:"Temperate",           multiplier:1.00, description:"Baseline — moderate rainfall and evapotranspiration" },
    continental:       { label:"Continental",         multiplier:1.10, description:"Cold winters, warm summers — seasonal water stress" },
    mediterranean:     { label:"Mediterranean",       multiplier:1.20, description:"Dry summers drive heavy irrigation for summer crops" },
    humid_subtropical: { label:"Humid Subtropical",   multiplier:0.90, description:"High humidity reduces crop water stress" }
  },
  irrigationMultipliers: {
    drip:           { label:"Drip Irrigation",         multiplier:0.75, efficiency:90,  description:"Highest efficiency — water delivered directly to roots" },
    sprinkler:      { label:"Sprinkler",               multiplier:0.90, efficiency:75,  description:"Good efficiency — evaporation losses moderate" },
    surface:        { label:"Surface / Flood",         multiplier:1.30, efficiency:45,  description:"Traditional method — high evaporation and runoff losses" },
    furrow:         { label:"Furrow Irrigation",       multiplier:1.15, efficiency:55,  description:"Channels water between crop rows — moderate losses" },
    rainfed:        { label:"Rain-fed (No Irrigation)",multiplier:1.00, efficiency:100, description:"Depends entirely on natural rainfall — no blue water added" },
    subsurface_drip:{ label:"Subsurface Drip",         multiplier:0.65, efficiency:95,  description:"Most efficient — minimal evaporation, no surface wetting" }
  },
  soilMultipliers: {
    loamy:  { label:"Loamy",             multiplier:1.00, description:"Ideal soil — good water retention and drainage" },
    sandy:  { label:"Sandy",             multiplier:1.25, description:"Poor water retention — more irrigation needed" },
    clay:   { label:"Clay",              multiplier:0.90, description:"High retention but poor drainage — waterlogging risk" },
    silt:   { label:"Silty",             multiplier:0.95, description:"Good moisture retention — slightly better than loam" },
    peaty:  { label:"Peaty",             multiplier:0.85, description:"Excellent moisture retention — common in wetland farms" },
    chalky: { label:"Chalky / Alkaline", multiplier:1.15, description:"Fast drainage — increases irrigation requirement" }
  },
  seasonMultipliers: {
    kharif:     { label:"Kharif (Monsoon)", multiplier:0.80, description:"Monsoon season — high natural rainfall" },
    rabi:       { label:"Rabi (Winter)",    multiplier:1.10, description:"Cool and dry — moderate irrigation needed" },
    zaid:       { label:"Zaid (Summer)",    multiplier:1.35, description:"Hot dry season — highest irrigation demand" },
    spring:     { label:"Spring",          multiplier:0.95, description:"Mild temperatures, moderate rainfall" },
    summer:     { label:"Summer",          multiplier:1.30, description:"Peak evapotranspiration — high water demand" },
    autumn:     { label:"Autumn / Fall",   multiplier:0.90, description:"Cooling temps, reduced evapotranspiration" },
    winter:     { label:"Winter",          multiplier:1.05, description:"Cold temperatures — some crops need frost protection" },
    year_round: { label:"Year-Round",      multiplier:1.00, description:"Average of all seasonal conditions" }
  }
};

/* ============================================================
   GLOSSARY
   ============================================================ */
const GLOSSARY = [
  { tag:"concept", tagLabel:"Core Concept", title:"Water Footprint",
    body:"The total volume of freshwater consumed or polluted to produce a good or service, measured in litres per kilogram of product. It includes water used at all stages of production." },
  { tag:"green", tagLabel:"Green Water", title:"Green Water Footprint",
    body:"The volume of rainwater consumed during production — evaporated, transpired by plants, or incorporated into the product. Green water is rain stored in the soil and used by crops directly." },
  { tag:"blue", tagLabel:"Blue Water", title:"Blue Water Footprint",
    body:"The volume of surface water or groundwater consumed during production. Blue water is freshwater drawn from rivers, lakes, or aquifers for irrigation." },
  { tag:"grey", tagLabel:"Grey Water", title:"Grey Water Footprint",
    body:"The volume of freshwater required to dilute pollutants — such as fertilisers and pesticides — to meet ambient water quality standards. It represents pollution load on water bodies." },
  { tag:"concept", tagLabel:"Core Concept", title:"Virtual Water",
    body:"The water 'embedded' in a product — the water needed to produce it. Trading food is equivalent to trading virtual water. Countries import virtual water when they import food." },
  { tag:"concept", tagLabel:"Core Concept", title:"Water Scarcity",
    body:"Water scarcity occurs when demand exceeds available supply in a region. Agriculture accounts for about 70% of global freshwater withdrawals, making it the largest driver of water scarcity." },
  { tag:"blue", tagLabel:"Irrigation", title:"Irrigation Efficiency",
    body:"The ratio of water benefiting the crop to total water applied. Drip irrigation achieves ~90% efficiency, sprinkler ~75%, and surface flooding ~45%. Higher efficiency means less blue water per kg of crop." },
  { tag:"concept", tagLabel:"Core Concept", title:"Evapotranspiration (ET)",
    body:"The combined process of evaporation from the soil and transpiration from plant leaves. ET is the primary driver of crop water demand — hotter, drier, windier conditions increase ET and water footprint." },
  { tag:"green", tagLabel:"Climate", title:"Climate & Water Demand",
    body:"Climate type is one of the most important factors affecting a crop's water footprint. Arid climates can increase water requirements by 50%+ compared to temperate regions." },
  { tag:"concept", tagLabel:"Measurement", title:"Litre per Kilogram (L/kg)",
    body:"The standard unit for expressing crop water footprints. It tells you how many litres of water were consumed (and polluted) to produce one kilogram of that agricultural product at the farm gate." },
  { tag:"grey", tagLabel:"Soil Science", title:"Soil & Water Retention",
    body:"Soil type dramatically affects irrigation needs. Sandy soils drain fast and hold little water; clay soils retain well but risk waterlogging. Loamy soils are ideal — balancing drainage and retention." },
  { tag:"concept", tagLabel:"Food System", title:"Crop Water Productivity",
    body:"The inverse of water footprint — how many kilograms of food produced per litre of water. Potatoes and sugar beets have high water productivity; coffee and cotton have very low productivity." }
];

/* ============================================================
   STATE
   ============================================================ */
let lastResult = null;
const $ = id => document.getElementById(id);

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  buildGlossary();
  attachEvents();
});

/* ============================================================
   POPULATE SELECTS
   ============================================================ */
function populateSelects() {
  // Products grouped by category
  const sel = $('product');
  const cats = {};
  for (const [key, p] of Object.entries(WF_DATA.products)) {
    if (!cats[p.category]) cats[p.category] = [];
    cats[p.category].push({ key, ...p });
  }
  for (const [cat, items] of Object.entries(cats)) {
    const grp = document.createElement('optgroup');
    grp.label = cat;
    items.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.key;
      opt.textContent = `${p.icon} ${p.label}`;
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  }

  fillSelect('climate',   WF_DATA.climateMultipliers);
  fillSelect('irrigation',WF_DATA.irrigationMultipliers);
  fillSelect('soil',      WF_DATA.soilMultipliers);
  fillSelect('season',    WF_DATA.seasonMultipliers);
}

function fillSelect(id, obj) {
  const sel = $(id);
  for (const [key, o] of Object.entries(obj)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = o.label;
    sel.appendChild(opt);
  }
}

/* ============================================================
   GLOSSARY
   ============================================================ */
function buildGlossary() {
  const grid = $('glossaryGrid');
  GLOSSARY.forEach(e => {
    const card = document.createElement('div');
    card.className = 'glossary-card';
    card.innerHTML = `
      <span class="glossary-tag ${e.tag}">${e.tagLabel}</span>
      <h3>${e.title}</h3>
      <p>${e.body}</p>`;
    grid.appendChild(card);
  });
}

/* ============================================================
   EVENTS
   ============================================================ */
function attachEvents() {
  // Tab switching
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Product description hint
  $('product').addEventListener('change', e => {
    const p = WF_DATA.products[e.target.value];
    $('productMeta').textContent = p
      ? `${p.description} — Base: ${p.baseFootprint.toLocaleString()} L/kg`
      : '';
  });

  // Quick yield buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => { $('yieldKg').value = btn.dataset.val; });
  });

  // Form submit
  $('calculatorForm').addEventListener('submit', e => {
    e.preventDefault();
    calculate();
  });

  // Reset
  $('btnReset').addEventListener('click', () => {
    $('calculatorForm').reset();
    $('productMeta').textContent = '';
    $('resultsEmpty').hidden = false;
    $('resultsContent').hidden = true;
    lastResult = null;
  });

  // Copy
  $('btnCopyResult').addEventListener('click', copyResult);
}

/* ============================================================
   CALCULATION ENGINE
   ============================================================ */
function calculate() {
  const productKey    = $('product').value;
  const yieldKg       = parseFloat($('yieldKg').value);
  const climateKey    = $('climate').value;
  const irrigationKey = $('irrigation').value;
  const soilKey       = $('soil').value;
  const seasonKey     = $('season').value;

  const errEl = $('formError');
  if (!productKey || !yieldKg || !climateKey || !irrigationKey || !soilKey || !seasonKey) {
    errEl.textContent = 'Please fill in all fields before calculating.';
    errEl.hidden = false;
    return;
  }
  errEl.hidden = true;

  const product    = WF_DATA.products[productKey];
  const climate    = WF_DATA.climateMultipliers[climateKey];
  const irrigation = WF_DATA.irrigationMultipliers[irrigationKey];
  const soil       = WF_DATA.soilMultipliers[soilKey];
  const season     = WF_DATA.seasonMultipliers[seasonKey];

  const combinedMultiplier = climate.multiplier * irrigation.multiplier * soil.multiplier * season.multiplier;
  const adjustedPerKg      = Math.round(product.baseFootprint * combinedMultiplier);

  const totalBase    = product.green + product.blue + product.grey;
  const adjustedGreen = Math.round((product.green / totalBase) * adjustedPerKg);
  const adjustedBlue  = Math.round((product.blue  / totalBase) * adjustedPerKg);
  const adjustedGrey  = Math.round((product.grey  / totalBase) * adjustedPerKg);
  const totalLitres   = Math.round(adjustedPerKg * yieldKg);

  lastResult = {
    productKey, product, yieldKg,
    climateKey, climate,
    irrigationKey, irrigation,
    soilKey, soil,
    seasonKey, season,
    combinedMultiplier,
    adjustedPerKg,
    adjustedGreen, adjustedBlue, adjustedGrey,
    totalLitres
  };

  renderResults(lastResult);
}

/* ============================================================
   RENDER RESULTS
   ============================================================ */
function renderResults(r) {
  $('resultsEmpty').hidden = true;
  $('resultsContent').hidden = false;

  // Hero card
  $('rCropIcon').textContent    = r.product.icon;
  $('rCropName').textContent    = r.product.label;
  $('rCropSub').textContent     = r.product.category;
  $('rTotalLitres').textContent = fmt(r.totalLitres);
  $('rYieldDisplay').textContent= fmtYield(r.yieldKg);
  $('rPerKg').textContent       = fmt(r.adjustedPerKg);

  // Water bars
  const barsEl = $('waterBars');
  barsEl.innerHTML = '';
  const total = r.adjustedGreen + r.adjustedBlue + r.adjustedGrey;
  [
    { label:'Green Water (Rain)',      value:r.adjustedGreen, cls:'green' },
    { label:'Blue Water (Irrigation)', value:r.adjustedBlue,  cls:'blue'  },
    { label:'Grey Water (Pollution)',  value:r.adjustedGrey,  cls:'grey'  }
  ].forEach(b => {
    const pct = total > 0 ? Math.round((b.value / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'water-bar-row';
    row.innerHTML = `
      <div class="water-bar-label">
        <span>${b.label}</span>
        <span>${fmt(b.value)} L/kg (${pct}%)</span>
      </div>
      <div class="water-bar-track">
        <div class="water-bar-fill ${b.cls}" style="width:0%" data-pct="${pct}"></div>
      </div>`;
    barsEl.appendChild(row);
  });
  // Animate after paint
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll('.water-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  }));

  // Conditions
  const cg = $('conditionsGrid');
  cg.innerHTML = '';
  [
    { label:'Climate',    value:r.climate.label,    mult:r.climate.multiplier    },
    { label:'Irrigation', value:r.irrigation.label, mult:r.irrigation.multiplier },
    { label:'Soil',       value:r.soil.label,       mult:r.soil.multiplier       },
    { label:'Season',     value:r.season.label,     mult:r.season.multiplier     }
  ].forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'condition-chip';
    const tag = c.mult === 1
      ? '✓ Baseline'
      : c.mult < 1
        ? `↓ ×${c.mult} (saves water)`
        : `↑ ×${c.mult} (uses more)`;
    chip.innerHTML = `
      <span class="chip-label">${c.label}</span>
      <span class="chip-value">${c.value}</span>
      <span class="chip-mult">${tag}</span>`;
    cg.appendChild(chip);
  });

  // Real-world comparisons
  renderComparisons(r.totalLitres);
}

function renderComparisons(litres) {
  const grid = $('comparisonsGrid');
  grid.innerHTML = '';
  [
    { icon:'🛁', value: +(litres / 150).toFixed(1),           label:'standard bathtubs (150 L)' },
    { icon:'🚿', value: +(litres / 65).toFixed(1),            label:'8-min showers (65 L each)' },
    { icon:'🍶', value: fmt(litres),                           label:'one-litre water bottles' },
    { icon:'🏊', value: +(litres / 2500000).toFixed(4),       label:'Olympic swimming pools (2.5 ML)' },
    { icon:'🚰', value: +(litres / 50).toFixed(1),            label:"person-days of drinking water" },
    { icon:'🌍', value: (litres / 3.785e12).toExponential(2), label:'of global daily freshwater use' }
  ].forEach(c => {
    const item = document.createElement('div');
    item.className = 'comparison-item';
    item.innerHTML = `
      <span class="comp-icon">${c.icon}</span>
      <span class="comp-value">${c.value}</span>
      <span class="comp-label">${c.label}</span>`;
    grid.appendChild(item);
  });
}

/* ============================================================
   COPY RESULT
   ============================================================ */
function copyResult() {
  if (!lastResult) return;
  const r = lastResult;
  const text = [
    'AquaTrace — Water Footprint Result',
    `Crop: ${r.product.label}`,
    `Yield: ${fmtYield(r.yieldKg)}`,
    `Total Water Footprint: ${fmt(r.totalLitres)} litres`,
    `Per kg (adjusted): ${fmt(r.adjustedPerKg)} L/kg`,
    `Green: ${fmt(r.adjustedGreen)} L/kg | Blue: ${fmt(r.adjustedBlue)} L/kg | Grey: ${fmt(r.adjustedGrey)} L/kg`,
    '',
    'Conditions Applied:',
    `  Climate: ${r.climate.label} (×${r.climate.multiplier})`,
    `  Irrigation: ${r.irrigation.label} (×${r.irrigation.multiplier})`,
    `  Soil: ${r.soil.label} (×${r.soil.multiplier})`,
    `  Season: ${r.season.label} (×${r.season.multiplier})`,
    `  Combined multiplier: ×${r.combinedMultiplier.toFixed(3)}`,
    '',
    'Data: Mekonnen & Hoekstra (2011), Water Footprint Network, FAO AQUASTAT'
  ].join('\n');

  navigator.clipboard.writeText(text)
    .then(() => showToast('📋 Result copied to clipboard!'))
    .catch(() => showToast('Copy failed — please select and copy manually.'));
}

/* ============================================================
   UTILS
   ============================================================ */
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits:2 }) + 'M';
  if (n >= 1_000)     return n.toLocaleString();
  return (+n).toLocaleString(undefined, { maximumFractionDigits:2 });
}

function fmtYield(kg) {
  return kg >= 1000
    ? `${(kg/1000).toLocaleString(undefined,{maximumFractionDigits:2})} tonnes`
    : `${kg.toLocaleString()} kg`;
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
