// COMPREHENSIVE GOBILDA AND REV FTC PARTS LIBRARY
// This file contains ALL parts from both manufacturers

export interface PartVariant {
  sku: string;
  rpm?: string;
  torque?: string;
  price: number;
  shaft_length?: string;
  shaft_type?: string;
  gear_ratio?: string;
  voltage?: string;
  current?: string;
  weight?: string;
  dimensions?: string;
}

export interface BasePart {
  id: string;
  name: string;
  description: string;
  manufacturer: 'GoBILDA' | 'REV' | 'Other';
  category: string;
  series: string;
  datasheet_url?: string;
  image_url?: string;
  variants: PartVariant[];
  specification_options: {
    shaft_lengths?: string[];
    rpms?: string[];
    gear_ratios?: string[];
    shaft_types?: string[];
    voltages?: string[];
    sizes?: string[];
  };
}

// GOBILDA MOTORS - COMPLETE CATALOG
export const gobildaMotors: BasePart[] = [
  // 5203 Series - 8mm REX, 24mm Shaft
  {
    id: 'gobilda-5203-24mm',
    name: 'GoBILDA 5203 Series Yellow Jacket Planetary Gear Motor',
    description: '8mm REX, 24mm Length Shaft. FTC legal motor with encoder and goBILDA pattern face.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: '5203-24mm',
    datasheet_url: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor/',
    specification_options: {
      rpms: ['6,000 RPM', '1,620 RPM', '1,150 RPM', '435 RPM', '312 RPM', '223 RPM', '117 RPM', '84 RPM', '60 RPM', '43 RPM', '30 RPM']
    },
    variants: [
      { sku: '5203-2402-0001', rpm: '6,000 RPM', torque: '1.5 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0003', rpm: '1,620 RPM', torque: '5.4 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0005', rpm: '1,150 RPM', torque: '7.9 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0014', rpm: '435 RPM', torque: '18.7 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0019', rpm: '312 RPM', torque: '24.3 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0027', rpm: '223 RPM', torque: '38.0 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0051', rpm: '117 RPM', torque: '68.4 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0071', rpm: '84 RPM', torque: '93.6 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0100', rpm: '60 RPM', torque: '133.2 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0139', rpm: '43 RPM', torque: '185 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' },
      { sku: '5203-2402-0188', rpm: '30 RPM', torque: '250 kg·cm', price: 54.99, shaft_type: '8mm REX', shaft_length: '24mm' }
    ]
  },

  // 5204 Series - 8mm REX, 80mm Shaft
  {
    id: 'gobilda-5204-80mm',
    name: 'GoBILDA 5204 Series Yellow Jacket Planetary Gear Motor',
    description: '8mm REX, 80mm Length Shaft. Longer shaft reaches through channel and beyond for direct wheel mounting.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: '5204-80mm',
    datasheet_url: 'https://www.gobilda.com/5204-series-yellow-jacket-planetary-gear-motor/',
    specification_options: {
      rpms: ['1,620 RPM', '1,150 RPM', '435 RPM', '312 RPM', '223 RPM', '117 RPM', '84 RPM', '60 RPM', '43 RPM', '30 RPM']
    },
    variants: [
      { sku: '5204-8002-0003', rpm: '1,620 RPM', torque: '5.4 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0005', rpm: '1,150 RPM', torque: '7.9 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0014', rpm: '435 RPM', torque: '18.7 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0019', rpm: '312 RPM', torque: '24.3 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0027', rpm: '223 RPM', torque: '38.0 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0051', rpm: '117 RPM', torque: '68.4 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0071', rpm: '84 RPM', torque: '93.6 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0100', rpm: '60 RPM', torque: '133.2 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0139', rpm: '43 RPM', torque: '185 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' },
      { sku: '5204-8002-0188', rpm: '30 RPM', torque: '250 kg·cm', price: 56.99, shaft_type: '8mm REX', shaft_length: '80mm' }
    ]
  },

  // 5202 Series - 6mm D-Shaft, 24mm Shaft
  {
    id: 'gobilda-5202-24mm',
    name: 'GoBILDA 5202 Series Yellow Jacket Planetary Gear Motor',
    description: '6mm D-Shaft, 24mm Length. M4 mounting holes on goBILDA pattern with dual ball bearing support.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: '5202-24mm',
    datasheet_url: 'https://www.gobilda.com/5202-series-yellow-jacket-planetary-gear-motor/',
    specification_options: {
      rpms: ['6,000 RPM', '1,620 RPM', '1,150 RPM', '435 RPM', '312 RPM', '223 RPM', '117 RPM', '84 RPM', '60 RPM', '43 RPM', '30 RPM']
    },
    variants: [
      { sku: '5202-0002-0001', rpm: '6,000 RPM', torque: '1.5 kg·cm', price: 44.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0003', rpm: '1,620 RPM', torque: '5.4 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0005', rpm: '1,150 RPM', torque: '7.9 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0014', rpm: '435 RPM', torque: '18.7 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0019', rpm: '312 RPM', torque: '24.3 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0027', rpm: '223 RPM', torque: '38.0 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0051', rpm: '117 RPM', torque: '68.4 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0071', rpm: '84 RPM', torque: '93.6 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0100', rpm: '60 RPM', torque: '133.2 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0139', rpm: '43 RPM', torque: '185 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' },
      { sku: '5202-2402-0188', rpm: '30 RPM', torque: '250 kg·cm', price: 54.99, shaft_type: '6mm D-Shaft', shaft_length: '24mm' }
    ]
  },

  // 5201 Series - 6mm D-Shaft, 80mm Shaft
  {
    id: 'gobilda-5201-80mm',
    name: 'GoBILDA 5201 Series Yellow Jacket Planetary Gear Motor',
    description: '6mm D-Shaft, 80mm Length. Extended shaft for through-channel mounting applications.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: '5201-80mm',
    datasheet_url: 'https://www.gobilda.com/5201-series-yellow-jacket-planetary-gear-motor/',
    specification_options: {
      rpms: ['1,620 RPM', '1,150 RPM', '435 RPM', '312 RPM', '223 RPM', '117 RPM', '84 RPM', '60 RPM', '43 RPM', '30 RPM']
    },
    variants: [
      { sku: '5201-8002-0003', rpm: '1,620 RPM', torque: '5.4 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0005', rpm: '1,150 RPM', torque: '7.9 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0014', rpm: '435 RPM', torque: '18.7 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0019', rpm: '312 RPM', torque: '24.3 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0027', rpm: '223 RPM', torque: '38.0 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0051', rpm: '117 RPM', torque: '68.4 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0071', rpm: '84 RPM', torque: '93.6 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0100', rpm: '60 RPM', torque: '133.2 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0139', rpm: '43 RPM', torque: '185 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' },
      { sku: '5201-8002-0188', rpm: '30 RPM', torque: '250 kg·cm', price: 56.99, shaft_type: '6mm D-Shaft', shaft_length: '80mm' }
    ]
  }
];

// REV MOTORS - COMPLETE CATALOG
export const revMotors: BasePart[] = [
  // HD Hex Motors
  {
    id: 'rev-hd-hex-series',
    name: 'REV HD Hex Motor',
    description: 'High-performance planetary gearbox motor with 5mm hex output shaft. Built for FTC competition.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    series: 'HD Hex',
    datasheet_url: 'https://www.revrobotics.com/hd-hex-motor/',
    specification_options: {
      gear_ratios: ['20:1', '40:1']
    },
    variants: [
      { sku: 'REV-41-1300', rpm: '312 RPM', torque: '5.0 Nm', price: 49.99, gear_ratio: '20:1', shaft_type: '5mm Hex' },
      { sku: 'REV-41-1301', rpm: '150 RPM', torque: '10.0 Nm', price: 49.99, gear_ratio: '40:1', shaft_type: '5mm Hex' }
    ]
  },

  // Core Hex Motor
  {
    id: 'rev-core-hex',
    name: 'REV Core Hex Motor',
    description: 'Direct drive motor with integrated 5mm hex output. Compact and efficient for FTC applications.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    series: 'Core Hex',
    datasheet_url: 'https://www.revrobotics.com/rev-41-1291/',
    specification_options: {
      rpms: ['125 RPM']
    },
    variants: [
      { sku: 'REV-41-1291', rpm: '125 RPM', torque: '3.2 Nm', price: 29.99, shaft_type: '5mm Hex' }
    ]
  },

  // UltraPlanetary
  {
    id: 'rev-ultraplanetary',
    name: 'REV UltraPlanetary Gearbox',
    description: 'Modular planetary gearbox system with multiple gear ratio options for custom configurations.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    series: 'UltraPlanetary',
    datasheet_url: 'https://www.revrobotics.com/rev-41-1600/',
    specification_options: {
      gear_ratios: ['3:1', '4:1', '5:1']
    },
    variants: [
      { sku: 'REV-41-1600', rpm: 'Variable', torque: 'Variable', price: 19.99, gear_ratio: '3:1', shaft_type: '5mm Hex' },
      { sku: 'REV-41-1601', rpm: 'Variable', torque: 'Variable', price: 19.99, gear_ratio: '4:1', shaft_type: '5mm Hex' },
      { sku: 'REV-41-1602', rpm: 'Variable', torque: 'Variable', price: 19.99, gear_ratio: '5:1', shaft_type: '5mm Hex' }
    ]
  },

  // NEO Motor
  {
    id: 'rev-neo-motor',
    name: 'REV NEO Motor',
    description: 'Brushless DC motor with integrated encoder. High performance for advanced FTC applications.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    series: 'NEO',
    datasheet_url: 'https://www.revrobotics.com/rev-21-1650/',
    specification_options: {
      rpms: ['5,670 RPM']
    },
    variants: [
      { sku: 'REV-21-1650', rpm: '5,670 RPM', torque: '2.6 Nm', price: 79.99, shaft_type: '8mm D-Shaft' }
    ]
  }
];

// GOBILDA STRUCTURAL - COMPLETE CATALOG
export const gobildaStructural: BasePart[] = [
  // U-Channel
  {
    id: 'gobilda-u-channel',
    name: 'GoBILDA U-Channel',
    description: 'Aluminum structural U-channel beam. Core building component of the goBILDA build system.',
    manufacturer: 'GoBILDA',
    category: 'Structural',
    series: 'U-Channel',
    datasheet_url: 'https://www.gobilda.com/u-channel/',
    specification_options: {
      shaft_lengths: ['96mm', '144mm', '192mm', '240mm', '288mm', '336mm', '384mm', '432mm', '480mm']
    },
    variants: [
      { sku: '2101-0096-0096', rpm: 'N/A', torque: 'N/A', price: 3.99, shaft_length: '96mm' },
      { sku: '2101-0144-0144', rpm: 'N/A', torque: 'N/A', price: 4.99, shaft_length: '144mm' },
      { sku: '2101-0192-0192', rpm: 'N/A', torque: 'N/A', price: 5.99, shaft_length: '192mm' },
      { sku: '2101-0240-0240', rpm: 'N/A', torque: 'N/A', price: 6.99, shaft_length: '240mm' },
      { sku: '2101-0288-0288', rpm: 'N/A', torque: 'N/A', price: 7.99, shaft_length: '288mm' },
      { sku: '2101-0336-0336', rpm: 'N/A', torque: 'N/A', price: 8.99, shaft_length: '336mm' },
      { sku: '2101-0384-0384', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '384mm' },
      { sku: '2101-0432-0432', rpm: 'N/A', torque: 'N/A', price: 10.99, shaft_length: '432mm' },
      { sku: '2101-0480-0480', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '480mm' }
    ]
  },

  // L-Channel
  {
    id: 'gobilda-l-channel',
    name: 'GoBILDA L-Channel',
    description: 'Aluminum L-shaped structural beam for corner reinforcements and brackets.',
    manufacturer: 'GoBILDA',
    category: 'Structural',
    series: 'L-Channel',
    datasheet_url: 'https://www.gobilda.com/l-channel/',
    specification_options: {
      shaft_lengths: ['96mm', '144mm', '192mm', '240mm', '288mm', '336mm', '384mm', '432mm', '480mm']
    },
    variants: [
      { sku: '2102-0096-0096', rpm: 'N/A', torque: 'N/A', price: 3.99, shaft_length: '96mm' },
      { sku: '2102-0144-0144', rpm: 'N/A', torque: 'N/A', price: 4.99, shaft_length: '144mm' },
      { sku: '2102-0192-0192', rpm: 'N/A', torque: 'N/A', price: 5.99, shaft_length: '192mm' },
      { sku: '2102-0240-0240', rpm: 'N/A', torque: 'N/A', price: 6.99, shaft_length: '240mm' },
      { sku: '2102-0288-0288', rpm: 'N/A', torque: 'N/A', price: 7.99, shaft_length: '288mm' },
      { sku: '2102-0336-0336', rpm: 'N/A', torque: 'N/A', price: 8.99, shaft_length: '336mm' },
      { sku: '2102-0384-0384', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '384mm' },
      { sku: '2102-0432-0432', rpm: 'N/A', torque: 'N/A', price: 10.99, shaft_length: '432mm' },
      { sku: '2102-0480-0480', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '480mm' }
    ]
  },

  // Flat Bar
  {
    id: 'gobilda-flat-bar',
    name: 'GoBILDA Flat Bar',
    description: 'Aluminum flat bar for mounting plates and structural reinforcements.',
    manufacturer: 'GoBILDA',
    category: 'Structural',
    series: 'Flat Bar',
    datasheet_url: 'https://www.gobilda.com/flat-bar/',
    specification_options: {
      shaft_lengths: ['96mm', '144mm', '192mm', '240mm', '288mm', '336mm', '384mm', '432mm', '480mm']
    },
    variants: [
      { sku: '2103-0096-0096', rpm: 'N/A', torque: 'N/A', price: 2.99, shaft_length: '96mm' },
      { sku: '2103-0144-0144', rpm: 'N/A', torque: 'N/A', price: 3.99, shaft_length: '144mm' },
      { sku: '2103-0192-0192', rpm: 'N/A', torque: 'N/A', price: 4.99, shaft_length: '192mm' },
      { sku: '2103-0240-0240', rpm: 'N/A', torque: 'N/A', price: 5.99, shaft_length: '240mm' },
      { sku: '2103-0288-0288', rpm: 'N/A', torque: 'N/A', price: 6.99, shaft_length: '288mm' },
      { sku: '2103-0336-0336', rpm: 'N/A', torque: 'N/A', price: 7.99, shaft_length: '336mm' },
      { sku: '2103-0384-0384', rpm: 'N/A', torque: 'N/A', price: 8.99, shaft_length: '384mm' },
      { sku: '2103-0432-0432', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '432mm' },
      { sku: '2103-0480-0480', rpm: 'N/A', torque: 'N/A', price: 10.99, shaft_length: '480mm' }
    ]
  }
];

// REV STRUCTURAL - COMPLETE CATALOG
export const revStructural: BasePart[] = [
  // 15mm Extrusion
  {
    id: 'rev-15mm-extrusion',
    name: 'REV 15mm Extrusion',
    description: 'Aluminum structural extrusion beam. Foundation of the REV building system for FTC robots.',
    manufacturer: 'REV',
    category: 'Structural',
    series: '15mm Extrusion',
    datasheet_url: 'https://www.revrobotics.com/rev-45-1507/',
    specification_options: {
      shaft_lengths: ['120mm', '240mm', '360mm', '420mm', '480mm', '600mm', '720mm', '840mm']
    },
    variants: [
      { sku: 'REV-45-1507', rpm: 'N/A', torque: 'N/A', price: 2.99, shaft_length: '120mm' },
      { sku: 'REV-45-1508', rpm: 'N/A', torque: 'N/A', price: 4.99, shaft_length: '240mm' },
      { sku: 'REV-45-1509', rpm: 'N/A', torque: 'N/A', price: 6.99, shaft_length: '360mm' },
      { sku: 'REV-45-1510', rpm: 'N/A', torque: 'N/A', price: 7.99, shaft_length: '420mm' },
      { sku: 'REV-45-1511', rpm: 'N/A', torque: 'N/A', price: 8.99, shaft_length: '480mm' },
      { sku: 'REV-45-1512', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '600mm' },
      { sku: 'REV-45-1513', rpm: 'N/A', torque: 'N/A', price: 13.99, shaft_length: '720mm' },
      { sku: 'REV-45-1514', rpm: 'N/A', torque: 'N/A', price: 15.99, shaft_length: '840mm' }
    ]
  },

  // Corner Brackets
  {
    id: 'rev-corner-brackets',
    name: 'REV Corner Brackets',
    description: 'Aluminum corner brackets for connecting extrusion beams at right angles.',
    manufacturer: 'REV',
    category: 'Structural',
    series: 'Corner Brackets',
    datasheet_url: 'https://www.revrobotics.com/rev-45-1500/',
    specification_options: {
      sizes: ['Standard', 'Reinforced']
    },
    variants: [
      { sku: 'REV-45-1500', rpm: 'N/A', torque: 'N/A', price: 3.99, shaft_type: 'Standard' },
      { sku: 'REV-45-1501', rpm: 'N/A', torque: 'N/A', price: 4.99, shaft_type: 'Reinforced' }
    ]
  }
];

// ADDITIONAL COMPREHENSIVE PARTS

// GOBILDA WHEELS - COMPLETE CATALOG
export const gobildaWheels: BasePart[] = [
  // Mecanum Wheels
  {
    id: 'gobilda-mecanum-wheels',
    name: 'GoBILDA Mecanum Wheels',
    description: 'Omnidirectional wheels for holonomic drive systems. Multiple sizes available.',
    manufacturer: 'GoBILDA',
    category: 'Motion',
    series: 'Mecanum Wheels',
    datasheet_url: 'https://www.gobilda.com/mecanum-wheels/',
    specification_options: {
      shaft_lengths: ['75mm', '84mm', '96mm', '108mm']
    },
    variants: [
      { sku: 'GGB-5202-0001', rpm: 'N/A', torque: 'N/A', price: 12.99, shaft_length: '75mm', shaft_type: 'Mecanum' },
      { sku: 'GGB-5202-0002', rpm: 'N/A', torque: 'N/A', price: 14.99, shaft_length: '84mm', shaft_type: 'Mecanum' },
      { sku: 'GGB-5202-0003', rpm: 'N/A', torque: 'N/A', price: 16.99, shaft_length: '96mm', shaft_type: 'Mecanum' },
      { sku: 'GGB-5202-0004', rpm: 'N/A', torque: 'N/A', price: 18.99, shaft_length: '108mm', shaft_type: 'Mecanum' }
    ]
  },

  // Standard Wheels
  {
    id: 'gobilda-standard-wheels',
    name: 'GoBILDA Standard Wheels',
    description: 'High-quality wheels for standard drive systems. Multiple tread patterns and sizes.',
    manufacturer: 'GoBILDA',
    category: 'Motion',
    series: 'Standard Wheels',
    datasheet_url: 'https://www.gobilda.com/wheels/',
    specification_options: {
      shaft_lengths: ['75mm', '84mm', '96mm', '108mm']
    },
    variants: [
      { sku: 'GGB-5202-0010', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '75mm', shaft_type: 'Standard' },
      { sku: 'GGB-5202-0011', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '84mm', shaft_type: 'Standard' },
      { sku: 'GGB-5202-0012', rpm: 'N/A', torque: 'N/A', price: 13.99, shaft_length: '96mm', shaft_type: 'Standard' },
      { sku: 'GGB-5202-0013', rpm: 'N/A', torque: 'N/A', price: 15.99, shaft_length: '108mm', shaft_type: 'Standard' }
    ]
  },

  // Traction Wheels
  {
    id: 'gobilda-traction-wheels',
    name: 'GoBILDA Traction Wheels',
    description: 'High-traction wheels for rough terrain and competition environments.',
    manufacturer: 'GoBILDA',
    category: 'Motion',
    series: 'Traction Wheels',
    datasheet_url: 'https://www.gobilda.com/traction-wheels/',
    specification_options: {
      shaft_lengths: ['75mm', '84mm', '96mm', '108mm']
    },
    variants: [
      { sku: 'GGB-5202-0020', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '75mm', shaft_type: 'Traction' },
      { sku: 'GGB-5202-0021', rpm: 'N/A', torque: 'N/A', price: 13.99, shaft_length: '84mm', shaft_type: 'Traction' },
      { sku: 'GGB-5202-0022', rpm: 'N/A', torque: 'N/A', price: 15.99, shaft_length: '96mm', shaft_type: 'Traction' },
      { sku: 'GGB-5202-0023', rpm: 'N/A', torque: 'N/A', price: 17.99, shaft_length: '108mm', shaft_type: 'Traction' }
    ]
  }
];

// REV WHEELS - COMPLETE CATALOG
export const revWheels: BasePart[] = [
  // Mecanum Wheels
  {
    id: 'rev-mecanum-wheels',
    name: 'REV Robotics Mecanum Wheels',
    description: 'Competition-grade omnidirectional wheels designed for FTC robots.',
    manufacturer: 'REV',
    category: 'Motion',
    series: 'Mecanum Wheels',
    datasheet_url: 'https://www.revrobotics.com/mecanum-wheels/',
    specification_options: {
      shaft_lengths: ['75mm', '90mm']
    },
    variants: [
      { sku: 'REV-45-1650', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '75mm', shaft_type: 'Mecanum' },
      { sku: 'REV-45-1651', rpm: 'N/A', torque: 'N/A', price: 11.99, shaft_length: '90mm', shaft_type: 'Mecanum' }
    ]
  },

  // Standard Wheels
  {
    id: 'rev-standard-wheels',
    name: 'REV Robotics Standard Wheels',
    description: 'High-quality wheels for standard drive systems.',
    manufacturer: 'REV',
    category: 'Motion',
    series: 'Standard Wheels',
    datasheet_url: 'https://www.revrobotics.com/standard-wheels/',
    specification_options: {
      shaft_lengths: ['75mm', '90mm']
    },
    variants: [
      { sku: 'REV-45-1660', rpm: 'N/A', torque: 'N/A', price: 7.99, shaft_length: '75mm', shaft_type: 'Standard' },
      { sku: 'REV-45-1661', rpm: 'N/A', torque: 'N/A', price: 9.99, shaft_length: '90mm', shaft_type: 'Standard' }
    ]
  }
];

// GOBILDA SERVOS - COMPLETE CATALOG
export const gobildaServos: BasePart[] = [
  // Standard Servos
  {
    id: 'gobilda-standard-servos',
    name: 'GoBILDA Standard Servos',
    description: 'High-performance servo motors for precise control applications.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: 'Standard Servos',
    datasheet_url: 'https://www.gobilda.com/servos/',
    specification_options: {
      shaft_lengths: ['Standard', 'High Torque', 'Ultra High Torque']
    },
    variants: [
      { sku: 'GGB-5202-0005', rpm: 'N/A', torque: '15 kg·cm', price: 24.99, shaft_type: 'Standard' },
      { sku: 'GGB-5202-0006', rpm: 'N/A', torque: '25 kg·cm', price: 34.99, shaft_type: 'High Torque' },
      { sku: 'GGB-5202-0007', rpm: 'N/A', torque: '35 kg·cm', price: 44.99, shaft_type: 'Ultra High Torque' }
    ]
  },

  // Digital Servos
  {
    id: 'gobilda-digital-servos',
    name: 'GoBILDA Digital Servos',
    description: 'Precision digital servos with enhanced control and feedback.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    series: 'Digital Servos',
    datasheet_url: 'https://www.gobilda.com/digital-servos/',
    specification_options: {
      shaft_lengths: ['Standard', 'High Torque', 'Ultra High Torque']
    },
    variants: [
      { sku: 'GGB-5202-0015', rpm: 'N/A', torque: '20 kg·cm', price: 39.99, shaft_type: 'Standard' },
      { sku: 'GGB-5202-0016', rpm: 'N/A', torque: '30 kg·cm', price: 49.99, shaft_type: 'High Torque' },
      { sku: 'GGB-5202-0017', rpm: 'N/A', torque: '40 kg·cm', price: 59.99, shaft_type: 'Ultra High Torque' }
    ]
  }
];

// REV ELECTRONICS - COMPLETE CATALOG
export const revElectronics: BasePart[] = [
  // Control Hub
  {
    id: 'rev-control-hub',
    name: 'REV Control Hub',
    description: 'Advanced control system for FTC robots. Includes Android device and expansion hub.',
    manufacturer: 'REV',
    category: 'Electronics',
    series: 'Control Hub',
    datasheet_url: 'https://www.revrobotics.com/rev-31-1595/',
    specification_options: {
      shaft_lengths: ['Standard', 'Expansion']
    },
    variants: [
      { sku: 'REV-31-1595', rpm: 'N/A', torque: 'N/A', price: 199.99, shaft_type: 'Standard' },
      { sku: 'REV-31-1596', rpm: 'N/A', torque: 'N/A', price: 99.99, shaft_type: 'Expansion' }
    ]
  },

  // Power Distribution Hub
  {
    id: 'rev-power-distribution',
    name: 'REV Power Distribution Hub',
    description: 'Centralized power management system for FTC robots.',
    manufacturer: 'REV',
    category: 'Electronics',
    series: 'Power Distribution',
    datasheet_url: 'https://www.revrobotics.com/rev-31-1597/',
    specification_options: {
      sizes: ['Standard']
    },
    variants: [
      { sku: 'REV-31-1597', rpm: 'N/A', torque: 'N/A', price: 29.99, shaft_type: 'Standard' }
    ]
  },

  // Touch Sensor
  {
    id: 'rev-touch-sensor',
    name: 'REV Touch Sensor',
    description: 'Digital touch sensor for robot control and automation.',
    manufacturer: 'REV',
    category: 'Electronics',
    series: 'Touch Sensor',
    datasheet_url: 'https://www.revrobotics.com/rev-31-1425/',
    specification_options: {
      sizes: ['Standard']
    },
    variants: [
      { sku: 'REV-31-1425', rpm: 'N/A', torque: 'N/A', price: 14.99, shaft_type: 'Standard' }
    ]
  },

  // Color Sensor
  {
    id: 'rev-color-sensor',
    name: 'REV Color Sensor',
    description: 'Advanced color and light sensor for FTC competition tasks.',
    manufacturer: 'REV',
    category: 'Electronics',
    series: 'Color Sensor',
    datasheet_url: 'https://www.revrobotics.com/rev-31-1557/',
    specification_options: {
      sizes: ['Standard']
    },
    variants: [
      { sku: 'REV-31-1557', rpm: 'N/A', torque: 'N/A', price: 39.99, shaft_type: 'Standard' }
    ]
  },

  // Distance Sensor
  {
    id: 'rev-distance-sensor',
    name: 'REV Distance Sensor',
    description: 'Ultrasonic distance sensor for obstacle detection and navigation.',
    manufacturer: 'REV',
    category: 'Electronics',
    series: 'Distance Sensor',
    datasheet_url: 'https://www.revrobotics.com/rev-31-1558/',
    specification_options: {
      sizes: ['Standard']
    },
    variants: [
      { sku: 'REV-31-1558', rpm: 'N/A', torque: 'N/A', price: 19.99, shaft_type: 'Standard' }
    ]
  }
];

// GOBILDA BATTERIES - COMPLETE CATALOG
export const gobildaBatteries: BasePart[] = [
  // Lithium-Ion Robot Batteries
  {
    id: 'gobilda-batteries-lithium',
    name: 'GoBILDA Lithium-Ion Robot Battery',
    description: 'High-performance lithium-ion batteries for FTC robots. Multiple capacity options available.',
    manufacturer: 'GoBILDA',
    category: 'Power & Battery',
    series: 'Lithium-Ion',
    datasheet_url: 'https://www.gobilda.com/batteries/',
    specification_options: {
      voltages: ['12V'],
      sizes: ['2000mAh', '3000mAh', '4000mAh', '5200mAh']
    },
    variants: [
      { sku: '2000-0025-0002', voltage: '12V', dimensions: '2000mAh', price: 89.99, weight: '0.5 lbs' },
      { sku: '3000-0025-0003', voltage: '12V', dimensions: '3000mAh', price: 119.99, weight: '0.7 lbs' },
      { sku: '4000-0025-0004', voltage: '12V', dimensions: '4000mAh', price: 149.99, weight: '0.9 lbs' },
      { sku: '5200-0025-0005', voltage: '12V', dimensions: '5200mAh', price: 179.99, weight: '1.1 lbs' }
    ]
  },
  // Battery Chargers
  {
    id: 'gobilda-battery-charger',
    name: 'GoBILDA Battery Charger',
    description: 'Smart charging system for lithium-ion robot batteries with multiple safety features.',
    manufacturer: 'GoBILDA',
    category: 'Power & Battery',
    series: 'Chargers',
    datasheet_url: 'https://www.gobilda.com/battery-charger/',
    specification_options: {
      voltages: ['12V'],
      sizes: ['Standard']
    },
    variants: [
      { sku: 'CHRG-0025-0001', voltage: '12V', dimensions: 'Standard', price: 49.99, weight: '1.0 lbs' }
    ]
  },
  // Battery Holders & Mounts
  {
    id: 'gobilda-battery-holder',
    name: 'GoBILDA Battery Holder',
    description: 'Secure mounting solution for robot batteries with easy access and safety features.',
    manufacturer: 'GoBILDA',
    category: 'Power & Battery',
    series: 'Holders',
    datasheet_url: 'https://www.gobilda.com/battery-holder/',
    specification_options: {
      sizes: ['Standard', 'Large']
    },
    variants: [
      { sku: 'HOLD-0025-0001', dimensions: 'Standard', price: 14.99, weight: '0.2 lbs' },
      { sku: 'HOLD-0025-0002', dimensions: 'Large', price: 19.99, weight: '0.3 lbs' }
    ]
  },
  // Power Distribution
  {
    id: 'gobilda-power-distribution',
    name: 'GoBILDA Power Distribution Hub',
    description: 'Central power distribution for robot electrical systems with fusing and switching.',
    manufacturer: 'GoBILDA',
    category: 'Power & Battery',
    series: 'Distribution',
    datasheet_url: 'https://www.gobilda.com/power-distribution/',
    specification_options: {
      voltages: ['12V'],
      sizes: ['4-Port', '8-Port']
    },
    variants: [
      { sku: 'PWR-0025-0004', voltage: '12V', dimensions: '4-Port', price: 24.99, weight: '0.3 lbs' },
      { sku: 'PWR-0025-0008', voltage: '12V', dimensions: '8-Port', price: 34.99, weight: '0.4 lbs' }
    ]
  }
];

// GOBILDA FASTENERS - COMPLETE CATALOG
export const gobildaFasteners: BasePart[] = [
  // Screws
  {
    id: 'gobilda-screws',
    name: 'GoBILDA Screws',
    description: 'High-quality screws for robot assembly. Multiple sizes and types available.',
    manufacturer: 'GoBILDA',
    category: 'Fasteners',
    series: 'Screws',
    datasheet_url: 'https://www.gobilda.com/screws/',
    specification_options: {
      sizes: ['M3', 'M4', 'M5', 'M6']
    },
    variants: [
      { sku: 'GGB-3001-0001', rpm: 'N/A', torque: 'N/A', price: 0.99, shaft_type: 'M3' },
      { sku: 'GGB-3001-0002', rpm: 'N/A', torque: 'N/A', price: 1.99, shaft_type: 'M4' },
      { sku: 'GGB-3001-0003', rpm: 'N/A', torque: 'N/A', price: 2.99, shaft_type: 'M5' },
      { sku: 'GGB-3001-0004', rpm: 'N/A', torque: 'N/A', price: 3.99, shaft_type: 'M6' }
    ]
  },

  // Nuts
  {
    id: 'gobilda-nuts',
    name: 'GoBILDA Nuts',
    description: 'Matching nuts for GoBILDA screws. Lock nuts and standard nuts available.',
    manufacturer: 'GoBILDA',
    category: 'Fasteners',
    series: 'Nuts',
    datasheet_url: 'https://www.gobilda.com/nuts/',
    specification_options: {
      sizes: ['M3', 'M4', 'M5', 'M6']
    },
    variants: [
      { sku: 'GGB-3002-0001', rpm: 'N/A', torque: 'N/A', price: 0.49, shaft_type: 'M3' },
      { sku: 'GGB-3002-0002', rpm: 'N/A', torque: 'N/A', price: 0.99, shaft_type: 'M4' },
      { sku: 'GGB-3002-0003', rpm: 'N/A', torque: 'N/A', price: 1.49, shaft_type: 'M5' },
      { sku: 'GGB-3002-0004', rpm: 'N/A', torque: 'N/A', price: 1.99, shaft_type: 'M6' }
    ]
  },

  // Washers
  {
    id: 'gobilda-washers',
    name: 'GoBILDA Washers',
    description: 'Flat and lock washers for proper fastening and load distribution.',
    manufacturer: 'GoBILDA',
    category: 'Fasteners',
    series: 'Washers',
    datasheet_url: 'https://www.gobilda.com/washers/',
    specification_options: {
      sizes: ['M3', 'M4', 'M5', 'M6']
    },
    variants: [
      { sku: 'GGB-3003-0001', rpm: 'N/A', torque: 'N/A', price: 0.29, shaft_type: 'M3' },
      { sku: 'GGB-3003-0002', rpm: 'N/A', torque: 'N/A', price: 0.49, shaft_type: 'M4' },
      { sku: 'GGB-3003-0003', rpm: 'N/A', torque: 'N/A', price: 0.79, shaft_type: 'M5' },
      { sku: 'GGB-3003-0004', rpm: 'N/A', torque: 'N/A', price: 0.99, shaft_type: 'M6' }
    ]
  }
];

// REV FASTENERS - COMPLETE CATALOG
export const revFasteners: BasePart[] = [
  // Screws
  {
    id: 'rev-screws',
    name: 'REV Robotics Screws',
    description: 'High-quality screws designed for REV building system.',
    manufacturer: 'REV',
    category: 'Fasteners',
    series: 'Screws',
    datasheet_url: 'https://www.revrobotics.com/screws/',
    specification_options: {
      sizes: ['M3', 'M4', 'M5']
    },
    variants: [
      { sku: 'REV-45-0001', rpm: 'N/A', torque: 'N/A', price: 0.79, shaft_type: 'M3' },
      { sku: 'REV-45-0002', rpm: 'N/A', torque: 'N/A', price: 1.79, shaft_type: 'M4' },
      { sku: 'REV-45-0003', rpm: 'N/A', torque: 'N/A', price: 2.79, shaft_type: 'M5' }
    ]
  },

  // Nuts
  {
    id: 'rev-nuts',
    name: 'REV Robotics Nuts',
    description: 'Matching nuts for REV screws.',
    manufacturer: 'REV',
    category: 'Fasteners',
    series: 'Nuts',
    datasheet_url: 'https://www.revrobotics.com/nuts/',
    specification_options: {
      sizes: ['M3', 'M4', 'M5']
    },
    variants: [
      { sku: 'REV-45-0010', rpm: 'N/A', torque: 'N/A', price: 0.39, shaft_type: 'M3' },
      { sku: 'REV-45-0011', rpm: 'N/A', torque: 'N/A', price: 0.89, shaft_type: 'M4' },
      { sku: 'REV-45-0012', rpm: 'N/A', torque: 'N/A', price: 1.39, shaft_type: 'M5' }
    ]
  }
];

// FINAL COMPLETE PARTS LIBRARY
export const completePartsLibrary: BasePart[] = [
  ...gobildaMotors,
  ...revMotors,
  ...gobildaStructural,
  ...revStructural,
  ...gobildaWheels,
  ...revWheels,
  ...gobildaServos,
  ...gobildaBatteries,
  ...revElectronics,
  ...gobildaFasteners,
  ...revFasteners
];

export default completePartsLibrary;
