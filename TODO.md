# TODO: Implement Step-by-Step Water Quality Registration Wizard

## Overview
Modify the WaterQualityRegistration component to implement a step-by-step wizard for registering water quality parameters, starting with tank selection, followed by critical parameters, and progressing through other parameter groups to create a continuous, non-tedious process.

## Steps to Complete

### 1. Update Modal Structure
- Add a step indicator/progress bar at the top of the modal
- Show current step number and total steps
- Highlight completed steps

### 2. Implement Step-Based Rendering
- Conditionally render content based on `currentStep`
- Step 0: Tank Selection
- Step 1: Critical Parameters (Temperature, Oxygenation, pH)
- Step 2: Daily Parameters (Salinity, Ammonia, Nitrite, Turbidity, ORP)
- Step 3: Weekly Parameters (Nitrate, Alkalinity)
- Step 4: Occasional Parameters (CO2)
- Step 5: Inspection Details (Dates, Responsible, Notes)

### 3. Add Navigation Controls
- Previous/Next buttons
- Disable Next if current step validation fails
- Show Submit button only on last step
- Auto-advance to next step after tank selection

### 4. Update Validation Logic
- Ensure `validateStep` function works for each step
- Provide feedback for invalid fields

### 5. Test the Wizard
- Run the application
- Test navigation between steps
- Verify form submission works
- Check that data is saved correctly

## Files to Edit
- `auth-system/frontend/src/components/WaterQualityRegistration.jsx`

## Dependencies
- No new dependencies required
- Uses existing state management and API calls

## Followup Steps
- After implementation, test the wizard functionality
- Ensure smooth user experience without tedium
- Verify all parameters are captured correctly
