// UI Manager
class UIManager {
    constructor(game) {
        this.game = game;
        
        // Element references
        this.elements = {
            timeControls: document.getElementById('time-controls'),
            btnPause: document.getElementById('btn-pause'),
            btnPlay: document.getElementById('btn-play'),
            btnFast: document.getElementById('btn-fast'),
            ecosystemDisplay: document.getElementById('ecosystem-display'),
            settlementDisplay: document.getElementById('settlement-display'),
            environmentStats: document.getElementById('environment-stats'),
            resourceStats: document.getElementById('resource-stats'),
            populationStats: document.getElementById('population-stats'),
            technologyTree: document.getElementById('technology-tree'),
            eventLog: document.getElementById('event-log'),
            
            seasonValue: document.getElementById('season-value'),
            temperatureValue: document.getElementById('temperature-value'),
            weatherValue: document.getElementById('weather-value'),
            populationTotal: document.getElementById('population-total')
        };
        
        this.initializeUI();
    }
    
    initializeUI() {
        // Initialize time controls
        this.elements.btnPause.addEventListener('click', () => this.game.setSpeed(0));
        this.elements.btnPlay.addEventListener('click', () => this.game.setSpeed(1));
        this.elements.btnFast.addEventListener('click', () => this.game.setSpeed(2));
        
        // Initialize other UI elements
        this.buildResourceUI();
        this.buildPopulationUI();
        this.buildTechnologyUI();
        
        // Highlight the initial game speed
        this.updateSpeedControls(this.game.gameSpeed);
    }
    
    updateUI() {
        this.updateEnvironmentUI();
        this.updateResourceUI();
        this.updatePopulationUI();
        this.updateTechnologyUI();
        this.updateEcosystemDisplay();
        this.updateSettlementDisplay();
    }
    
    updateSpeedControls(speed) {
        // Remove active class from all buttons
        this.elements.btnPause.classList.remove('active');
        this.elements.btnPlay.classList.remove('active');
        this.elements.btnFast.classList.remove('active');
        
        // Add active class to current speed button
        if (speed === 0) {
            this.elements.btnPause.classList.add('active');
        } else if (speed === 1) {
            this.elements.btnPlay.classList.add('active');
        } else if (speed === 2) {
            this.elements.btnFast.classList.add('active');
        }
    }
    
    updateEnvironmentUI() {
        const environment = this.game.environment;
        
        // Update season
        this.elements.seasonValue.textContent = capitalizeFirstLetter(environment.season);
        
        // Update temperature
        this.elements.temperatureValue.textContent = `${environment.temperature.toFixed(1)}°C`;
        
        // Update weather
        this.elements.weatherValue.textContent = capitalizeFirstLetter(environment.weather);
    }
    
    buildResourceUI() {
        const resourcesContainer = this.elements.resourceStats;
        resourcesContainer.innerHTML = '';
        
        for (const resourceType in RESOURCE_TYPES) {
            const resourceKey = RESOURCE_TYPES[resourceType];
            const resourceDiv = document.createElement('div');
            resourceDiv.className = 'stat resource-item';
            
            const resourceLabel = document.createElement('span');
            resourceLabel.textContent = formatResourceName(resourceKey);
            
            const resourceValue = document.createElement('span');
            resourceValue.id = `resource-${resourceKey}`;
            resourceValue.textContent = '0';
            
            resourceDiv.appendChild(resourceLabel);
            resourceDiv.appendChild(resourceValue);
            resourcesContainer.appendChild(resourceDiv);
        }
    }
    
    updateResourceUI() {
        const settlement = this.game.settlement;
        
        for (const resourceType in RESOURCE_TYPES) {
            const resourceKey = RESOURCE_TYPES[resourceType];
            const resourceElement = document.getElementById(`resource-${resourceKey}`);
            
            if (resourceElement) {
                resourceElement.textContent = Math.floor(settlement.resources[resourceKey]);
            }
        }
    }
    
    buildPopulationUI() {
        const populationContainer = this.elements.populationStats;
        
        // Update total population and growth
        this.elements.populationTotal.textContent = this.game.settlement.population.total;
        
        // Create population groups section
        const groupsContainer = document.createElement('div');
        groupsContainer.className = 'population-group';
        
        const groupsHeader = document.createElement('h4');
        groupsHeader.textContent = 'Groups';
        groupsContainer.appendChild(groupsHeader);
        
        for (const groupType in this.game.settlement.population.groups) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'stat';
            
            const groupLabel = document.createElement('span');
            groupLabel.textContent = capitalizeFirstLetter(groupType);
            
            const groupValue = document.createElement('span');
            groupValue.id = `population-${groupType}`;
            groupValue.textContent = this.game.settlement.population.groups[groupType];
            
            groupDiv.appendChild(groupLabel);
            groupDiv.appendChild(groupValue);
            groupsContainer.appendChild(groupDiv);
        }
        
