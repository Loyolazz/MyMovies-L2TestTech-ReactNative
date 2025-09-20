const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return 'Data indisponível';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }

  return dateFormatter.format(date);
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) {
    return 'Horário não definido';
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return 'Horário não definido';
  }

  return `${dateFormatter.format(date)} às ${timeFormatter.format(date)}`;
}

export function formatTime(value: Date): string {
  return timeFormatter.format(value);
}

export function sanitizeOverview(overview?: string | null): string {
  if (!overview) {
    return 'Sinopse não disponível.';
  }

  return overview.trim().length > 0 ? overview.trim() : 'Sinopse não disponível.';
}
