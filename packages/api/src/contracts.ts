export interface JobSearchResult {
  id: string;
  title: string;
  agency: string;
  location: string;
}

export interface JobDetail extends JobSearchResult {
  description: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
}