        populationContainer.appendChild(groupsContainer);
    }
    
    updatePopulationUI() {
        const settlement = this.game.settlement;
        
        // Update total population
        this.elements.populationTotal.textContent = settlement.population.total;
        
        // Update population growth
        const growthElement = document.getElementById('population-growth');
        if (growthElement) {
            const growth = settlement.population.growth;
            growthElement.textContent = growth > 0 ? `+${growth}` : growth;
            growthElement.style.color = growth >= 0 ? '#2ecc71' : '#e74c3c';
        }
        
        // Update population groups
        for (const groupType in settlement.population.groups) {
            const groupElement = document.getElementById(`population-${groupType}`);
            if (groupElement) {
                groupElement.textContent = settlement.population.groups[groupType];
            }
        }
    }
    
    buildTechnologyUI() {
        const techManager = this.game.technologyManager;
        this.updateTechnologyUI();
    }
    
    updateTechnologyUI() {
        const technologyContainer = this.elements.technologyTree;
        technologyContainer.innerHTML = '';
        
        const techManager = this.game.technologyManager;
        
        // Display discovered technologies
        const discoveredTechs = techManager.getDiscoveredTechnologies();
        if (discoveredTechs.length > 0) {
            const discoveredHeader = document.createElement('h4');
            discoveredHeader.textContent = 'Discovered';
            technologyContainer.appendChild(discoveredHeader);
            
            for (const tech of discoveredTechs) {
                const techDiv = this.createTechnologyElement(tech, 'discovered');
                technologyContainer.appendChild(techDiv);
            }
        }
        
        // Display in-progress technologies
        const inProgressTechs = techManager.getInProgressTechnologies();
        if (inProgressTechs.length > 0) {
            const inProgressHeader = document.createElement('h4');
            inProgressHeader.textContent = 'In Progress';
            technologyContainer.appendChild(inProgressHeader);
            
            for (const tech of inProgressTechs) {
                const techDiv = this.createTechnologyElement(tech, 'in-progress');
                
                // Add progress bar
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                
                const progressFill = document.createElement('div');
                progressFill.className = 'progress-fill';
                progressFill.style.width = `${tech.progressPercent}%`;
                
                progressBar.appendChild(progressFill);
                techDiv.appendChild(progressBar);
                
                technologyContainer.appendChild(techDiv);
            }
        }
        
        // Display available technologies
        const researchableTechs = techManager.getResearchableTechnologies();
        if (researchableTechs.length > 0) {
            const availableHeader = document.createElement('h4');
            availableHeader.textContent = 'Available';
            technologyContainer.appendChild(availableHeader);
            
            for (const tech of researchableTechs) {
                const techDiv = this.createTechnologyElement(tech, 'available');
                
                // Add click event to start research
                techDiv.addEventListener('click', () => {
                    techManager.startResearch(tech.id);
                    this.updateTechnologyUI();
                });
                
                technologyContainer.appendChild(techDiv);
            }
        }
    }
    
    createTechnologyElement(tech, status) {
        const techDiv = document.createElement('div');
        techDiv.className = `technology-item ${status}`;
        techDiv.title = tech.description;
        
        const techName = document.createElement('span');
        techName.textContent = tech.name;
        
        const techPhase = document.createElement('span');
        techPhase.textContent = capitalizeFirstLetter(tech.phase);
        techPhase.className = 'tech-phase';
        
        techDiv.appendChild(techName);
        techDiv.appendChild(techPhase);
        
        return techDiv;
    }
    
    updateEcosystemDisplay() {
        const ecosystem = this.game.ecosystem;
        const display = this.elements.ecosystemDisplay;
        
        display.innerHTML = '';
        
        // Create ecosystem visualization (simple text-based for now)
        const ecosystemInfo = document.createElement('div');
        ecosystemInfo.className = 'ecosystem-info';
        
        // Plants section
        const plantsSection = document.createElement('div');
        plantsSection.className = 'ecosystem-section';
        plantsSection.innerHTML = `
            <h3>Flora</h3>
            <p>Plants: ${ecosystem.plants.quantity}</p>
            <p>Growth Rate: ${(ecosystem.plants.growthRate * 100).toFixed(1)}%</p>
            <p>Diversity: ${ecosystem.plants.diversity}</p>
        `;
        
        // Animals section
        const animalsSection = document.createElement('div');
        animalsSection.className = 'ecosystem-section';
        animalsSection.innerHTML = `
            <h3>Fauna</h3>
            <p>Animals: ${ecosystem.animals.population}</p>
            <p>Reproduction: ${(ecosystem.animals.reproductionRate * 100).toFixed(1)}%</p>
            <p>Diversity: ${ecosystem.animals.diversity}</p>
        `;
        
        // Environment section
        const environmentSection = document.createElement('div');
        environmentSection.className = 'ecosystem-section';
        environmentSection.innerHTML = `
            <h3>Environment</h3>
            <p>Soil Fertility: ${(ecosystem.soilFertility * 100).toFixed(0)}%</p>
            <p>Water Availability: ${(ecosystem.waterAvailability * 100).toFixed(0)}%</p>
            <p>Surface Minerals: ${ecosystem.minerals.availableSurface}</p>
        `;
        
        ecosystemInfo.appendChild(plantsSection);
        ecosystemInfo.appendChild(animalsSection);
        ecosystemInfo.appendChild(environmentSection);
        
        display.appendChild(ecosystemInfo);
    }
    
    updateSettlementDisplay() {
        const settlement = this.game.settlement;
        const display = this.elements.settlementDisplay;
        
        display.innerHTML = '';
        
        // Create settlement visualization
        const settlementInfo = document.createElement('div');
        settlementInfo.className = 'settlement-info';
        
        // Stats section
        const statsSection = document.createElement('div');
        statsSection.className = 'settlement-section';
        statsSection.innerHTML = `
            <h3>Settlement Stats</h3>
            <p>Health: ${settlement.stats.health.toFixed(1)}%</p>
            <p>Happiness: ${settlement.stats.happiness.toFixed(1)}%</p>
            <p>Knowledge: ${settlement.stats.knowledgeLevel.toFixed(1)}</p>
            <p>Efficiency: ${settlement.stats.efficiency.toFixed(2)}x</p>
        `;
        
        // Buildings section
        const buildingsSection = document.createElement('div');
        buildingsSection.className = 'settlement-section';
        buildingsSection.innerHTML = `
            <h3>Buildings</h3>
            <p>Shelter: ${settlement.buildingProgress.shelter.toFixed(1)}%</p>
            <p>Storage: ${settlement.buildingProgress.storageArea.toFixed(1)}%</p>
            <p>Crafting: ${settlement.buildingProgress.craftingArea.toFixed(1)}%</p>
            <p>Research: ${settlement.buildingProgress.researchArea.toFixed(1)}%</p>
        `;
        
        // Activities section
        const activitiesSection = document.createElement('div');
        activitiesSection.className = 'settlement-section';
        activitiesSection.innerHTML = `
            <h3>Activities</h3>
            <p>Gathering: ${(settlement.activityPreferences.gathering * 100).toFixed(1)}%</p>
            <p>Hunting: ${(settlement.activityPreferences.hunting * 100).toFixed(1)}%</p>
            <p>Building: ${(settlement.activityPreferences.building * 100).toFixed(1)}%</p>
            <p>Research: ${(settlement.activityPreferences.researching * 100).toFixed(1)}%</p>
        `;
        
        settlementInfo.appendChild(statsSection);
        settlementInfo.appendChild(buildingsSection);
        settlementInfo.appendChild(activitiesSection);
        
        display.appendChild(settlementInfo);
    }
}

