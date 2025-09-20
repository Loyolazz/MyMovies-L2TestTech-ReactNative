import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovies } from '../context/MoviesContext';
import { fetchPopularMovies, searchMovies } from '../services/tmdb';
import { Movie } from '../types/movie';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { ScheduleModal } from '../components/ScheduleModal';
import { theme } from '../theme';

export function CatalogScreen() {
    const { records, toggleWatched, toggleWantToWatch, scheduleMovie, removeSchedule } = useMovies();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const [mode, setMode] = useState<'popular' | 'search'>('popular');
    const [error, setError] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const searchRequestId = useRef(0);

    const loadPopular = useCallback(async (pageToLoad = 1, append = false) => {
        try {
            setError(null);
            append ? setLoadingMore(true) : setLoading(true);

            const response = await fetchPopularMovies(pageToLoad);
            setMovies((curr) => (append ? [...curr, ...response.results] : response.results));
            setPage(response.page);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.warn('Erro ao carregar catálogo', err);
            setError('Não foi possível carregar os filmes. Tente novamente mais tarde.');
        } finally {
            append ? setLoadingMore(false) : setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const performSearch = useCallback(async (text: string, pageToLoad = 1, append = false) => {
        if (!text) {
            setMovies([]);
            setPage(1);
            setTotalPages(1);
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
            return;
        }

        const currentRequestId = ++searchRequestId.current;
        try {
            setError(null);
            append ? setLoadingMore(true) : setLoading(true);

            const response = await searchMovies(text, pageToLoad);
            if (searchRequestId.current !== currentRequestId) return;

            setMovies((curr) => (append ? [...curr, ...response.results] : response.results));
            setPage(response.page);
            setTotalPages(response.totalPages);
            if (!append && response.results.length === 0) setError('Nenhum filme encontrado para esta busca.');
        } catch (err) {
            if (searchRequestId.current !== currentRequestId) return;
            console.warn('Erro na busca de filmes', err);
            setError('Não foi possível buscar os filmes agora.');
            if (!append) setMovies([]);
        } finally {
            if (searchRequestId.current === currentRequestId) {
                append ? setLoadingMore(false) : setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => { loadPopular(1); }, [loadPopular]);

    useEffect(() => {
        const trimmed = query.trim();
        const h = setTimeout(() => {
            if (!trimmed) {
                setActiveQuery('');
                if (mode === 'search') {
                    setMode('popular');
                    searchRequestId.current += 1;
                    loadPopular(1);
                }
            } else if (trimmed !== activeQuery) {
                setActiveQuery(trimmed);
                if (mode !== 'search') setMode('search');
                performSearch(trimmed, 1);
            }
        }, 400);
        return () => clearTimeout(h);
    }, [query, mode, activeQuery, loadPopular, performSearch]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        if (mode === 'search' && activeQuery) performSearch(activeQuery, 1);
        else loadPopular(1);
    }, [mode, activeQuery, loadPopular, performSearch]);

    const handleLoadMore = useCallback(() => {
        if (loadingMore || loading || page >= totalPages) return;
        if (mode === 'search') {
            if (!activeQuery) return;
            performSearch(activeQuery, page + 1, true);
        } else {
            loadPopular(page + 1, true);
        }
    }, [mode, loadingMore, loading, page, totalPages, loadPopular, performSearch, activeQuery]);

    const scheduledMovieId = selectedMovie?.id ?? null;
    const scheduledInitialDate = scheduledMovieId ? records[scheduledMovieId]?.scheduledAt : undefined;

    const headerSubtitle = useMemo(() => {
        if (mode === 'search' && query.trim().length > 0) {
            if (movies.length === 0) return 'Nada encontrado. Tente ajustar os termos da busca.';
            return `Resultados para "${query.trim()}"`;
        }
        return 'Confira os destaques do momento.';
    }, [mode, query, movies.length]);

    const keyExtractor = (item: Movie) => item.id.toString();

    const renderMovie = ({ item }: { item: Movie }) => {
        const record = records[item.id];
        return (
            <View style={styles.cardWrapper}>
                <MovieCard
                    movie={item}
                    watched={record?.watched ?? false}
                    wantToWatch={record?.wantToWatch ?? false}
                    scheduledAt={record?.scheduledAt}
                    onToggleWatched={() => toggleWatched(item)}
                    onToggleWantToWatch={() => toggleWantToWatch(item)}
                    onSchedulePress={() => setSelectedMovie(item)}
                    onRemoveSchedule={record?.scheduledAt ? () => removeSchedule(item.id) : undefined}
                />
            </View>
        );
    };

    const listEmptyComponent = useMemo(() => {
        if (loading)
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                </View>
            );
        if (error)
            return <EmptyState icon="warning-outline" title={error} message="Tente novamente mais tarde." />;
        return (
            <EmptyState
                title="Nenhum filme encontrado"
                message="Comece buscando por um título ou explore os destaques."
            />
        );
    }, [loading, error]);

    const listFooterComponent = useMemo(
        () =>
            !loadingMore ? null : (
                <View style={styles.loadingMore}>
                    <ActivityIndicator color={theme.colors.primary} />
                </View>
            ),
        [loadingMore],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>MyMovies</Text>
                <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
                <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Buscar filmes" />
            </View>

            <FlatList
                data={movies}
                keyExtractor={keyExtractor}
                renderItem={renderMovie}
                contentContainerStyle={styles.listContent}
                onEndReachedThreshold={0.5}
                onEndReached={handleLoadMore}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={listFooterComponent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews
                updateCellsBatchingPeriod={50}
            />

            <ScheduleModal
                visible={Boolean(selectedMovie)}
                movieTitle={selectedMovie?.title ?? ''}
                initialDate={scheduledInitialDate}
                onClose={() => setSelectedMovie(null)}
                onConfirm={async (date, addToCalendar) => {
                    if (!selectedMovie) return;
                    await scheduleMovie(selectedMovie, date, { addToCalendar });
                    setSelectedMovie(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.primary,
        borderBottomLeftRadius: theme.radius.lg,
        borderBottomRightRadius: theme.radius.lg,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 14, color: '#ffe4f2', marginBottom: theme.spacing.xs },

    listContent: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        gap: theme.spacing.lg,
    },

    cardWrapper: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 3,
    },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
    loadingMore: { paddingVertical: theme.spacing.md },
});
