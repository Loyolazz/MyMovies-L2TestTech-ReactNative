import { memo } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Movie } from '@/types/movie';
import { formatDate, formatDateTime, sanitizeOverview } from '@/utils/formatters';
import { theme } from '@/theme';

type MovieCardVariant = 'default' | 'watched' | 'want' | 'scheduled';

interface MovieCardProps {
    movie: Movie;
    watched: boolean;
    wantToWatch: boolean;
    scheduledAt?: string;
    onToggleWatched: () => void;
    onToggleWantToWatch: () => void;
    onSchedulePress: () => void;
    onRemoveSchedule?: () => void;
    variant?: MovieCardVariant;
}

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const BUTTON_HEIGHT = 44;
const BUTTON_RADIUS = BUTTON_HEIGHT / 2;

function MovieCardComponent({
                                movie,
                                watched,
                                wantToWatch,
                                scheduledAt,
                                onToggleWatched,
                                onToggleWantToWatch,
                                onSchedulePress,
                                onRemoveSchedule,
                                variant = 'default',
                            }: MovieCardProps) {
    const posterUri = movie.posterPath ? `${POSTER_BASE_URL}${movie.posterPath}` : undefined;
    const rating = movie.voteAverage ? movie.voteAverage.toFixed(1) : 'N/A';

    const isCatalog = variant === 'default';
    const showWantButton = isCatalog || variant === 'want' || variant === 'watched';
    const showScheduleButton = (variant === 'default' || variant === 'want') && wantToWatch;
    const showScheduleInfo = variant === 'scheduled' && Boolean(scheduledAt);
    const showRemoveSchedule = variant === 'scheduled' && Boolean(scheduledAt) && Boolean(onRemoveSchedule);

    const isScheduled = Boolean(scheduledAt);
    const scheduleLabel = isScheduled ? 'Agendado' : 'Agendar';
    const scheduleIcon: keyof typeof Ionicons.glyphMap = isScheduled ? 'time' : 'time-outline';

    return (
        <View style={styles.container}>
            <View style={styles.posterWrapper}>
                {posterUri ? (
                    <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
                ) : (
                    <View style={styles.posterPlaceholder}>
                        <Ionicons name="film-outline" size={36} color={theme.colors.textSecondary} />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>

                    <View style={styles.watchedControl}>
                        <TouchableOpacity
                            style={[styles.watchedButton, watched && styles.watchedButtonActive]}
                            onPress={onToggleWatched}
                            accessibilityRole="button"
                            accessibilityLabel={watched ? 'Marcar como não assistido' : 'Marcar como assistido'}
                        >
                            <Ionicons
                                name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                size={24}
                                color={watched ? '#ffffff' : theme.statusColors.watched}
                            />
                        </TouchableOpacity>
                        <Text style={[styles.watchedLabel, watched && styles.watchedLabelActive]}>Assistido</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="star" size={16} color={theme.colors.accent} />
                        <Text style={styles.metaText}>Nota {rating}</Text>
                    </View>

                    {movie.releaseDate && (
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                            <Text style={styles.metaText}>Lançamento {formatDate(movie.releaseDate)}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.overview} numberOfLines={3}>{sanitizeOverview(movie.overview)}</Text>

                {showScheduleInfo && scheduledAt && (
                    <View style={styles.scheduleInfo}>
                        <Ionicons name="alarm" size={16} color={theme.statusColors.scheduled} />
                        <Text style={styles.scheduleText}>Agendado para {formatDateTime(scheduledAt)}</Text>
                    </View>
                )}

                {showWantButton && (
                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={[styles.halfButton, styles.wantButton, wantToWatch && styles.wantButtonActive]}
                            onPress={onToggleWantToWatch}
                            accessibilityRole="button"
                            accessibilityLabel={wantToWatch ? 'Remover de quero assistir' : 'Adicionar em quero assistir'}
                        >
                            <Ionicons
                                name={wantToWatch ? 'bookmark' : 'bookmark-outline'}
                                size={18}
                                color={wantToWatch ? '#ffffff' : theme.statusColors.wantToWatch}
                            />
                            <Text style={[styles.halfButtonText, styles.wantText, wantToWatch && styles.halfButtonTextActive]}>
                                Quero ver
                            </Text>
                        </TouchableOpacity>
                        {showScheduleButton && (
                            <TouchableOpacity
                                style={[
                                    styles.halfButton,
                                    styles.scheduleButton,
                                    isScheduled && styles.scheduleButtonActive,
                                ]}
                                onPress={onSchedulePress}
                                accessibilityRole="button"
                                accessibilityLabel="Agendar horário para assistir"
                            >
                                <Ionicons
                                    name={scheduleIcon}
                                    size={18}
                                    color={isScheduled ? '#ffffff' : theme.statusColors.scheduled}
                                />
                                <Text
                                    style={[
                                        styles.halfButtonText,
                                        styles.scheduleTextBtn,
                                        isScheduled && styles.halfButtonTextActive,
                                    ]}
                                >
                                    {scheduleLabel}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {showRemoveSchedule && scheduledAt && onRemoveSchedule && (
                    <TouchableOpacity style={styles.removeScheduleButton} onPress={onRemoveSchedule}>
                        <Text style={styles.removeScheduleText}>Remover agendamento</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const arePropsEqual = (prev: MovieCardProps, next: MovieCardProps) =>
    prev.movie.id === next.movie.id &&
    prev.movie.title === next.movie.title &&
    prev.movie.overview === next.movie.overview &&
    prev.movie.posterPath === next.movie.posterPath &&
    prev.movie.backdropPath === next.movie.backdropPath &&
    prev.movie.releaseDate === next.movie.releaseDate &&
    prev.movie.voteAverage === next.movie.voteAverage &&
    prev.watched === next.watched &&
    prev.wantToWatch === next.wantToWatch &&
    prev.scheduledAt === next.scheduledAt &&
    prev.variant === next.variant;

export const MovieCard = memo(MovieCardComponent, arePropsEqual);
MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    posterWrapper: {
        width: 108,
        height: 162,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        backgroundColor: theme.colors.muted,
    },
    poster: { width: '100%', height: '100%' },
    posterPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    content: { flex: 1, gap: theme.spacing.sm },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm },
    title: { flex: 1, fontSize: 18, fontWeight: '800', color: theme.colors.text },
    watchedControl: { alignItems: 'center', gap: 4 },
    watchedButton: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: theme.statusColors.watched, backgroundColor: '#fff',
    },
    watchedButtonActive: { backgroundColor: theme.statusColors.watched },
    watchedLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    watchedLabelActive: { color: theme.statusColors.watched },

    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, alignItems: 'center' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
    metaText: { color: theme.colors.textSecondary, fontSize: 14, flexShrink: 1 },

    overview: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },

    scheduleInfo: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#e0f2fe',
        paddingHorizontal: theme.spacing.sm, paddingVertical: 4,
        borderRadius: theme.radius.sm, alignSelf: 'flex-start',
    },
    scheduleText: { color: theme.statusColors.scheduled, fontSize: 13, fontWeight: '500' },

    footerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },

    halfButton: {
        flex: 1,
        height: BUTTON_HEIGHT,
        borderRadius: BUTTON_RADIUS,
        paddingHorizontal: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minWidth: 0,
    },
    halfButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    halfButtonTextActive: { color: '#fff' },
    wantButton: {
        backgroundColor: `${theme.statusColors.wantToWatch}22`,
    },
    wantButtonActive: {
        backgroundColor: theme.statusColors.wantToWatch,
    },
    wantText: {
        color: theme.statusColors.wantToWatch,
    },

    scheduleButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: theme.statusColors.scheduled,
    },
    scheduleButtonActive: {
        backgroundColor: theme.statusColors.scheduled,
        borderColor: theme.statusColors.scheduled,
    },
    scheduleTextBtn: {
        color: theme.statusColors.scheduled,
    },

    removeScheduleButton: { marginTop: -4, alignSelf: 'flex-start' },
    removeScheduleText: { color: theme.colors.textSecondary, textDecorationLine: 'underline', fontSize: 13 },
});
