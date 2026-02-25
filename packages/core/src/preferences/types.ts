export interface Preferences {
  showPathAdvisorPanel: boolean;
  showSensitiveData: boolean;
  pathAdvisorExpanded: boolean;
}

export const defaultPreferences: Preferences = {
  showPathAdvisorPanel: true,
  showSensitiveData: true,
  pathAdvisorExpanded: false,
};
