const topics = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'tourism', label: 'Tourism' },
	{ id: 'economy', label: 'Economy' },
	{ id: 'energy', label: 'Energy' },
	{ id: 'environment', label: 'Environment' },
	{ id: 'military', label: 'Military' },
	{ id: 'demographics', label: 'Demographics' },
	{ id: 'health', label: 'Health' }
];

const countryData = {
	metadata: {
		name: 'France',
		population: 67000000,
		gdp: 3000000000000,
		area: 640679
	},
	overview: {
		countryInfo: {
			capital: 'Tokyo',
			largestCity: 'Tokyo',
			language: 'Japanese (official)',
			currency: 'Japanese Yen',
			drivingSide: 'Left',
			nationalDay: 'February 11'
		},
		government: {
			type: 'Constitutional Monarchy',
			headOfState: 'Emperor Naruhito',
			headOfGov: 'PM Shigeru Ishiba',
			legislature: 'National Diet (Bicameral)'
		},
		religions: [
			{
				name: 'Shinto',
				percentage: 70
			},
			{
				name: 'Shinto',
				percentage: 40
			},
			{
				name: 'Shinto',
				percentage: 10
			},
			{
				name: 'Shinto',
				percentage: 10
			}
		]
	},
	economy: {
		gdpTrend: {
			value: '31.9M',
			change: '12.4%',
			graph: '' // placeholder for graph data
		},
		worldRank: '€12.4B',
		perCapitaGDP: '#11',
		inflation: '€12.4B',
		unemployment: '#11',
		economicSectors: {
			services: 12.1,
			industry: 58.5,
			agriculture: 29.4
		},
		trade: {
			exports: '31.9M',
			imports: '31.9M',
			tradeBalance: '31.9M',

			exportVanities: ['Valid passport', 'Return ticket', 'Accommodation proof']
		},
		businessEnvironment: {
			easeOfDoingBusiness: '31.9M',
			corruptionPerceptionsIndex: '31.9M',
			globalCompetitivenessIndex: '31.9M',
			globalInnovationIndex: '31.9M',
			majorCompanies: ['Company s', 'Company Name', 'Company Name', 'Company Name']
		},
		labourMarket: {
			workforce: '68.9M',
			avgSalary: '$3,456/month',
			minWage: '$12.4/hr',
			workWeek: '40 hours'
		}
	},
	energy: {
		renewableGrowth: 22.4,
		renewablePercentage: 45.3,
		totalProduction: '500 TWh',
		totalConsumption: '480 TWh',
		CO2Emissions: '300 Mt',
		production: {
			renewable: 45.3,
			fossil: 40.2,
			nuclear: 14.5
		},
		consumption: {
			residential: 30.1,
			commercial: 25.4,
			industrial: 20.3,
			transportation: 24.2
		},
		renewableSources: {
			solar: 15.2,
			wind: 20.1,
			hydro: 10.0
		},
		infrastructure: {
			powerPlants: 150,
			transmissionLines: '100,000 km',
			substations: 500
		},
		energyImports: '20%',
		energyExports: '10%',
		energyPolicies: {},
		climateTargets: {
			CO2Reduction: '50% by 2030',
			netZero: '2050'
		}
	},
	environment: {
		forestCoverage: '68.4%',
		protectedAreas: '20.5%',
		airQuality: 'Good (AQI: 42)',
		waterAccess: '99%',
		recyclingRate: '20%',
		co2: {
			co2PerCapita: '8.5 tonnes',
			totalEmissions: '1.03B tonnes',
			worldRank: 5
		},
		biodiversity: {
			species: '90,000+',
			endemic: '~40%',
			threatened: '1,369 species'
		},
		naturalHazards: ['Earthquakes', 'Typhoons', 'Tsunamis', 'Volcanos'],
		envPerformance: {
			rank: 12,
			score: '75.1/100'
		}
	},
	military: {
		defenseBudget: 31.9,
		budgetChange: 12.4,
		globalRank: 11,
		gdpPercent: 4.2,
		personnel: 500000,
		reserve: 200000,
		miliatryBranch: {
			Army: 90,
			Navy: 60,
			AirForce: 80
		},
		militaryEquipment: {
			Tanks: 500,
			FighterJets: 200,
			NavalShips: 50
		},
		alliances: ['Alliance A', 'Alliance B', 'Alliance C'],
		organizations: ['UN', 'NATO', 'ASEAN'],
		capabilities: {
			'Nuclear weapons': 80,
			'Space program': 'JAXA',
			'Cyber command': 'Established',
			'Misslie defense': 'Aegis, SM-3'
		},
		trend: {
			status: 'Increasing',
			note: 'Highest in Asia after China'
		}
	},
	demographics: {
		population: {
			value: '125.7M',
			growthRate: '-0.3',
			rank: 11
		},

		density: '333/km²',
		urbanization: '91.8',

		medianAge: '48.6 years',
		ageDistribution: [
			{ group: '0-14', percentage: 12.1, label: 'Children', color: 'black' },
			{ group: '15-64', percentage: 58.5, label: 'Working Age', color: 'red' },
			{ group: '65+', percentage: 29.4, label: 'Elderly', color: 'orange' }
		],
		ethnicGroups: [
			{ name: 'Japanese', percentage: 97.5 },
			{ name: 'Chinese', percentage: 0.6 },
			{ name: 'Korean', percentage: 0.4 },
			{ name: 'Other', percentage: 1.5 }
		],
		literacy: '99',
		lifeExpectancy: {
			total: '84.6 years',
			male: '81.6 years',
			female: '87.7 years',
			rank: 1
		},
		health: {
			healthcareSpending: '10.9% of GDP',
			hospitalBeds: '13.0 per 1,000',
			physicians: '2.5 per 1,000',
			infantMortality: '1.8 per 1,000',
			healthcareRank: 4,
			majorCauses: ['Cancer', 'Heart Disease', 'Stroke'],
			vaccination: [
				{ label: 'vaccinationRate', value: '82%' },
				{ label: 'covidVaccinated', value: '83%' }
			]
		}
	}
};

export const load = () => {
	return {
		msg: 'hi'
	};
};
