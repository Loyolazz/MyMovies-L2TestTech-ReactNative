import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Movie, MovieRecord } from '../types/movie';

interface MoviesContextValue {
  records: Record<number, MovieRecord>;
  isLoading: boolean;
  toggleWatched: (movie: Movie) => void;
  toggleWantToWatch: (movie: Movie) => void;
  scheduleMovie: (movie: Movie, date: Date, options?: { addToCalendar?: boolean }) => Promise<void>;
  removeSchedule: (movieId: number) => Promise<void>;
}

const STORAGE_KEY = '@mymovies:records';
const DEFAULT_EVENT_DURATION = 2 * 60 * 60 * 1000;

const MoviesContext = createContext<MoviesContextValue | undefined>(undefined);

const ensureRecordShape = (movie: Movie, base?: MovieRecord): MovieRecord => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview ?? base?.overview,
  posterPath: movie.posterPath ?? base?.posterPath ?? null,
  backdropPath: movie.backdropPath ?? base?.backdropPath ?? null,
  releaseDate: movie.releaseDate ?? base?.releaseDate,
  voteAverage: movie.voteAverage ?? base?.voteAverage,
  watched: base?.watched ?? false,
  wantToWatch: base?.wantToWatch ?? false,
  scheduledAt: base?.scheduledAt,
  calendarEventId: base?.calendarEventId,
});

const shouldKeepRecord = (record: MovieRecord): boolean =>
  record.watched || record.wantToWatch || Boolean(record.scheduledAt);

async function getWritableCalendarId(): Promise<string | null> {
  try {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar?.allowsModifications) {
      return defaultCalendar.id;
    }
  } catch (error) {
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((calendar) => calendar.allowsModifications);
  return writable?.id ?? null;
}

export function MoviesProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record<number, MovieRecord>>({});
  const [isLoading, setIsLoading] = useState(true);
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Record<number, MovieRecord> = JSON.parse(stored);
          setRecords(parsed);
          recordsRef.current = parsed;
        }
      } catch (error) {
        console.warn('Não foi possível carregar os dados salvos', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const persistRecords = useCallback(async (next: Record<number, MovieRecord>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Não foi possível salvar os dados localmente', error);
    }
  }, []);

  const updateRecord = useCallback(
    (movie: Movie, updater: (current: MovieRecord) => MovieRecord | undefined) => {
      setRecords((current) => {
        const existing = current[movie.id];
        const base = ensureRecordShape(movie, existing);
        const updated = updater(base);
        const nextState = { ...current };

        if (updated && shouldKeepRecord(updated)) {
          nextState[movie.id] = updated;
        } else {
          delete nextState[movie.id];
        }

        persistRecords(nextState);
        return nextState;
      });
    },
    [persistRecords],
  );

  const toggleWatched = useCallback(
    (movie: Movie) => {
      const record = recordsRef.current[movie.id];
      const nextWatched = !(record?.watched ?? false);

      if (nextWatched && record?.calendarEventId && Platform.OS !== 'web') {
        Calendar.deleteEventAsync(record.calendarEventId, { futureEvents: false }).catch((error) => {
          console.warn('Não foi possível remover o evento do calendário ao marcar como assistido', error);
        });
      }

      updateRecord(movie, (current) => ({
        ...current,
        watched: nextWatched,
        wantToWatch: nextWatched ? false : current.wantToWatch,
        scheduledAt: nextWatched ? undefined : current.scheduledAt,
        calendarEventId: nextWatched ? undefined : current.calendarEventId,
      }));
    },
    [updateRecord],
  );

  const toggleWantToWatch = useCallback(
    (movie: Movie) => {
      updateRecord(movie, (current) => ({
        ...current,
        wantToWatch: !current.wantToWatch,
      }));
    },
    [updateRecord],
  );

  const createOrUpdateCalendarEvent = useCallback(
    async (movie: Movie, date: Date, existingEventId?: string) => {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Agendamento salvo',
          'A integração com a agenda não está disponível no navegador, mas o lembrete foi salvo no app.',
        );
        return existingEventId;
      }

      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Sem permissão para acessar o calendário. O agendamento ficará salvo apenas no aplicativo.',
        );
        return existingEventId;
      }

      const calendarId = await getWritableCalendarId();
      if (!calendarId) {
        Alert.alert('Calendário indisponível', 'Não foi possível encontrar um calendário editável no dispositivo.');
        return existingEventId;
      }

      const endDate = new Date(date.getTime() + DEFAULT_EVENT_DURATION);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
      const details: Omit<Partial<Calendar.Event>, 'id'> = {
        title: `Assistir ${movie.title}`,
        startDate: date,
        endDate,
        timeZone,
        notes: movie.overview ?? '',
      };

      try {
        if (existingEventId) {
          await Calendar.updateEventAsync(existingEventId, details);
          return existingEventId;
        }

        const eventId = await Calendar.createEventAsync(calendarId, details);
        Alert.alert('Lembrete criado', 'O filme foi adicionado à sua agenda.');
        return eventId;
      } catch (error) {
        console.warn('Não foi possível criar o evento no calendário', error);
        Alert.alert(
          'Erro ao criar evento',
          'O agendamento foi salvo, mas não pôde ser adicionado à agenda. Tente novamente mais tarde.',
        );
        return existingEventId;
      }
    },
    [],
  );

  const scheduleMovie = useCallback(
    async (movie: Movie, date: Date, options?: { addToCalendar?: boolean }) => {
      let calendarEventId = recordsRef.current[movie.id]?.calendarEventId;

      if (options?.addToCalendar ?? true) {
        calendarEventId = await createOrUpdateCalendarEvent(movie, date, calendarEventId ?? undefined);
      }

      updateRecord(movie, (current) => ({
        ...current,
        scheduledAt: date.toISOString(),
        calendarEventId: calendarEventId ?? current.calendarEventId,
      }));
    },
    [createOrUpdateCalendarEvent, updateRecord],
  );

  const removeSchedule = useCallback(
    async (movieId: number) => {
      const record = recordsRef.current[movieId];
      if (!record) {
        return;
      }

      if (record.calendarEventId && Platform.OS !== 'web') {
        try {
          await Calendar.deleteEventAsync(record.calendarEventId, { futureEvents: false });
        } catch (error) {
          console.warn('Não foi possível remover o evento do calendário', error);
        }
      }

      updateRecord(record, (current) => ({
        ...current,
        scheduledAt: undefined,
        calendarEventId: undefined,
      }));
    },
    [updateRecord],
  );

  const value: MoviesContextValue = {
    records,
    isLoading,
    toggleWatched,
    toggleWantToWatch,
    scheduleMovie,
    removeSchedule,
  };

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}

export function useMovies(): MoviesContextValue {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error('useMovies deve ser utilizado dentro de MoviesProvider');
  }

  return context;
}