// Event logger
class EventLogger {
    static eventLog = [];
    static maxEvents = 100;
    static debugMode = true; // Enable debug logging
    
    static addEvent(message, type = 'normal') {
        const timestamp = new Date();
        const formattedTime = `Day ${Game.instance ? Game.instance.environment.daysPassed.toFixed(1) : 0}`;
        
        const event = {
            message,
            type,
            time: formattedTime,
            timestamp
        };
        
        this.eventLog.unshift(event);
        
        // Limit the number of events
        if (this.eventLog.length > this.maxEvents) {
            this.eventLog.pop();
        }
        
        // Log to console for debugging
        if (this.debugMode) {
            const consoleMsg = `[${formattedTime}] ${message}`;
            if (type === 'error') {
                console.error(consoleMsg);
            } else if (type === 'warning') {
                console.warn(consoleMsg);
            } else if (type === 'debug') {
                console.debug(consoleMsg);
            } else {
                console.log(consoleMsg);
            }
        }
        
        // Update the UI if event log element exists
        this.updateEventLogUI();
    }
    
    static logError(error, context = '') {
        let errorMessage;
        if (error instanceof Error) {
            errorMessage = `${context} Error: ${error.message}`;
            // Log stack trace to console but not to UI
            if (this.debugMode) {
                console.error(error);
            }
        } else {
            errorMessage = `${context} Error: ${error}`;
        }
        this.addEvent(errorMessage, 'error');
    }
    
    static logDebug(message) {
        if (this.debugMode) {
            this.addEvent(message, 'debug');
        }
    }
    
    static updateEventLogUI() {
        const eventLogElement = document.getElementById('event-log');
        if (!eventLogElement) {
            // Don't attempt to update UI if element doesn't exist yet
            return;
        }
        
        eventLogElement.innerHTML = '';
        
        for (const event of this.eventLog) {
            const eventElement = document.createElement('div');
            eventElement.className = `log-entry ${event.type}`;
            
            const timeElement = document.createElement('span');
            timeElement.className = 'log-time';
            timeElement.textContent = event.time;
            
            const messageElement = document.createElement('span');
            messageElement.className = 'log-message';
            messageElement.textContent = event.message;
            
            eventElement.appendChild(timeElement);
            eventElement.appendChild(document.createTextNode(': '));
            eventElement.appendChild(messageElement);
            
            eventLogElement.appendChild(eventElement);
        }
    }
    
    static clearEvents() {
        this.eventLog = [];
        this.updateEventLogUI();
    }
}

// Helper functions
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatResourceName(resourceKey) {
    return resourceKey
        .replace(/([A-Z])/g, ' $1') // Insert a space before capital letters
        .replace(/^./, function(str) { return str.toUpperCase(); }); // Capitalize first letter
}