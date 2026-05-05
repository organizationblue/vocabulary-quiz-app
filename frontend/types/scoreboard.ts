export type ScoreUser = {
  id: string;
  username: string;
  displayName: string;
}

export type ScoreEntry = {
  id: string;
  rank: number;
  score: number;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string;
  user: ScoreUser;
}
