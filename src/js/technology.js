// Technology tree and research system
class TechnologyManager {
    constructor(settlement) {
        this.settlement = settlement;
        this.techTree = JSON.parse(JSON.stringify(technologyTree));
        
        // Initialize tech status
        for (const techId in this.techTree) {
            if (this.settlement.discoveredTechnologies.has(techId)) {
                this.techTree[techId].discovered = true;
            }
            
            if (this.settlement.inProgressTechnologies.has(techId)) {
                this.techTree[techId].inProgress = true;
            }
        }
    }
    
    getResearchableTechnologies() {
        const researchable = [];
        
        for (const [techId, tech] of Object.entries(this.techTree)) {
            // Skip if already discovered or in progress
            if (tech.discovered || tech.inProgress) continue;
            
            // Check if requirements are met
            let requirementsMet = true;
            for (const [reqTech, needed] of Object.entries(tech.requirements)) {
                if (needed && !this.settlement.discoveredTechnologies.has(reqTech)) {
                    requirementsMet = false;
                    break;
                }
            }
            
            if (requirementsMet) {
                researchable.push({
                    id: techId,
                    ...tech
                });
            }
        }
        
        return researchable;
    }
    
    getInProgressTechnologies() {
        const inProgress = [];
        
        for (const techId of this.settlement.inProgressTechnologies) {
            inProgress.push({
                id: techId,
                ...this.techTree[techId]
            });
        }
        
        return inProgress;
    }
    
    getDiscoveredTechnologies() {
        const discovered = [];
        
        for (const techId of this.settlement.discoveredTechnologies) {
            discovered.push({
                id: techId,
                ...this.techTree[techId]
            });
        }
        
        return discovered;
    }
    
    startResearch(techId) {
        const tech = this.techTree[techId];
        
        // Check if already discovered or in progress
        if (tech.discovered || tech.inProgress) return false;
        
        // Check if requirements are met
        let requirementsMet = true;
        for (const [reqTech, needed] of Object.entries(tech.requirements)) {
            if (needed && !this.settlement.discoveredTechnologies.has(reqTech)) {
                requirementsMet = false;
                break;
            }
        }
        
        if (!requirementsMet) return false;
        
        // Check if we have enough resources to start
        for (const [resource, amount] of Object.entries(tech.resourceCost)) {
            const initialCost = Math.ceil(amount * 0.1); // Initial cost to start research
            if (this.settlement.resources[resource] < initialCost) {
                return false;
            }
        }
        
        // Consume initial resources
        for (const [resource, amount] of Object.entries(tech.resourceCost)) {
            const initialCost = Math.ceil(amount * 0.1);
            this.settlement.resources[resource] -= initialCost;
        }
        
        // Start research
        tech.inProgress = true;
        tech.progressPercent = 0;
        this.settlement.inProgressTechnologies.add(techId);
        
        EventLogger.addEvent(`Started researching ${tech.name}`);
        return true;
    }
    
    cancelResearch(techId) {
        const tech = this.techTree[techId];
        
        // Check if in progress
        if (!tech.inProgress) return false;
        
        // Cancel research
        tech.inProgress = false;
        tech.progressPercent = 0;
        this.settlement.inProgressTechnologies.delete(techId);
        
        EventLogger.addEvent(`Cancelled research on ${tech.name}`);
        return true;
    }
    
    getTechnologyByPhase(phase) {
        const techsByPhase = [];
        
        for (const [techId, tech] of Object.entries(this.techTree)) {
            if (tech.phase === phase) {
                techsByPhase.push({
                    id: techId,
                    ...tech
                });
            }
        }
        
        return techsByPhase;
    }
}