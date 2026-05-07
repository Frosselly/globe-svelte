# Front

Need to do:

- [ ] Adjust compare diagram length
- [ ] Give ability to change selected value show in analysis mode
- [ ] Country search
- [ ] Option search
- [ ] Fully realise the layout in the sidebar
  - [ ] Add color to sidebar
  - [ ] Select global font to use
  - [ ] Add missing icons
- [ ] Create the comparison to use
- [ ] Create toggle analysis and map
- [ ] Add data display in a table with export
- [ ] Adjust all the layout based on general design from claude
- [ ] Add loaders
  - [ ] Map
  - [ ] Analysis
  - [ ] AI chat
  - [ ] Searching

Missing global elements:

- [x] icons
- [ ] graphs
- [x] progress bars
- [ ] global variables
- [ ] color code (positive, average, warning)
- [ ] special cards
- [ ] font selected
- [ ] better some lists

Design these sections:

- [ ] Demographics
- [ ] Health
- [ ] Environment

Add fake data for now in:

- [x] Tourism
- [x] Economy
- [x] Energy
- [x] Military
- [ ] Demographics
- [ ] Health
- [ ] Environment

# Back

## Get real data to test for these topics:

- [ ] Demograthics
  - population (now, trend, over teh years) - WB
  - density - Population density (people per sq. km of land area) WB
  - urbanization - WB
  - medianAge -
  - ageDistribution
  - ethnicGroups - CIA FACTBOOK
  - literacy - WB
  - lifeExpectancy - WHO or idk
  - health
    - healthcareSpending
    - hospitalBeds
    - physicians - very small set
    - infantMortality
    - healthcareRank
    - majorCauses
    - vaccination
- [x] _Tourism_
  - Annual visitors (now, trend, over teh years)
  - Revenue from visitors
  - Ranking in tourism
  - Unesco heritage sites
  - Visa requirements (max stay, and other)
  - Safetey score
  - Daily budget: avg, food, accommodiation, transport, activities
  - Best time to visit (months, season offer, peak event)
  - Practical info (language, timezone, plug type, internet speed)
- [x] _Economy_
  - GDP trend (current, trend, over the years)
  - World rank in economy
  - Per capita GDP
  - Inflation
  - Unemployment rank in the whole world
  - Economical sectors (how much each sector takes precentage)
  - Trade (exports, imports, trade balance)
  - Top exported goods
  - Business environment (Ease of Doing Business, Global Competitiveness Index, Corruption Perceptions Index, Global Innovation Index)
  - Major companies
  - Labour market (workforce generated cash, avg. salary, min wage, work week)
- [x] _Energy_
  - Renewable growth (now, trend, over the years)
  - Production
  - Consumption
  - CO2 Emissions
  - Energy mix (precentage of each)
  - Renewable sources (precentage of each)
  - Infrastructure (what generates energy short facts) _Add later_
  - Climate and energy targets _Add later_
- [x] _Military_
  - Defense budget (now, trend, over the years)
  - Global rank in military
  - % of GDP in military
  - Total personell
  - reserve personell
  - military branches and numbers _Add later_
  - Miliatry equipment/arsenal _Add later_
  - Alliances _Add later_
  - Part of global organizations
  - Capabilities (some facts) _Add later_
  - Defense spending trend (some comparison)

## Data left to fill or discard:

Tourism:

- [ ] calculate percentage of GDP using country metadata gdp
- [ ] add daily budget or use current (only containes travel and services)

Economy

- [ ] fix economical sectors to equal a 100
- [ ] handle businessEnvironment to be same values current from Arubia:
      "businessEnvironment": {
      "globalInnovationIndex": null,
      "easeOfDoingBusiness": "undefined",
      "globalCompetitivenessIndex": 0,
      "corruptionPerceptionsIndex": 0
      }
- [ ] if budget or main thing for some topic is missing say "Missing data" or "No data" for whole topic
- [ ] fix protected areas current:
      "protectedAreas": [
      {},
      {},
      {},
      {},
      {}
      ]
- [ ] remove null data in historical:
      {
      "year": 2018,
      "value": [
      {
      "name": "Other renewables",
      "percentage": null
      },
      {
      "name": "Biofuels",
      "percentage": null
      },}
