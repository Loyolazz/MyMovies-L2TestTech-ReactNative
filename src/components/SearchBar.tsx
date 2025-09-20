import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, onClear }: SearchBarProps) {
    const showClear = value.trim().length > 0;

    return (
        <View style={styles.container}>
            <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} style={styles.icon} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder ?? 'Buscar filmes'}
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {showClear && (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={onClear} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.card, borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    icon: { marginRight: theme.spacing.sm },
    input: { flex: 1, fontSize: 16, color: theme.colors.text, paddingVertical: 0 },
    clearButton: { marginLeft: theme.spacing.sm },
});
