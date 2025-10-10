/* * */

export const EXCEPTION_TYPES = [
	//

	{ comment: 'Apenas às segundas-feiras', index: '1', week_pattern: ['1'] },
	{ comment: 'Apenas às terças-feiras', index: '2', week_pattern: ['2'] },
	{ comment: 'Apenas às quartas-feiras', index: '3', week_pattern: ['3'] },
	{ comment: 'Apenas às quintas-feiras', index: '4', week_pattern: ['4'] },
	{ comment: 'Apenas às sextas-feiras', index: '5', week_pattern: ['5'] },
	{ comment: 'Apenas aos sábados', index: '6', week_pattern: ['6'] },
	{ comment: 'Apenas aos domingos', index: '7', week_pattern: ['7'] },

	{ comment: 'Segundas e terças-feiras', index: '10', week_pattern: ['1', '2'] },
	{ comment: 'Segundas e quartas-feiras', index: '11', week_pattern: ['1', '3'] },
	{ comment: 'Segundas e quintas-feiras', index: '12', week_pattern: ['1', '4'] },
	{ comment: 'Segundas e sextas-feiras', index: '13', week_pattern: ['1', '5'] },
	{ comment: 'Segundas e sábados', index: '14', week_pattern: ['1', '6'] },
	{ comment: 'Segundas e domingos', index: '15', week_pattern: ['1', '7'] },

	{ comment: 'Terças e quartas-feiras', index: '20', week_pattern: ['2', '3'] },
	{ comment: 'Terças e quintas-feiras', index: '21', week_pattern: ['2', '4'] },
	{ comment: 'Terças e sextas-feiras', index: '22', week_pattern: ['2', '5'] },
	{ comment: 'Terças e sábados', index: '23', week_pattern: ['2', '6'] },
	{ comment: 'Terças e domingos', index: '24', week_pattern: ['2', '7'] },

	{ comment: 'Quartas e quintas-feiras', index: '30', week_pattern: ['3', '4'] },
	{ comment: 'Quartas e sextas-feiras', index: '31', week_pattern: ['3', '5'] },
	{ comment: 'Quartas e sábados', index: '32', week_pattern: ['3', '6'] },
	{ comment: 'Quartas e domingos', index: '33', week_pattern: ['3', '7'] },

	{ comment: 'Quintas e sextas-feiras', index: '40', week_pattern: ['4', '5'] },
	{ comment: 'Quintas e sábados', index: '41', week_pattern: ['4', '6'] },
	{ comment: 'Quintas e domingos', index: '42', week_pattern: ['4', '7'] },

	{ comment: 'Sextas e sábados', index: '50', week_pattern: ['5', '6'] },
	{ comment: 'Sextas e domingos', index: '51', week_pattern: ['5', '7'] },

	{ comment: 'Segundas, terças e quartas-feiras', index: '100', week_pattern: ['1', '2', '3'] },
	{ comment: 'Segundas, terças e quintas-feiras', index: '101', week_pattern: ['1', '2', '4'] },
	{ comment: 'Segundas, terças e sextas-feiras', index: '102', week_pattern: ['1', '2', '5'] },
	{ comment: 'Segundas, terças e sábados', index: '103', week_pattern: ['1', '2', '6'] },
	{ comment: 'Segundas, terças e domingos', index: '104', week_pattern: ['1', '2', '7'] },

	{ comment: 'Segundas, quartas e quintas-feiras', index: '110', week_pattern: ['1', '3', '4'] },
	{ comment: 'Segundas, quartas e sextas-feiras', index: '111', week_pattern: ['1', '3', '5'] },
	{ comment: 'Segundas, quartas e sábados', index: '112', week_pattern: ['1', '3', '6'] },
	{ comment: 'Segundas, quartas e domingos', index: '113', week_pattern: ['1', '3', '7'] },

	{ comment: 'Segundas, quintas e sextas-feiras', index: '120', week_pattern: ['1', '4', '5'] },
	{ comment: 'Segundas, quintas e sábados', index: '121', week_pattern: ['1', '4', '6'] },
	{ comment: 'Segundas, quintas e domingos', index: '122', week_pattern: ['1', '4', '7'] },

	{ comment: 'Segundas, sextas e sábados', index: '130', week_pattern: ['1', '5', '6'] },
	{ comment: 'Segundas, sextas e domingos', index: '131', week_pattern: ['1', '5', '7'] },

	{ comment: 'Segundas, sábados e domingos', index: '140', week_pattern: ['1', '6', '7'] },

	{ comment: 'Terças, quartas e quintas-feiras', index: '200', week_pattern: ['2', '3', '4'] },
	{ comment: 'Terças, quartas e sextas-feiras', index: '201', week_pattern: ['2', '3', '5'] },
	{ comment: 'Terças, quartas e sábados', index: '202', week_pattern: ['2', '3', '6'] },
	{ comment: 'Terças, quartas e domingos', index: '203', week_pattern: ['2', '3', '7'] },

	{ comment: 'Terças, quintas e sextas-feiras', index: '210', week_pattern: ['2', '4', '5'] },
	{ comment: 'Terças, quintas e sábados', index: '211', week_pattern: ['2', '4', '6'] },
	{ comment: 'Terças, quintas e domingos', index: '212', week_pattern: ['2', '4', '7'] },

	{ comment: 'Terças, sextas e sábados', index: '220', week_pattern: ['2', '5', '6'] },
	{ comment: 'Terças, sextas e domingos', index: '221', week_pattern: ['2', '5', '7'] },

	{ comment: 'Terças, sábados e domingos', index: '230', week_pattern: ['2', '6', '7'] },

	{ comment: 'Quartas, quintas e sextas-feiras', index: '300', week_pattern: ['3', '4', '5'] },
	{ comment: 'Quartas, quintas e sábados', index: '301', week_pattern: ['3', '4', '6'] },
	{ comment: 'Quartas, quintas e domingos', index: '302', week_pattern: ['3', '4', '7'] },

	{ comment: 'Quartas, sextas e sábados', index: '310', week_pattern: ['3', '5', '6'] },
	{ comment: 'Quartas, sextas e domingos', index: '311', week_pattern: ['3', '5', '7'] },

	{ comment: 'Quartas, sábados e domingos', index: '320', week_pattern: ['3', '6', '7'] },

	{ comment: 'Quintas, sextas e sábados', index: '400', week_pattern: ['4', '5', '6'] },
	{ comment: 'Quintas, sextas e domingos', index: '401', week_pattern: ['4', '5', '7'] },

	{ comment: 'Quintas, sábados e domingos', index: '410', week_pattern: ['4', '6', '7'] },

	{ comment: 'Sextas, sábados e domingos', index: '500', week_pattern: ['5', '6', '7'] },

	//
];
