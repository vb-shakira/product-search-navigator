export type ProductDoc = {
  id: string;
  text: string;
  metadata: {
    category: string;
    product: string;
    brand: string;
    price: number;
  };
};

export const CATEGORIES = [
  "Laptops",
  "Audio",
  "Wearables",
  "Cameras",
  "Home Office",
  "Kitchen",
] as const;

export const PRODUCT_DOCS: ProductDoc[] = [
  {
    id: "doc-001",
    text: "The Aurora 14 Pro laptop pairs a 14-inch OLED display with a 12-core processor and 32GB of unified memory, delivering 18 hours of battery life for developers and designers who compile and render on the move.",
    metadata: { category: "Laptops", product: "Aurora 14 Pro", brand: "Nimbus", price: 1899 },
  },
  {
    id: "doc-002",
    text: "Vertex Book Air is an ultralight 1.1kg aluminium laptop with a fanless silent design, 16GB memory and a matte anti-glare screen, built for students and frequent travellers on long flights.",
    metadata: { category: "Laptops", product: "Vertex Book Air", brand: "Vertex", price: 1099 },
  },
  {
    id: "doc-003",
    text: "The Forge X16 gaming laptop runs a desktop-class GPU with vapour chamber cooling, a 240Hz display and per-key RGB lighting for competitive esports and 3D workloads.",
    metadata: { category: "Laptops", product: "Forge X16", brand: "Forge", price: 2499 },
  },
  {
    id: "doc-004",
    text: "EchoBuds Pro are wireless earbuds with adaptive active noise cancellation, spatial audio and a compact charging case that provides 30 hours of total playback for commuters.",
    metadata: { category: "Audio", product: "EchoBuds Pro", brand: "Echo", price: 229 },
  },
  {
    id: "doc-005",
    text: "The Cadence Studio headphones are over-ear reference monitors with a planar magnetic driver, replaceable velour pads and a detachable balanced cable for mixing and mastering.",
    metadata: { category: "Audio", product: "Cadence Studio", brand: "Cadence", price: 479 },
  },
  {
    id: "doc-006",
    text: "BassCube Go is a rugged waterproof portable speaker with a 24-hour battery, stereo pairing and a carabiner strap designed for hiking, beach trips and outdoor parties.",
    metadata: { category: "Audio", product: "BassCube Go", brand: "Echo", price: 129 },
  },
  {
    id: "doc-007",
    text: "The Pulse Fit 3 smartwatch tracks heart rate variability, blood oxygen and sleep stages, with built-in GPS for running and a five-day battery on a lightweight titanium case.",
    metadata: { category: "Wearables", product: "Pulse Fit 3", brand: "Pulse", price: 349 },
  },
  {
    id: "doc-008",
    text: "Stride Band Lite is a slim fitness tracker focused on step counting, sleep quality and gentle wake alarms, waterproof for swimming and lasting two weeks per charge.",
    metadata: { category: "Wearables", product: "Stride Band Lite", brand: "Stride", price: 79 },
  },
  {
    id: "doc-009",
    text: "The Lumen R7 mirrorless camera features a 45-megapixel full-frame sensor, in-body stabilisation and 8K video recording for wedding photographers and documentary filmmakers.",
    metadata: { category: "Cameras", product: "Lumen R7", brand: "Lumen", price: 3199 },
  },
  {
    id: "doc-010",
    text: "PocketCam Action 5 is a thumb-sized waterproof action camera with horizon levelling, magnetic mounts and 4K120 slow motion capture for cycling and surfing.",
    metadata: { category: "Cameras", product: "PocketCam Action 5", brand: "Pocket", price: 289 },
  },
  {
    id: "doc-011",
    text: "The Meridian Standing Desk offers a dual-motor electric lift, four memory presets and a solid bamboo top rated for 120kg, reducing back strain during long working days.",
    metadata: { category: "Home Office", product: "Meridian Standing Desk", brand: "Meridian", price: 649 },
  },
  {
    id: "doc-012",
    text: "ErgoLift Task Chair provides adjustable lumbar support, a breathable mesh back and 4D armrests, engineered for eight-hour desk sessions and small home office spaces.",
    metadata: { category: "Home Office", product: "ErgoLift Task Chair", brand: "Meridian", price: 419 },
  },
  {
    id: "doc-013",
    text: "The ClearView 27 monitor is a 4K IPS panel with 99% sRGB coverage, USB-C 90W charging and a single-cable docking workflow for laptops on a tidy desk.",
    metadata: { category: "Home Office", product: "ClearView 27", brand: "Lumen", price: 549 },
  },
  {
    id: "doc-014",
    text: "Barista One espresso machine uses a PID-controlled boiler, 9-bar pump and pressurised portafilter to pull cafe-quality shots, with a built-in conical burr grinder.",
    metadata: { category: "Kitchen", product: "Barista One", brand: "Barista", price: 899 },
  },
  {
    id: "doc-015",
    text: "The SousVide Mini circulator heats water precisely to 0.1 degrees for tender steak and slow-cooked eggs, controlled from a phone app with recipe timers.",
    metadata: { category: "Kitchen", product: "SousVide Mini", brand: "Barista", price: 149 },
  },
  {
    id: "doc-016",
    text: "BladeMax Blender delivers 1500 watts of power with stainless steel blades and a noise-damping hood, crushing ice and frozen fruit into smooth protein shakes.",
    metadata: { category: "Kitchen", product: "BladeMax Blender", brand: "Blade", price: 199 },
  },
];
