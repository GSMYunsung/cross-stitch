export interface GitHubCommitSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: CommitItem[];
}

export interface CommitItem {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: CommitDetails;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: ParentCommit[];
  repository: RepositoryDetails;
  score: number;
}

export interface CommitDetails {
  url: string;
  author: CommitUserStats;
  committer: CommitUserStats;
  message: string;
  tree: {
    url: string;
    sha: string;
  };
  comment_count: number;
}

export interface CommitUserStats {
  date: string; // ISO 8601 형식
  name: string;
  email: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface RepositoryDetails {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
}

export interface ParentCommit {
  url: string;
  html_url: string;
  sha: string;
}

export interface StitchFileInfo {
  name: string;
  size: number;
  url: string;
  createdAt: string;
}

export type StitchFileList = StitchFileInfo[] | undefined;
