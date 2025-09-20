import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { formatDate, formatDateTime, formatTime } from '@/utils/formatters';

interface ScheduleModalProps {
  visible: boolean;
  movieTitle: string;
  initialDate?: string;
  onClose: () => void;
  onConfirm: (date: Date, addToCalendar: boolean) => void;
}

const getDefaultDate = () => {
  const now = new Date();
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  now.setHours(now.getHours() + 1);
  return now;
};

export function ScheduleModal({ visible, movieTitle, initialDate, onClose, onConfirm }: ScheduleModalProps) {
  const initial = useMemo(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return getDefaultDate();
  }, [initialDate]);

  const [date, setDate] = useState<Date>(initial);
  const [addToCalendar, setAddToCalendar] = useState(true);

  useEffect(() => {
    if (visible) {
      setDate(initial);
      setAddToCalendar(true);
    }
  }, [visible, initial]);

  const handleChange = (mode: 'date' | 'time') => (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    setDate((current) => {
      const next = new Date(current);
      if (mode === 'date') {
        next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }
      return next;
    });
  };

  const openAndroidPicker = (mode: 'date' | 'time') => {
    DateTimePickerAndroid.open({
      mode,
      is24Hour: true,
      value: date,
      onChange: handleChange(mode),
    });
  };

  const confirmSelection = () => {
    onConfirm(date, addToCalendar);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Agendar sessão</Text>
          <Text style={styles.subtitle}>{movieTitle}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escolha a data e horário</Text>
            {Platform.OS === 'ios' ? (
              <View style={styles.iosPickers}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="inline"
                  onChange={handleChange('date')}
                  minimumDate={new Date()}
                />
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="spinner"
                  onChange={handleChange('time')}
                  minuteInterval={5}
                />
              </View>
            ) : (
              <View style={styles.androidPickers}>
                <TouchableOpacity style={styles.pickerButton} onPress={() => openAndroidPicker('date')}>
                  <Ionicons name="calendar" size={20} color={theme.colors.text} />
                  <Text style={styles.pickerText}>{formatDate(date.toISOString())}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerButton} onPress={() => openAndroidPicker('time')}>
                  <Ionicons name="time" size={20} color={theme.colors.text} />
                  <Text style={styles.pickerText}>{formatTime(date)}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[styles.section, styles.summaryBox]}>
            <Ionicons name="alarm-outline" size={20} color={theme.statusColors.scheduled} />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Lembrete programado</Text>
              <Text style={styles.summaryValue}>{formatDateTime(date)}</Text>
            </View>
          </View>

          <View style={[styles.section, styles.switchRow]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Adicionar na agenda</Text>
              <Text style={styles.switchSubtitle}>
                Tentaremos criar um evento no calendário do seu dispositivo.
              </Text>
            </View>
            <Switch value={addToCalendar} onValueChange={setAddToCalendar} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryAction]} onPress={confirmSelection}>
              <Text style={styles.primaryText}>Salvar lembrete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  iosPickers: {
    gap: theme.spacing.md,
  },
  androidPickers: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pickerText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: '#eff6ff',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  summaryTextContainer: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.statusColors.scheduled,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
    gap: 4,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  switchSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryAction: {
    backgroundColor: theme.statusColors.scheduled,
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
