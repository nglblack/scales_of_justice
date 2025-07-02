class DecisionScale {
    constructor() {
        this.redFlags = [];
        this.greenFlags = [];
        this.flagIdCounter = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.updateTotals();
        this.updateDecision();
        this.updatePanHeights();
    }
    
    initializeElements() {
        this.flagDescription = document.getElementById('flagDescription');
        this.flagWeight = document.getElementById('flagWeight');
        this.weightValue = document.getElementById('weightValue');
        this.flagContext = document.getElementById('flagContext');
        this.addRedBtn = document.getElementById('addRedFlag');
        this.addGreenBtn = document.getElementById('addGreenFlag');
        this.redTotal = document.getElementById('redTotal');
        this.greenTotal = document.getElementById('greenTotal');
        this.redFlagsContainer = document.getElementById('redFlags');
        this.greenFlagsContainer = document.getElementById('greenFlags');
        this.scaleBeam = document.getElementById('scaleBeam');
        this.decisionResult = document.getElementById('decisionResult');
    }
    
    bindEvents() {
        // Weight slider update
        this.flagWeight.addEventListener('input', (e) => {
            this.weightValue.textContent = e.target.value;
        });
        
        // Add flag buttons
        this.addRedBtn.addEventListener('click', () => this.addFlag('red'));
        this.addGreenBtn.addEventListener('click', () => this.addFlag('green'));
        
        // Enter key to add flag (defaults to red)
        this.flagDescription.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addFlag('red');
            }
        });
    }
    
    addFlag(type) {
        const description = this.flagDescription.value.trim();
        const weight = parseInt(this.flagWeight.value);
        const context = this.flagContext.value.trim();
        
        if (!description) {
            this.flagDescription.focus();
            this.flagDescription.style.borderColor = '#e74c3c';
            setTimeout(() => {
                this.flagDescription.style.borderColor = '#ddd';
            }, 2000);
            return;
        }
        
        const flag = {
            id: ++this.flagIdCounter,
            description,
            weight,
            context,
            type
        };
        
        if (type === 'red') {
            this.redFlags.push(flag);
        } else {
            this.greenFlags.push(flag);
        }
        
        this.renderFlag(flag);
        this.clearForm();
        this.updateTotals();
        this.updateScale();
        this.updateDecision();
    }
    
    removeFlag(flagId, type) {
        if (type === 'red') {
            this.redFlags = this.redFlags.filter(flag => flag.id !== flagId);
        } else {
            this.greenFlags = this.greenFlags.filter(flag => flag.id !== flagId);
        }
        
        // Remove any existing tooltips first
        const existingTooltips = document.querySelectorAll('.flag-tooltip');
        existingTooltips.forEach(tooltip => tooltip.remove());
        
        document.getElementById(`flag-${flagId}`).remove();
        this.updateTotals();
        this.updateScale();
        this.updateDecision();
        this.updatePanHeights();
    }
    
    renderFlag(flag) {
        const container = flag.type === 'red' ? this.redFlagsContainer : this.greenFlagsContainer;
        
        const flagElement = document.createElement('div');
        flagElement.className = `flag-block ${flag.type}`;
        flagElement.id = `flag-${flag.id}`;
        flagElement.style.height = `${Math.max(30, flag.weight * 4)}px`;
        flagElement.style.minHeight = '30px';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'flag-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeFlag(flag.id, flag.type);
        };
        
        flagElement.innerHTML = `
            <div style="font-size: ${Math.max(10, 12 - flag.description.length / 10)}px;">
                ${flag.description}
            </div>
        `;
        flagElement.appendChild(removeBtn);
        
        // Add tooltip functionality
        this.addTooltip(flagElement, flag);
        
        container.appendChild(flagElement);
        
        // Update pan heights after adding flag
        this.updatePanHeights();
    }
    
    addTooltip(element, flag) {
        let tooltip = null;
        
        element.addEventListener('mouseenter', (e) => {
            tooltip = document.createElement('div');
            tooltip.className = 'flag-tooltip';
            tooltip.innerHTML = `
                <strong>${flag.description}</strong><br>
                Weight: ${flag.weight}/10
                ${flag.context ? `<br>Context: ${flag.context}` : ''}
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate initial position (above the element)
            let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            let top = rect.top - tooltipRect.height - 10;
            
            // Adjust horizontal position if tooltip goes off screen
            if (left < 10) {
                left = 10;
            } else if (left + tooltipRect.width > viewportWidth - 10) {
                left = viewportWidth - tooltipRect.width - 10;
            }
            
            // If tooltip would go above viewport, show it below instead
            if (top < 10) {
                top = rect.bottom + 10;
                tooltip.classList.add('tooltip-below');
            }
            
            // If still off screen below, position it to the side
            if (top + tooltipRect.height > viewportHeight - 10) {
                top = rect.top + rect.height / 2 - tooltipRect.height / 2;
                
                // Try to position to the right first
                if (rect.right + tooltipRect.width + 15 < viewportWidth) {
                    left = rect.right + 15;
                    tooltip.classList.add('tooltip-right');
                } else {
                    // Position to the left
                    left = rect.left - tooltipRect.width - 15;
                    tooltip.classList.add('tooltip-left');
                }
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            
            setTimeout(() => tooltip.classList.add('show'), 10);
        });
        
        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    }
    
    clearForm() {
        this.flagDescription.value = '';
        this.flagContext.value = '';
        this.flagWeight.value = '5';
        this.weightValue.textContent = '5';
        this.flagDescription.focus();
    }
    
    updateTotals() {
        const redTotal = this.redFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const greenTotal = this.greenFlags.reduce((sum, flag) => sum + flag.weight, 0);
        
        this.redTotal.textContent = redTotal;
        this.greenTotal.textContent = greenTotal;
    }
    
    updateScale() {
        const redTotal = this.redFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const greenTotal = this.greenFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const difference = greenTotal - redTotal; // green - red (positive = tip right)
        
        // Physics-based tipping: more realistic scale behavior
        // Each point of difference = 1.5 degrees of tilt
        // Maximum tilt of 45 degrees for extreme cases
        const degreesPerPoint = 1.5;
        const maxTilt = 45;
        
        let tiltAngle = difference * degreesPerPoint;
        
        // Cap the maximum tilt but allow for dramatic differences
        if (tiltAngle > maxTilt) {
            tiltAngle = maxTilt;
        } else if (tiltAngle < -maxTilt) {
            tiltAngle = -maxTilt;
        }
        
        // Apply smooth rotation with physics-based easing
        this.scaleBeam.style.transform = `rotate(${tiltAngle}deg)`;
        
        // Add visual feedback for extreme tilts
        if (Math.abs(tiltAngle) > 30) {
            this.scaleBeam.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
        } else {
            this.scaleBeam.style.filter = 'none';
        }
    }

    updateDecision() {
        const redTotal = this.redFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const greenTotal = this.greenFlags.reduce((sum, flag) => sum + flag.weight, 0);
        
        let decision = '';
        let className = '';
        
        if (redTotal === 0 && greenTotal === 0) {
            decision = 'Add flags to see recommendation';
            className = 'neutral';
        } else if (greenTotal > redTotal) {
            const margin = greenTotal - redTotal;
            if (margin >= 5) {
                decision = '✅ APPROVE - Strong positive indicators';
            } else {
                decision = '✅ APPROVE - Positive indicators outweigh concerns';
            }
            className = 'approve';
        } else if (redTotal > greenTotal) {
            const margin = redTotal - greenTotal;
            if (margin >= 10) {
                decision = '❌ DENY - Significant concerns identified';
                className = 'deny';
            } else if (margin >= 3) {
                decision = '⚠️ ADD CONDITIONS - Address concerns before proceeding';
                className = 'conditions';
            } else {
                decision = '⚠️ PROCEED WITH CAUTION - Minor concerns present';
                className = 'conditions';
            }
        } else {
            decision = '⚖️ BALANCED - Equal weight, requires additional analysis';
            className = 'neutral';
        }
        
        this.decisionResult.textContent = decision;
        this.decisionResult.className = `decision-result ${className}`;
    }

    calculateFlagsHeight(flags) {
        let totalHeight = 0;
        const gapBetweenFlags = 6;
        
        flags.forEach(flag => {
            const flagHeight = Math.max(30, flag.weight * 4);
            totalHeight += flagHeight + gapBetweenFlags;
        });
        
        return totalHeight;
    }
    
    updatePanHeights() {
        const leftPan = document.getElementById('leftPan');
        const rightPan = document.getElementById('rightPan');
        
        // Calculate required height for each pan based on content
        const redFlagsHeight = this.calculateFlagsHeight(this.redFlags);
        const greenFlagsHeight = this.calculateFlagsHeight(this.greenFlags);
        
        // Set minimum height and add padding for label and spacing
        const minPanHeight = 120;
        const labelAndPadding = 60; // Space for label and padding
        
        const leftPanHeight = Math.max(minPanHeight, redFlagsHeight + labelAndPadding);
        const rightPanHeight = Math.max(minPanHeight, greenFlagsHeight + labelAndPadding);
        
        leftPan.style.height = `${leftPanHeight}px`;
        rightPan.style.height = `${rightPanHeight}px`;
        
        // Calculate the rotation effect on total height needed
        const redTotal = this.redFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const greenTotal = this.greenFlags.reduce((sum, flag) => sum + flag.weight, 0);
        const difference = greenTotal - redTotal;
        const degreesPerPoint = 1.5;
        const maxTilt = 45;
        let tiltAngle = Math.max(-maxTilt, Math.min(maxTilt, difference * degreesPerPoint));
        
        // Calculate additional height needed due to rotation
        const maxPanHeight = Math.max(leftPanHeight, rightPanHeight);
        const beamWidth = 640; // Scale beam width
        const rotationRadians = (Math.abs(tiltAngle) * Math.PI) / 180;
        const additionalHeightFromRotation = (beamWidth / 2) * Math.sin(rotationRadians);
        
        // Update scale container height to accommodate rotation
        const scaleContainer = document.querySelector('.scale-container');
        const containerMinHeight = 200;
        const totalNeededHeight = maxPanHeight + additionalHeightFromRotation + 40;
        scaleContainer.style.minHeight = `${Math.max(containerMinHeight, totalNeededHeight)}px`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DecisionScale();
});