export interface Movie {
  id: number;
  title: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string;
  voteAverage?: number;
}

export interface MovieRecord extends Movie {
  watched: boolean;
  wantToWatch: boolean;
  scheduledAt?: string;
  calendarEventId?: string;
}
