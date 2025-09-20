import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMovies } from '@/context/MoviesContext';
import { SummaryCard } from '@/components/SummaryCard';
import { MovieCard } from '@/components/MovieCard';
import { EmptyState } from '@/components/EmptyState';
import { ScheduleModal } from '@/components/ScheduleModal';
import { MovieRecord } from '@/types/movie';
import { theme } from '@/theme';

export function PersonalScreen() {
    const { records, toggleWatched, toggleWantToWatch, scheduleMovie, removeSchedule } = useMovies();
    const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

    const { watchedList, wantList, scheduledList } = useMemo(() => {
        const values = Object.values(records);
        return {
            watchedList: values.filter((i) => i.watched),
            wantList: values.filter((i) => i.wantToWatch),
            scheduledList: values
                .filter((i) => Boolean(i.scheduledAt))
                .sort((a, b) => {
                    const fa = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                    const fb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                    return fa - fb;
                }),
        };
    }, [records]);

    const counts = useMemo(
        () => ({ watched: watchedList.length, want: wantList.length, scheduled: scheduledList.length }),
        [watchedList.length, wantList.length, scheduledList.length],
    );

    const selectedRecord: MovieRecord | undefined = selectedMovieId ? records[selectedMovieId] : undefined;

    const renderRecordCard = (record: MovieRecord, prefix: string, variant: 'watched' | 'want' | 'scheduled') => (
        <View key={`${prefix}-${record.id}`} style={styles.cardWrapper}>
            <MovieCard
                movie={record}
                watched={record.watched}
                wantToWatch={record.wantToWatch}
                scheduledAt={record.scheduledAt}
                onToggleWatched={() => toggleWatched(record)}
                onToggleWantToWatch={() => toggleWantToWatch(record)}
                onSchedulePress={() => setSelectedMovieId(record.id)}
                onRemoveSchedule={record.scheduledAt ? () => removeSchedule(record.id) : undefined}
                variant={variant}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.topbar}>
                <Text style={styles.topbarTitle}>MyMovies</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                scrollIndicatorInsets={{ bottom: 24 }}
            >
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Gerenciamento pessoal</Text>
                    <Text style={styles.headerSubtitle}>
                        Acompanhe seus filmes, pendências e lembretes agendados em um só lugar.
                    </Text>
                </View>

                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Seu painel pessoal</Text>
                    <View style={styles.panelCards}>
                        <SummaryCard label="Assistidos" value={counts.watched} icon="checkmark-done-outline" color={theme.statusColors.watched} />
                        <SummaryCard label="Quero ver" value={counts.want} icon="bookmark-outline" color={theme.statusColors.wantToWatch} />
                        <SummaryCard label="Agendados" value={counts.scheduled} icon="time-outline" color={theme.statusColors.scheduled} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Já assistidos</Text>
                    {counts.watched === 0 ? (
                        <EmptyState title="Você ainda não marcou nada como assistido." />
                    ) : (
                        watchedList.map((r) => renderRecordCard(r, 'watched', 'watched'))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quero assistir</Text>
                    {counts.want === 0 ? (
                        <EmptyState title="Nenhum filme salvo para ver depois." />
                    ) : (
                        wantList.map((r) => renderRecordCard(r, 'want', 'want'))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Agendados</Text>
                    {counts.scheduled === 0 ? (
                        <EmptyState title="Nenhum horário reservado." />
                    ) : (
                        scheduledList.map((r) => renderRecordCard(r, 'scheduled', 'scheduled'))
                    )}
                </View>
            </ScrollView>

            <ScheduleModal
                visible={Boolean(selectedRecord)}
                movieTitle={selectedRecord?.title ?? ''}
                initialDate={selectedRecord?.scheduledAt}
                onClose={() => setSelectedMovieId(null)}
                onConfirm={async (date, addToCalendar) => {
                    if (!selectedRecord) return;
                    await scheduleMovie(selectedRecord, date, { addToCalendar });
                    setSelectedMovieId(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    topbar: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomLeftRadius: theme.radius.lg,
        borderBottomRightRadius: theme.radius.lg,
    },
    topbarTitle: { fontSize: 28, fontWeight: '800', color: '#fff' },

    content: { paddingBottom: 120 },

    headerText: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, gap: theme.spacing.xs },
    headerTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
    headerSubtitle: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },

    panel: {
        marginTop: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
        backgroundColor: '#fff',
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 12 }, shadowRadius: 24, elevation: 4,
    },
    panelTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
    panelCards: { flexDirection: 'row', gap: theme.spacing.md },

    section: { marginTop: theme.spacing.lg, paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },

    cardWrapper: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 3,
        marginBottom: theme.spacing.md,
    },
});
